import type {
  DecodedVin,
  DecodeOutcome,
  VinCacheStore,
  VinDecoder,
} from './types'
import { isValidVin, normalizeVin, squishVin } from './vin'

/**
 * Caching decorators for {@link VinDecoder}.
 *
 * Both wrap a decoder and expose the same port, so the composition root can
 * stack them in any order:
 *
 * ```ts
 * withMemoryCache(
 *   withStoreCache(nhtsaVinDecoder(), store),
 *   MEMORY_CACHE_MAX
 * )
 * ```
 *
 * The key is never the full VIN — it is the squish VIN (positions 1-8, 10 and
 * 11), because every unit of the same model, year and plant decodes
 * identically. A dealership loading four Versa 2020 pays for one network call.
 * And since the answer for a given squish cannot change, neither cache needs a
 * TTL or any invalidation.
 */

/**
 * Upper bound of the per-process cache, so a long-lived server cannot grow
 * without limit. Passed in rather than read from module scope so the eviction
 * path is testable without building hundreds of VINs.
 */
export const MEMORY_CACHE_MAX = 500

/**
 * Per-process memoization of decodes, keyed by squish VIN.
 *
 * Cheapest layer and the first one hit. It dies with the process, which is
 * exactly why {@link withStoreCache} sits underneath it.
 *
 * @param inner - The decoder to consult on a miss.
 * @param maxEntries - How many decodes to keep before evicting the oldest.
 */
export function withMemoryCache(
  inner: VinDecoder,
  maxEntries: number
): VinDecoder {
  const entries = new Map<string, DecodedVin>()

  return {
    /**
     * Decode a VIN, answering from memory when its squish is already known.
     *
     * @param rawVin - The VIN to decode, normalized or not.
     */
    decode: async (rawVin: string): Promise<DecodeOutcome> => {
      const vin = normalizeVin(rawVin)

      // The squish drops the check digit, so a mistyped VIN would otherwise
      // collide with the correct one and be answered from the cache.
      if (!isValidVin(vin)) return { ok: false, reason: 'invalid-vin' }

      const key = squishVin(vin)
      const hit = entries.get(key)
      if (hit) return { data: hit, ok: true, source: 'memory' }

      const outcome = await inner.decode(vin)
      if (!outcome.ok) return outcome

      if (entries.size >= maxEntries) {
        const [oldest] = entries.keys()
        entries.delete(oldest as string)
      }
      entries.set(key, outcome.data)

      return outcome
    },
  }
}

/**
 * Durable cache of decodes, keyed by squish VIN.
 *
 * Survives restarts and is shared by every process of the deploy, so the
 * inventory a dealership has already captured keeps answering instantly — even
 * while vPIC is slow or unreachable.
 *
 * @param inner - The decoder to consult on a miss.
 * @param store - Where decodes are persisted.
 */
export function withStoreCache(
  inner: VinDecoder,
  store: VinCacheStore
): VinDecoder {
  return {
    /**
     * Decode a VIN, answering from the store when its squish is already known.
     *
     * @param rawVin - The VIN to decode, normalized or not.
     */
    decode: async (rawVin: string): Promise<DecodeOutcome> => {
      const vin = normalizeVin(rawVin)
      if (!isValidVin(vin)) return { ok: false, reason: 'invalid-vin' }

      const key = squishVin(vin)

      // A cache that is down must slow the feature, never break it.
      const hit = await store.read(key).catch((): null => null)
      if (hit) return { data: hit, ok: true, source: 'store' }

      const outcome = await inner.decode(vin)
      if (!outcome.ok) return outcome

      await store
        .write({ decoded: outcome.data, raw: outcome.raw, squish: key, vin })
        .catch((): void => {})

      return outcome
    },
  }
}
