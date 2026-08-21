import 'server-only'

import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'

import config from '@payload-config'

import type {
  Brand,
  Car,
  CarFilters,
  CarsResponse,
  Contact,
  Dealership,
  Homepage,
  SiteSettings,
} from '../types/car'

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
 */
function payloadClient(): Promise<Payload> {
  return getPayload({ config })
}

/**
 * Fetch all cars with optional filters.
 *
 * @param filters - optional filters to apply to the query
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
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
    return []
  }
}

/**
 * Fetch all cars for the sitemap (unpaginated).
 */
export async function getAllCars(): Promise<Car[]> {
  try {
    const payload = await payloadClient()

    const result = await payload.find({
      collection: 'cars',
      depth: 2,
      limit: 100,
    })

    return result.docs as unknown as Car[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching all cars:', error)
    return []
  }
}

/**
 * Fetch a single car by ID.
 *
 * @param id - the car ID to fetch
 */
export async function getCarById(id: string): Promise<Car> {
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
 * Fetch a single car by its SEO slug (marca-modelo-version-año-id).
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
    return []
  }
}

/**
 * Fetch all dealerships (concesionarios) for the locations page.
 */
export async function getDealerships(): Promise<Dealership[]> {
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
    return []
  }
}

/**
 * Fetch the Homepage global (hero carousel slides + hero text).
 * Returns null on failure so the Hero can fall back to its defaults.
 */
export async function getHomepage(): Promise<Homepage | null> {
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
    return null
  }
}

/**
 * Fetch the Contact global (phone, WhatsApp, email, address, social links).
 */
export async function getContact(): Promise<Contact | null> {
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
    return null
  }
}

/**
 * Fetch the SiteSettings global (brand, SEO, favicon, OG image, theme colours).
 * depth 1 so the favicon / OG image uploads are populated with their URLs.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
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
    return null
  }
}
