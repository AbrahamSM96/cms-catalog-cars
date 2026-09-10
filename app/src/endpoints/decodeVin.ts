import type { Endpoint, PayloadRequest } from 'payload'
import type { Payload } from 'payload'

import type { VinDecoder } from '../lib/vin/types'

import {
  MEMORY_CACHE_MAX,
  withMemoryCache,
  withStoreCache,
} from '../lib/vin/cache'
import { createRateLimiter } from '../lib/vin/rate-limit'
import { decodeVinToSuggestions } from '../lib/vin/decode-vin'
import { editorsAndAdmins } from '../access'
import { isValidVin, normalizeVin } from '../lib/vin/vin'
import { nhtsaVinDecoder } from '../lib/vin/nhtsa'
import { payloadCatalogRepository } from '../lib/vin/payload/catalog-repository'
import { payloadVinCacheStore } from '../lib/vin/payload/vin-cache-store'

/**
 * `POST /api/cars/decode-vin` — the composition root of the VIN feature.
 *
 * This is where the decoder chain is assembled and where the request is
 * authorized. It deliberately does not live in a `beforeChange` hook: a hook
 * would put a third-party HTTP call in the middle of every save, so a slow
 * vPIC would read to the editor as a form that will not save.
 */

/** How many decodes one account may ask for per minute. */
const RATE_LIMIT_MAX = 30

/** Length of the rate-limit window. */
const RATE_LIMIT_WINDOW_MS = 60_000

/** HTTP status for each way a decode can come back empty. */
const FAILURE_STATUS = {
  'invalid-vin': 400,
  'not-found': 404,
  unavailable: 503,
}

const limiter = createRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
})

/**
 * The decoder chain, built once per process.
 *
 * The memory cache has to outlive the request or it would never hit, and the
 * store beneath it is what carries the cache across restarts and across the
 * several processes a deploy runs.
 */
let decoder: VinDecoder | undefined

/**
 * Get the process-wide decoder, building it on first use.
 *
 * @param payload - The Payload instance backing the durable cache.
 */
function decoderFor(payload: Payload): VinDecoder {
  decoder ??= withMemoryCache(
    withStoreCache(nhtsaVinDecoder(), payloadVinCacheStore(payload)),
    MEMORY_CACHE_MAX
  )
  return decoder
}

/**
 * Read the VIN and the car id out of the request body.
 *
 * @param req - The incoming request.
 */
async function readBody(
  req: PayloadRequest
): Promise<{ carId?: number | string; vin?: string }> {
  try {
    return ((await req.json?.()) ?? {}) as {
      carId?: number | string
      vin?: string
    }
  } catch {
    return {}
  }
}

/**
 * Find another car already registered with this VIN.
 *
 * Not an error — a lot re-lists a car it sold and took back — but the editor
 * should know before capturing the same unit twice.
 *
 * @param props - Lookup parameters.
 * @param props.carId - The car being edited, excluded from the search.
 * @param props.payload - The Payload instance to query.
 * @param props.vin - The normalized VIN to look for.
 */
async function findDuplicate(props: {
  carId?: number | string
  payload: Payload
  vin: string
}): Promise<{ id: number | string; title: string } | null> {
  const { carId, payload, vin } = props

  const result = await payload.find({
    collection: 'cars',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { vin: { equals: vin } },
  })

  const doc = result.docs[0]
  if (!doc) return null
  if (carId !== undefined && String(doc.id) === String(carId)) return null

  return { id: doc.id, title: doc.title ?? vin }
}

/**
 * Reply with a JSON body and a status.
 *
 * @param body - The payload to serialize.
 * @param status - The HTTP status to answer with.
 */
function json(body: unknown, status: number): Response {
  return Response.json(body, { status })
}

export const decodeVinEndpoint: Endpoint = {
  /**
   * Decode a VIN into suggested field values for the Cars form.
   *
   * @param req - The incoming request.
   */
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!editorsAndAdmins({ req })) {
      return json({ ok: false, reason: 'forbidden' }, 403)
    }

    const { carId, vin: rawVin } = await readBody(req)
    if (typeof rawVin !== 'string' || !isValidVin(rawVin)) {
      return json({ ok: false, reason: 'invalid-vin' }, 400)
    }

    if (!limiter.allow(String(req.user?.id), Date.now())) {
      return json({ ok: false, reason: 'rate-limited' }, 429)
    }

    const report = await decodeVinToSuggestions({
      decoder: decoderFor(req.payload),
      repo: payloadCatalogRepository(req.payload),
      vin: rawVin,
    })

    if (!report.ok) return json(report, FAILURE_STATUS[report.reason])

    const duplicate = await findDuplicate({
      carId,
      payload: req.payload,
      vin: normalizeVin(rawVin),
    })

    return json({ ...report, duplicate }, 200)
  },
  method: 'post',
  path: '/decode-vin',
}
