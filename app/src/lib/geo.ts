export interface LngLat {
  lng: number
  lat: number
}

/**
 * okLat
 *
 * @param n - the latitude to check
 */
const okLat = (n: number): boolean => n >= -90 && n <= 90
/**
 * okLng
 *
 * @param n - the longitude to check
 */
const okLng = (n: number): boolean => n >= -180 && n <= 180

/**
 * Validate a latitude/longitude pair for MapLibre (which wants [lng, lat] with
 * lat in [-90, 90]). Returns { lng, lat } or null.
 *
 * Tolerates the common data-entry mistake of swapping latitude and longitude:
 * if the given latitude is out of range but the values are valid when swapped,
 * they're swapped automatically instead of crashing the map.
 *
 * @param latitude - the latitude to check
 * @param longitude - the longitude to check
 */
export function normalizeCoords(
  latitude?: number | null,
  longitude?: number | null
): LngLat | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  if (okLat(latitude) && okLng(longitude))
    return { lat: latitude, lng: longitude }
  if (okLat(longitude) && okLng(latitude))
    return { lat: longitude, lng: latitude }

  return null
}
