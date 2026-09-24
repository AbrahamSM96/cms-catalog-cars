import type { CatalogRepository } from './catalog-resolver'
import { resolveCatalogFields } from './catalog-resolver'
import { mapDecodedVin } from './mappers/registry'
import type {
  DecodeFailure,
  DecodeSource,
  FieldSuggestion,
  VinDecoder,
} from './types'
import { normalizeVin } from './vin'

/**
 * The one entry point of the VIN feature.
 *
 * Everything else — the network adapter, the caches, the mappers, the
 * catalogue resolver — is assembled behind this function, so the endpoint and
 * the admin panel depend on a single call and know nothing about vPIC.
 */

/** What a successful decode hands back to the admin. */
export interface VinDecodeReport {
  ok: true
  /** Where the answer came from: `network`, `store` or `memory`. */
  source: DecodeSource
  /** Proposed values, in the order the Cars form shows the fields. */
  suggestions: FieldSuggestion[]
  /** The normalized VIN the report is about. */
  vin: string
}

/** A decode that produced nothing, with the reason the admin explains. */
export interface VinDecodeFailure {
  ok: false
  reason: DecodeFailure
}

/**
 * The order the panel lists proposals in — the order the Cars form asks for
 * them, so applying them top to bottom reads like filling the form by hand.
 */
const FIELD_ORDER = [
  'brand',
  'model',
  'year',
  'version',
  'transmission',
  'fuelType',
  'vehicleType',
  'bodyType',
  'engine',
  'horsepower',
  'cylinders',
  'doors',
  'features',
]

/**
 * Sort proposals into the order of the form, leaving anything unlisted last —
 * which is what a mapper added later gets until its field is listed above.
 *
 * @param suggestions - The proposals to order.
 */
export function inFormOrder(suggestions: FieldSuggestion[]): FieldSuggestion[] {
  return [...suggestions].sort((left, right) => {
    const leftIndex = FIELD_ORDER.indexOf(left.path)
    const rightIndex = FIELD_ORDER.indexOf(right.path)
    return (
      (leftIndex === -1 ? FIELD_ORDER.length : leftIndex) -
      (rightIndex === -1 ? FIELD_ORDER.length : rightIndex)
    )
  })
}

/**
 * Decode a VIN into a list of proposed field values.
 *
 * Nothing here writes anything: the result is a proposal the editor reviews.
 * A VIN that decodes to a brand the catalogue does not sell still yields the
 * technical fields, because those do not depend on the catalogue at all.
 *
 * @param props - Decoding inputs.
 * @param props.decoder - The decoder chain to use.
 * @param props.repo - Read access to the catalogue.
 * @param props.vin - The VIN to decode, normalized or not.
 */
export async function decodeVinToSuggestions(props: {
  decoder: VinDecoder
  repo: CatalogRepository
  vin: string
}): Promise<VinDecodeFailure | VinDecodeReport> {
  const { decoder, repo, vin } = props

  const outcome = await decoder.decode(vin)
  if (!outcome.ok) return { ok: false, reason: outcome.reason }

  const catalogFields = await resolveCatalogFields({
    decoded: outcome.data,
    repo,
  })

  return {
    ok: true,
    source: outcome.source,
    suggestions: inFormOrder([...catalogFields, ...mapDecodedVin(outcome.data)]),
    vin: normalizeVin(vin),
  }
}
