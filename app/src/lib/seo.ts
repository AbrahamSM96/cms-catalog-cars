/**
 * Site origin used to build absolute URLs for metadata, sitemap and robots.
 * Reads NEXT_PUBLIC_SITE_URL (set in .env) and falls back to localhost so the
 * app still works in dev when the variable is missing.
 *
 * The fallback deliberately uses `||`, not `??`: the variable is baked in at
 * build time through a Docker ARG, and an ARG that the host never supplies
 * becomes an empty string rather than undefined. `??` would keep that empty
 * string, and `new URL('')` in the root layout throws ERR_INVALID_URL on every
 * request — a missing build variable taking the whole site down instead of
 * quietly degrading to a wrong-but-working origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
