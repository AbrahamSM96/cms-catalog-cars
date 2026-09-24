/**
 * Pull coordinates out of a Google Maps link so the admin does not have to copy
 * them by hand. Two kinds of links arrive from the share sheet:
 *
 * - Long ones (`https://www.google.com/maps/place/...`) already carry the
 *   numbers, so a regex is enough.
 * - Short ones (`https://maps.app.goo.gl/xxxx`) carry nothing: their redirect
 *   has to be followed first, and the long URL it points at is what gets
 *   parsed.
 *
 * The redirect is read by hand rather than with `redirect: 'follow'` because
 * Google decides what to answer from the request headers: a plain request gets
 * a `302` straight to the place, while anything that looks like a browser gets
 * a JavaScript interstitial with no coordinates in it. Sending no `user-agent`
 * is what keeps the short links resolvable.
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/** Hosts whose links are opaque and have to be followed to reveal the place. */
const SHORT_HOSTS = new Set(['g.co', 'goo.gl', 'maps.app.goo.gl'])

/** How many `Location` hops to follow before giving up on a short link. */
const MAX_REDIRECTS = 5

/** Query parameters Google uses to carry a `lat,lng` pair. */
const COORDINATE_PARAMS = ['center', 'destination', 'll', 'q', 'query', 'sll']

const PAIR = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/

// The place pin, e.g. `!8m2!3d20.6597!4d-103.3496`. More accurate than the `@`
// segment, which is only where the camera sits.
const PIN = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/

// The map centre, e.g. `/@20.6597,-103.3496,17z`.
const CENTER = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/

// A pair written straight into the path, e.g. `/maps/search/20.1152,+-98.7477`.
// This is what a short link resolves to when the place was shared as a plain
// coordinate rather than as a business, and the `+` is a space Google escaped.
const PATH_PAIR =
  /\/maps\/(?:dir|place|search)\/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/

/**
 * Build a coordinate pair, rejecting values outside the valid ranges so a
 * zoom level or a timestamp never lands in the fields.
 *
 * @param latitude - Latitude in decimal degrees.
 * @param longitude - Longitude in decimal degrees.
 */
function toCoordinates(
  latitude: number,
  longitude: number
): Coordinates | null {
  const valid =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180

  return valid ? { latitude, longitude } : null
}

/**
 * Undo the escaping Google uses inside a path segment, so `20.1,+-98.7` and
 * `20.1,%20-98.7` read as the plain pair they stand for.
 *
 * @param url - The link or page text to scan.
 */
function decodePlus(url: string): string {
  try {
    return decodeURIComponent(url).replaceAll('+', ' ')
  } catch {
    return url.replaceAll('+', ' ')
  }
}

/**
 * Read a `lat,lng` pair out of a query parameter value.
 *
 * @param value - The raw parameter value, e.g. `20.6597,-103.3496`.
 */
function fromPair(value: string): Coordinates | null {
  const match = PAIR.exec(value.trim())

  return match ? toCoordinates(Number(match[1]), Number(match[2])) : null
}

/**
 * Whether the link has to be followed before it can be parsed.
 *
 * @param url - The link pasted in the admin.
 */
export function isShortMapsUrl(url: string): boolean {
  try {
    return SHORT_HOSTS.has(new URL(url).hostname.replace(/^www\./, ''))
  } catch {
    return false
  }
}

/**
 * Parse coordinates from a long Google Maps URL (or from any text containing
 * one, such as the HTML body a short link redirects to).
 *
 * @param url - The link or page text to scan.
 */
export function parseCoordinatesFromMapsUrl(url: string): Coordinates | null {
  const pin = PIN.exec(url)
  if (pin) {
    const found = toCoordinates(Number(pin[1]), Number(pin[2]))
    if (found) return found
  }

  try {
    const params = new URL(url).searchParams
    for (const key of COORDINATE_PARAMS) {
      const value = params.get(key)
      const found = value ? fromPair(value) : null
      if (found) return found
    }
  } catch {
    // Not a URL on its own — the regexes below still work on raw text.
  }

  const path = PATH_PAIR.exec(decodePlus(url))
  if (path) {
    const found = toCoordinates(Number(path[1]), Number(path[2]))
    if (found) return found
  }

  const center = CENTER.exec(url)
  if (center) {
    const found = toCoordinates(Number(center[1]), Number(center[2]))
    if (found) return found
  }

  return null
}

/**
 * Resolve any Google Maps link to its coordinates, following short links when
 * needed. Returns `null` when the link carries no place — a search results
 * page, say — or when the network call fails; the admin can still type the
 * numbers in by hand.
 *
 * @param url - The link pasted in the admin.
 * @param fetchImpl - Fetch implementation, swapped in tests.
 */
export async function resolveCoordinatesFromMapsUrl(
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<Coordinates | null> {
  const trimmed = url.trim()
  if (!trimmed) return null

  const direct = parseCoordinatesFromMapsUrl(trimmed)
  if (direct) return direct

  if (!isShortMapsUrl(trimmed)) return null

  try {
    let target = trimmed

    for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
      const response = await fetchImpl(target, { redirect: 'manual' })
      const location = response.headers.get('location')
      if (!location) break

      target = new URL(location, target).toString()

      const found = parseCoordinatesFromMapsUrl(target)
      if (found) return found
    }

    return null
  } catch {
    return null
  }
}
