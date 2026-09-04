/**
 * Cache tags shared by the cached readers in `payload-client.ts` and the Payload
 * hooks that purge them (`hooks/revalidate.ts`).
 *
 * One tag per kind of content the frontend reads. A tag is purged by every
 * collection whose data ends up inside that payload, not only by the obvious
 * one: cars are read at `depth: 2`, so a brand, colour, dealership or media
 * record is embedded in the cached car documents and has to purge `cars` too.
 */
export const CACHE_TAGS = {
  brands: 'brands',
  cars: 'cars',
  cities: 'cities',
  contact: 'contact',
  dealerships: 'dealerships',
  homepage: 'homepage',
  siteSettings: 'site-settings',
} as const
