import type { Car, CarsResponse, CarFilters, Brand, Homepage } from "../types/car";
import { parseCarSlug } from "./car-slug";
import { filenameToPublicId } from "./cloudinary-path";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Fetch all cars with optional filters
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  try {
    const params = new URLSearchParams();

    // Add filters to query params.
    // Brand can be either a numeric id (legacy) or a slug (e.g. "kia").
    if (filters?.brand) {
      if (/^\d+$/.test(filters.brand)) {
        params.append("where[brand][equals]", filters.brand);
      } else {
        params.append("where[brand.slug][equals]", filters.brand);
      }
    }
    if (filters?.status) params.append("where[status][equals]", filters.status);
    if (filters?.minPrice) params.append("where[price][greater_than_equal]", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("where[price][less_than_equal]", filters.maxPrice.toString());
    if (filters?.minYear) params.append("where[year][greater_than_equal]", filters.minYear.toString());
    if (filters?.maxYear) params.append("where[year][less_than_equal]", filters.maxYear.toString());
    if (filters?.transmission) params.append("where[transmission][equals]", filters.transmission);

    // Search across multiple fields (model, version, brand name)
    if (filters?.search) {
      params.append("where[or][0][model][contains]", filters.search);
      params.append("where[or][1][version][contains]", filters.search);
      params.append("where[or][2][brand.name][contains]", filters.search);
    }

    // Always populate brand and images
    params.append("depth", "2");

    const url = `${API_URL}/cars?${params.toString()}`;
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cars: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
}

/**
 * Fetch featured cars (featured = true)
 */
export async function getFeaturedCars(): Promise<Car[]> {
  try {
    const params = new URLSearchParams({
      "where[featured][equals]": "true",
      "where[status][equals]": "available",
      depth: "2",
      limit: "6",
    });

    const response = await fetch(`${API_URL}/cars?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch featured cars: ${response.statusText}`);
    }

    const data: CarsResponse = await response.json();
    return data.docs;
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return [];
  }
}

/**
 * Fetch a single car by ID
 */
export async function getCarById(id: string): Promise<Car> {
  try {
    const response = await fetch(`${API_URL}/cars/${id}?depth=2`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch car: ${response.statusText}`);
    }

    return response.json();
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
 * Fetch all brands
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_URL}/brands?limit=100`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.statusText}`);
    }

    const data = await response.json();
    return data.docs;
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
    const response = await fetch(`${API_URL}/globals/homepage?depth=1`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

/**
 * Get image URL from Cloudinary.
 * Uses the same filename→public_id mapping as the storage adapter so the URL
 * always points to where the file actually lives.
 */
export function getImageUrl(filename: string | undefined): string {
  if (!filename) return "/placeholder-car.svg";

  // If it's already a full URL, return it
  if (filename.startsWith("http")) return filename;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dchfrwaei";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${filenameToPublicId(filename)}`;
}
