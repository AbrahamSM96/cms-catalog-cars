import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'

import config from '@payload-config'

import type {
  Brand,
  BrandCount,
  Car,
  CarFilters,
  CarsResponse,
  CatalogFacets,
  City,
  CityFacet,
  Contact,
  Dealership,
  Homepage,
  SiteSettings,
} from '../types/car'

import { CACHE_TAGS } from './cache-tags'
import { parseCarSlug } from './car-slug'

/**
 * Payload Local API client.
 *
 * These functions run only on the server (Server Components / route handlers)
 * and talk to Payload in-process — no HTTP round-trip to our own /api routes
 * (no "fetch-to-self"). getPayload memoizes the instance internally, so calling
 * it per request is cheap.
 *
 * For building image URLs from a media filename, use getImageUrl from
 * "@/lib/images" (client-safe, importable from Client Components).
 *
 * Every reader is a `use cache` scope, so a page render costs a database round
 * trip only on a cache miss. The CMS purges the matching tag on every save
 * (see `hooks/revalidate.ts`), which is what keeps an edit in the admin visible
 * immediately; the `days` lifetime is only the safety net for a purge that
 * never arrived. Callers must therefore reach these from inside a `<Suspense>`
 * boundary, after `connection()`, so the build never needs the database.
 *
 * Errors are logged and rethrown, never converted into an empty result. A query
 * that succeeds with zero rows means the client has not added that content yet
 * and legitimately returns [] or null; a query that throws means the database is
 * unreachable or the schema is missing. Returning [] for the second case makes a
 * broken deploy look like a brand-new one — the page renders, empty, and nothing
 * surfaces the failure. Letting it throw hands the error to Next's error
 * boundary so the deploy fails loudly instead.
 */
function payloadClient(): Promise<Payload> {
  return getPayload({ config })
}

/** Shape of a `find` result with no rows, for the queries worth skipping. */
const EMPTY_CARS_RESPONSE: CarsResponse = {
  docs: [],
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  nextPage: null,
  page: 1,
  pagingCounter: 0,
  prevPage: null,
  totalDocs: 0,
  totalPages: 0,
}

/**
 * Fetch all cars with optional filters.
 *
 * @param filters - optional filters to apply to the query
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.cars)

  try {
    const payload = await payloadClient()

    const and: Where[] = []

    // Brand can be either a numeric id (legacy) or a slug (e.g. "kia").
    if (filters?.brand) {
      if (/^\d+$/.test(filters.brand)) {
        and.push({ brand: { equals: filters.brand } })
      } else {
        and.push({ 'brand.slug': { equals: filters.brand } })
      }
    }
    // A city with no dealerships holds no cars. Answering that without a query
    // also keeps `in: []` — which some adapters read as "no restriction" —
    // from quietly returning the whole catalogue on a city landing page.
    if (filters?.dealershipIds?.length === 0) {
      return EMPTY_CARS_RESPONSE
    }
    if (filters?.dealershipIds) {
      and.push({ dealership: { in: filters.dealershipIds } })
    }
    if (filters?.status) and.push({ status: { equals: filters.status } })
    if (filters?.minPrice)
      and.push({ price: { greater_than_equal: filters.minPrice } })
    if (filters?.maxPrice)
      and.push({ price: { less_than_equal: filters.maxPrice } })
    if (filters?.minYear)
      and.push({ year: { greater_than_equal: filters.minYear } })
    if (filters?.maxYear)
      and.push({ year: { less_than_equal: filters.maxYear } })
    if (filters?.transmission)
      and.push({ transmission: { equals: filters.transmission } })

    // Search across multiple fields (model, version, brand name)
    if (filters?.search) {
      and.push({
        or: [
          { model: { contains: filters.search } },
          { version: { contains: filters.search } },
          { 'brand.name': { contains: filters.search } },
        ],
      })
    }

    const result = await payload.find({
      collection: 'cars',
      depth: 2,
      where: and.length ? { and } : undefined,
    })

    return result as unknown as CarsResponse
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching cars:', error)
    throw error
  }
}

/**
 * Fetch featured cars (featured = true).
 */
export async function getFeaturedCars(): Promise<Car[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.cars)

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'cars',
      depth: 2,
      limit: 6,
      where: {
        and: [
          { featured: { equals: true } },
          { status: { equals: 'available' } },
        ],
      },
    })

    return result.docs as unknown as Car[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching featured cars:', error)
    throw error
  }
}

/**
 * Fetch all cars for the sitemap (unpaginated).
 */
export async function getAllCars(): Promise<Car[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.cars)

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'cars',
      depth: 2,
      // 0 disables the page limit: the sitemap must list every car, and a fixed
      // limit would silently drop the rest once the catalog outgrows it.
      limit: 0,
    })

    return result.docs as unknown as Car[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching all cars:', error)
    throw error
  }
}

/**
 * Fetch a single car by ID.
 *
 * @param id - the car ID to fetch
 */
export async function getCarById(id: string): Promise<Car> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.cars)

  try {
    const payload = await payloadClient()

    const car = await payload.findByID({
      collection: 'cars',
      depth: 2,
      id,
    })

    return car as unknown as Car
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching car:', error)
    throw error
  }
}

/**
 * Fetch a single car by its SEO slug (brand-model-version-year-id).
 * The id is parsed from the last segment of the slug.
 *
 * @param slug - the car slug to fetch
 */
export async function getCarBySlug(slug: string): Promise<Car> {
  const id = parseCarSlug(slug)
  if (!id) {
    throw new Error(`Invalid car slug: ${slug}`)
  }
  return getCarById(id)
}

/**
 * Fetch all brands.
 */
export async function getBrands(): Promise<Brand[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.brands)

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'brands',
      limit: 100,
      sort: 'name', // A→Z alphabetical
    })

    return result.docs as unknown as Brand[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching brands:', error)
    throw error
  }
}

/**
 * The brands and years that actually have a car behind them.
 *
 * The filter bar is built from this instead of from the whole `brands`
 * collection: the CMS holds the entire market catalogue of brands, and offering
 * one that matches no car only leads to an empty result page. Same for years —
 * a fixed 2016→today range advertises years nobody has in stock.
 *
 * Deliberately derived from the *unfiltered* inventory. Recomputing the options
 * from the current result set would remove the option you just picked from the
 * list, leaving no way to undo it without clearing everything.
 */
export async function getCatalogFacets(): Promise<CatalogFacets> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.brands)
  cacheTag(CACHE_TAGS.cars)

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'cars',
      // depth 1 populates the brand relation; select keeps the rest of the
      // document (images, features, financing) out of the query.
      depth: 1,
      limit: 0,
      select: { brand: true, year: true },
    })

    const brandsBySlug = new Map<string, Brand>()
    const years = new Set<number>()

    for (const car of result.docs as unknown as Car[]) {
      if (typeof car.year === 'number') years.add(car.year)
      // A brand that failed to populate comes back as an id, not an object.
      if (car.brand && typeof car.brand === 'object') {
        brandsBySlug.set(car.brand.slug, car.brand)
      }
    }

    return {
      brands: [...brandsBySlug.values()].sort((a, b) =>
        a.name.localeCompare(b.name, 'es')
      ),
      years: [...years].sort((a, b) => b - a),
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching catalog facets:', error)
    throw error
  }
}

/**
 * Read a relationship value as a plain id, whether Payload returned the id or
 * the populated document.
 *
 * @param value - A relationship value at any depth.
 */
function relationId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const { id } = value as { id?: number | string }
    return id === undefined ? null : String(id)
  }
  return String(value)
}

/**
 * Every city, with the inventory behind it and the dealerships to filter by.
 *
 * This is what the `/seminuevos/<ciudad>` pages are built from. Cities with no
 * cars are still returned, with `count: 0` — the caller decides whether a city
 * is worth a published page, and a page that exists but is empty still has to
 * resolve so it can answer with `noindex` instead of a soft 404.
 *
 * Three shallow queries rather than one deep one: a car points at a dealership
 * and the dealership at a city, so populating that chain per car would read the
 * same handful of dealerships hundreds of times. The join is done here, on ids.
 */
export async function getCityFacets(): Promise<CityFacet[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.cars)
  cacheTag(CACHE_TAGS.cities)
  cacheTag(CACHE_TAGS.dealerships)

  try {
    const payload = await payloadClient()

    const [cities, dealerships, cars] = await Promise.all([
      payload.find({ collection: 'cities', depth: 0, limit: 0 }),
      payload.find({
        collection: 'dealerships',
        depth: 0,
        limit: 0,
        select: { address: true },
      }),
      payload.find({
        collection: 'cars',
        depth: 0,
        limit: 0,
        select: { dealership: true },
      }),
    ])

    const facets = new Map<string, CityFacet>()
    for (const city of cities.docs as unknown as City[]) {
      facets.set(String(city.id), { ...city, count: 0, dealershipIds: [] })
    }

    const cityOfDealership = new Map<string, string>()
    for (const dealer of dealerships.docs as unknown as Dealership[]) {
      const cityId = relationId(dealer.address?.city)
      const facet = cityId === null ? undefined : facets.get(cityId)
      if (!facet || cityId === null) continue
      facet.dealershipIds.push(dealer.id)
      cityOfDealership.set(String(dealer.id), cityId)
    }

    for (const car of cars.docs as unknown as Car[]) {
      const dealershipId = relationId(car.dealership)
      if (dealershipId === null) continue
      const cityId = cityOfDealership.get(dealershipId)
      const facet = cityId === undefined ? undefined : facets.get(cityId)
      if (facet) facet.count += 1
    }

    return [...facets.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching city facets:', error)
    throw error
  }
}

/**
 * The brands with inventory at the given dealerships, most stock first.
 *
 * Feeds the cross-links on a city landing page — the links that make
 * `/seminuevos/pachuca/mazda` reachable by a crawler instead of only listed in
 * the sitemap. Offering a brand with no cars in that city would link to an
 * empty page, so the counts come from the same query.
 *
 * @param dealershipIds - The dealerships that make up the city.
 */
export async function getBrandsInCity(
  dealershipIds: (number | string)[]
): Promise<BrandCount[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.brands)
  cacheTag(CACHE_TAGS.cars)

  if (dealershipIds.length === 0) return []

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'cars',
      depth: 1,
      limit: 0,
      select: { brand: true },
      where: { dealership: { in: dealershipIds } },
    })

    const counts = new Map<string, BrandCount>()
    for (const car of result.docs as unknown as Car[]) {
      if (!car.brand || typeof car.brand !== 'object') continue
      const entry = counts.get(car.brand.slug)
      if (entry) {
        entry.count += 1
      } else {
        counts.set(car.brand.slug, { brand: car.brand, count: 1 })
      }
    }

    return [...counts.values()].sort(
      (a, b) =>
        b.count - a.count || a.brand.name.localeCompare(b.brand.name, 'es')
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching brands in city:', error)
    throw error
  }
}

/**
 * Fetch all dealerships (concesionarios) for the locations page.
 */
export async function getDealerships(): Promise<Dealership[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.dealerships)

  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'dealerships',
      depth: 1, // populate the image relation
      limit: 100,
      sort: 'name',
    })

    return result.docs as unknown as Dealership[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching dealerships:', error)
    throw error
  }
}

/**
 * Fetch the Homepage global (hero carousel slides + hero text).
 * Returns null when the client has not configured it yet, so the Hero can fall
 * back to its defaults. A database failure throws rather than returning null.
 */
export async function getHomepage(): Promise<Homepage | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.homepage)

  try {
    const payload = await payloadClient()

    const homepage = await payload.findGlobal({
      depth: 1,
      slug: 'homepage',
    })

    return homepage as unknown as Homepage
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching homepage:', error)
    throw error
  }
}

/**
 * Fetch the Contact global (phone, WhatsApp, email, address, social links).
 */
export async function getContact(): Promise<Contact | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.contact)

  try {
    const payload = await payloadClient()

    const contact = await payload.findGlobal({
      depth: 0,
      slug: 'contact',
    })

    return contact as unknown as Contact
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching contact:', error)
    throw error
  }
}

/**
 * Fetch the SiteSettings global (brand, SEO, favicon, OG image, theme colours).
 * depth 1 so the favicon / OG image uploads are populated with their URLs.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.siteSettings)

  try {
    const payload = await payloadClient()

    const settings = await payload.findGlobal({
      depth: 1,
      slug: 'site-settings',
    })

    return settings as unknown as SiteSettings
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching site settings:', error)
    throw error
  }
}
