import type { MetadataRoute } from 'next'

import { buildCarSlug } from '@/lib/car-slug'
import { getAllCars } from '@/lib/payload-client'
import { SITE_URL } from '@/lib/seo'

/**
 * sitemap
 *
 * Static routes plus one entry per car so every catalog page is crawlable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getAllCars()

  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    lastModified: car.updatedAt,
    url: `${SITE_URL}/catalogo/${buildCarSlug(car)}`,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/buscador` },
    { url: `${SITE_URL}/catalogo` },
    { url: `${SITE_URL}/contacto` },
    { url: `${SITE_URL}/ubicaciones` },
  ]

  return [...staticRoutes, ...carRoutes]
}
