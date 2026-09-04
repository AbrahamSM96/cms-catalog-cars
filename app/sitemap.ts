import { connection } from 'next/server'
import type { MetadataRoute } from 'next'

import { buildCarSlug } from '@/lib/car-slug'
import { carCity } from '@/lib/city'
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

  // The landing pages, derived from the same car list rather than from a second
  // query. Building them from the inventory is also what keeps an empty
  // combination out: a path only appears here because a car sits behind it, so
  // the sitemap never advertises a page that answers `noindex`.
  const landings = new Map<string, string>()
  for (const car of cars) {
    const city = carCity(car)
    if (!city) continue
    const brandSlug = typeof car.brand === 'object' ? car.brand.slug : null

    const paths = [`/seminuevos/${city.slug}`]
    if (brandSlug) paths.push(`/seminuevos/${city.slug}/${brandSlug}`)

    for (const path of paths) {
      const known = landings.get(path)
      if (!known || known < car.updatedAt) landings.set(path, car.updatedAt)
    }
  }

  const landingRoutes: MetadataRoute.Sitemap = [...landings.entries()].map(
    ([path, lastModified]) => ({ lastModified, url: `${SITE_URL}${path}` })
  )

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/buscador` },
    { url: `${SITE_URL}/catalogo` },
    { url: `${SITE_URL}/contacto` },
    { url: `${SITE_URL}/seminuevos` },
    { url: `${SITE_URL}/ubicaciones` },
  ]

  return [...staticRoutes, ...landingRoutes, ...carRoutes]
}
