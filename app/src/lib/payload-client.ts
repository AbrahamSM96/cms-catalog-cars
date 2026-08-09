import "server-only";

import { getPayload } from "payload";
import type { Payload, Where } from "payload";
import config from "@payload-config";
import type { Car, CarsResponse, CarFilters, Brand, Homepage } from "../types/car";
import { parseCarSlug } from "./car-slug";

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
  return getPayload({ config });
}

/**
 * Fetch all cars with optional filters.
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  try {
    const payload = await payloadClient();

    const and: Where[] = [];

    // Brand can be either a numeric id (legacy) or a slug (e.g. "kia").
    if (filters?.brand) {
      if (/^\d+$/.test(filters.brand)) {
        and.push({ brand: { equals: filters.brand } });
      } else {
        and.push({ "brand.slug": { equals: filters.brand } });
      }
    }
    if (filters?.status) and.push({ status: { equals: filters.status } });
    if (filters?.minPrice) and.push({ price: { greater_than_equal: filters.minPrice } });
    if (filters?.maxPrice) and.push({ price: { less_than_equal: filters.maxPrice } });
    if (filters?.minYear) and.push({ year: { greater_than_equal: filters.minYear } });
    if (filters?.maxYear) and.push({ year: { less_than_equal: filters.maxYear } });
    if (filters?.transmission) and.push({ transmission: { equals: filters.transmission } });

    // Search across multiple fields (model, version, brand name)
    if (filters?.search) {
      and.push({
        or: [
          { model: { contains: filters.search } },
          { version: { contains: filters.search } },
          { "brand.name": { contains: filters.search } },
        ],
      });
    }

    const result = await payload.find({
      collection: "cars",
      where: and.length ? { and } : undefined,
      depth: 2,
    });

    return result as unknown as CarsResponse;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
}

/**
 * Fetch featured cars (featured = true).
 */
export async function getFeaturedCars(): Promise<Car[]> {
  try {
    const payload = await payloadClient();

    const result = await payload.find({
      collection: "cars",
      where: {
        and: [{ featured: { equals: true } }, { status: { equals: "available" } }],
      },
      depth: 2,
      limit: 6,
    });

    return result.docs as unknown as Car[];
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return [];
  }
}

/**
 * Fetch a single car by ID.
 */
export async function getCarById(id: string): Promise<Car> {
  try {
    const payload = await payloadClient();

    const car = await payload.findByID({
      collection: "cars",
      id,
      depth: 2,
    });

    return car as unknown as Car;
  } catch (error) {
    console.error("Error fetching car:", error);
    throw error;
  }
}

/**
 * Fetch a single car by its SEO slug (marca-modelo-version-año-id).
 * The id is parsed from the last segment of the slug.
 */
export async function getCarBySlug(slug: string): Promise<Car> {
  const id = parseCarSlug(slug);
  if (!id) {
    throw new Error(`Invalid car slug: ${slug}`);
  }
  return getCarById(id);
}

/**
 * Fetch all brands.
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const payload = await payloadClient();

    const result = await payload.find({
      collection: "brands",
      limit: 100,
    });

    return result.docs as unknown as Brand[];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

/**
 * Fetch the Homepage global (hero carousel slides + hero text).
 * Returns null on failure so the Hero can fall back to its defaults.
 */
export async function getHomepage(): Promise<Homepage | null> {
  try {
    const payload = await payloadClient();

    const homepage = await payload.findGlobal({
      slug: "homepage",
      depth: 1,
    });

    return homepage as unknown as Homepage;
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}
