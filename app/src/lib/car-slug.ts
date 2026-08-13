import type { Brand, Car } from '../types/car'

/**
 * Convert an arbitrary string into a URL-safe slug segment.
 * "Versa Advance" -> "versa-advance"
 *
 * @param value - string | number | undefined
 */
function slugify(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (á -> a)
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

/**
 * Build an SEO-friendly slug for a car detail URL.
 * Format: marca-modelo-version-año-id  (e.g. "nissan-versa-advance-2021-42")
 * The id is always the last segment so it can be recovered reliably.
 *
 * @param car - Car
 */
export function buildCarSlug(car: Car): string {
  const brandName =
    typeof car.brand === 'object' ? (car.brand as Brand).name : ''
  const parts = [brandName, car.model, car.version, car.year, car.id]
    .map((part) => slugify(part))
    .filter(Boolean)
  return parts.join('-')
}

/**
 * Extract the car id from a slug produced by buildCarSlug.
 * The id is the last hyphen-separated segment.
 * Returns null if no id can be found.
 *
 * @param slug - string
 */
export function parseCarSlug(slug: string): string | null {
  if (!slug) return null
  const segments = slug.split('-')
  const id = segments[segments.length - 1]
  return id && id.length > 0 ? id : null
}
