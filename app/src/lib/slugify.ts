/**
 * Convert an arbitrary string into a URL-safe slug segment.
 * "Pachuca de Soto" -> "pachuca-de-soto"
 *
 * Shared by the car detail slugs (`lib/car-slug.ts`), the `cities` collection
 * and the landing routes, so a city typed as "Pachuca" and one typed as
 * "pachuca " can never resolve to two different URLs.
 *
 * @param value - The text to slugify. Numbers are stringified; nullish becomes ''.
 */
export function slugify(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return ''
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (á -> a)
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}
