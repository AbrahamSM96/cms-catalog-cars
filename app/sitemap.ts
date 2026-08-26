import { connection } from 'next/server'
import type { MetadataRoute } from 'next'

import { buildCarSlug } from '@/lib/car-slug'
import { getAllCars } from '@/lib/payload-client'
import { SITE_URL } from '@/lib/seo'

/**
 * sitemap
 *
 * Static routes plus one entry per car so every catalog page is crawlable.
 *
 * `connection()` defers the work to request time. Without it Next would resolve
 * the cached query while prerendering, and builds run without database access
 * (the Docker image is built before Postgres is reachable), so the baked result
 * would list the static routes only. The car list itself stays cached and is
 * purged whenever the catalog changes, so crawlers cost at most one query per
 * edit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()

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
