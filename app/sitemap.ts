import type { MetadataRoute } from 'next'

import { buildCarSlug } from '@/lib/car-slug'
import { getAllCars } from '@/lib/payload-client'
import { SITE_URL } from '@/lib/seo'

/**
 * sitemap.ts is a Route Handler that Next caches by default, which means it
 * would be prerendered at build time. Builds run without database access (the
 * Docker image is built before Postgres is reachable), so the baked result
 * would be a sitemap with the static routes only — and it would never refresh.
 * Rendering per request keeps the car entries in sync with the catalog; the
 * cost is one query on a URL that only crawlers hit.
 */
export const dynamic = 'force-dynamic'

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
