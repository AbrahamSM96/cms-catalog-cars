import type { Car } from '../types/car'

import { carCity } from './city'
import { r2PublicUrl } from './r2'

/**
 * `sizes` presets for the car preview image, por widget que renderiza la card.
 *
 * El navegador elige el candidato del `srcset` con este valor, así que cada
 * grid declara el ancho real que ocupa la card en su layout: la home usa el
 * grid destacado y el catálogo/landing un grid más angosto por los filtros.
 */
export const carCardSizes = {
  catalog: '(min-width: 1400px) 30vw, (min-width: 768px) 40vw, 80vw',
  grid: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
} as const

export type CarCardSizesVariant = keyof typeof carCardSizes

/**
 * Get the public image URL from R2.
 *
 * Pure helper (no server-only dependencies) so it can be imported from both
 * Server Components and Client Components. Uses the same filename→URL mapping as
 * the storage plugin so the URL always points to where the file actually lives.
 *
 * @param filename - string | undefined
 */
export function getImageUrl(filename: string | undefined): string {
  if (!filename) return '/placeholder-car.svg'

  // If it's already a full URL, return it
  if (filename.startsWith('http')) return filename

  return r2PublicUrl(filename)
}

/**
 * Build an SEO-friendly `alt` text for a car's photos.
 *
 * Format: "Marca Modelo Versión Año en Ciudad" (any missing part is skipped).
 * Including make/model/version/year plus the city helps local search intent
 * (e.g. "Toyota Corolla 2020 en Guadalajara") while staying concise and
 * descriptive, which is the recommended practice for image alt text.
 *
 * @param car - Car
 */
export function buildCarImageAlt(car: Car): string {
  const brandName = typeof car.brand === 'object' ? car.brand.name : undefined
  const base = [brandName, car.model, car.version, car.year]
    .filter(Boolean)
    .join(' ')
  const city = carCity(car)?.name.trim()
  return city ? `${base} en ${city}` : base
}
