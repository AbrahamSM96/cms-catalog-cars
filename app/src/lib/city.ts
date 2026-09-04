import type { Car, City, Dealership } from '../types/car'

/**
 * Read the city off a dealership, when the relation was populated.
 *
 * Payload returns the related document at `depth >= 1` and a bare id below
 * that, so every caller would otherwise repeat the same type narrowing. Returns
 * null for an unpopulated relation instead of guessing.
 *
 * @param dealership - A dealership document, an id, or nothing.
 */
export function dealershipCity(
  dealership: Dealership | string | number | null | undefined
): City | null {
  if (!dealership || typeof dealership !== 'object') return null

  const city = dealership.address?.city
  return city && typeof city === 'object' ? city : null
}

/**
 * Read the city a car is stored in, derived from its dealership.
 *
 * Cars carry no city of their own: the location is a consequence of which lot
 * holds the car, which is what keeps a car from claiming one city while its
 * dealership sits in another.
 *
 * @param car - The car to locate.
 */
export function carCity(car: Car): City | null {
  return dealershipCity(car.dealership)
}

/**
 * Format a city for display: "Pachuca, Hidalgo".
 *
 * @param city - The city to format, or null when the relation is unresolved.
 */
export function formatCity(city: City | null): string {
  if (!city) return ''
  return [city.name, city.state].filter(Boolean).join(', ')
}
