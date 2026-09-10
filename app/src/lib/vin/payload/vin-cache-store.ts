import type { Payload } from 'payload'

import type { DecodedVin, VinCacheStore } from '../types'

/**
 * Payload-backed implementation of {@link VinCacheStore}.
 *
 * The only file of the VIN feature that talks to the database, which is why it
 * lives apart from the pure core: the caching decorator in `cache.ts` is unit
 * tested against a fake store, and this adapter is verified end to end instead.
 */

/** Shape of the rows we read back from the collection. */
interface VinDecodeDoc {
  decoded?: DecodedVin | null
}

/**
 * Build a cache store backed by the `vin-decodes` collection.
 *
 * Access is overridden on purpose: the collection is admin-only for humans,
 * but this store runs on behalf of any editor allowed to decode a VIN.
 *
 * @param payload - The Payload instance to query.
 */
export function payloadVinCacheStore(payload: Payload): VinCacheStore {
  return {
    /**
     * Read the decode stored for a squish VIN, if any.
     *
     * @param squish - The squish VIN key.
     */
    read: async (squish: string): Promise<DecodedVin | null> => {
      const result = await payload.find({
        collection: 'vin-decodes',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { squish: { equals: squish } },
      })

      const doc = result.docs[0] as unknown as VinDecodeDoc | undefined
      return doc?.decoded ?? null
    },

    /**
     * Persist a decode under its squish VIN, replacing any previous row.
     *
     * @param props - The entry to store.
     * @param props.decoded - The decoded attributes.
     * @param props.raw - The provider's untranslated payload.
     * @param props.squish - The squish VIN key.
     * @param props.vin - The full VIN this decode came from.
     */
    write: async (props: {
      decoded: DecodedVin
      raw: unknown
      squish: string
      vin: string
    }): Promise<void> => {
      const { decoded, raw, squish, vin } = props

      const data = {
        // Payload types a `json` column as an indexable record, which an
        // interface with fixed keys does not satisfy. The shape is checked at
        // the port, so widening it here loses nothing.
        decoded: decoded as unknown as Record<string, unknown>,
        fetchedAt: new Date().toISOString(),
        raw: raw as Record<string, unknown> | null,
        sampleVin: vin,
        squish,
      }

      const existing = await payload.find({
        collection: 'vin-decodes',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { squish: { equals: squish } },
      })

      const current = existing.docs[0]
      if (current) {
        await payload.update({
          collection: 'vin-decodes',
          data,
          id: current.id,
          overrideAccess: true,
        })
        return
      }

      await payload.create({
        collection: 'vin-decodes',
        data,
        overrideAccess: true,
      })
    },
  }
}
