/**
 * Site origin used to build absolute URLs for metadata, sitemap and robots.
 * Reads NEXT_PUBLIC_SITE_URL (set in .env) and falls back to localhost so the
 * app still works in dev when the variable is missing.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

/**
 * Build an absolute URL from a site-relative path.
 *
 * @param path - string
 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}
