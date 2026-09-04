/* eslint-disable react/no-danger */
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  getBrandsInCity,
  getCars,
  getCatalogFacets,
  getCityFacets,
} from '@/lib/payload-client'
import { landingCrumbs, resolveLandingPath } from '@/lib/landing-routes'
import { absoluteUrl } from '@/lib/seo'
import { buildItemListLd } from '@/lib/json-ld'
import { CarGrid } from '@/components/frontend/CarGrid'
import { LandingHub } from '@/components/frontend/LandingHub'

/** The path segments after `/seminuevos`. */
export interface LandingParams {
  filtros?: string[]
}

interface LandingResultsProps {
  /** Passed as a promise so the page above stays prerenderable. */
  params: Promise<LandingParams>
}

/**
 * The body of `/seminuevos/...`: the hub with no segments, a city or a city and
 * a brand with them.
 *
 * Reads `params`, which is request data, so it lives behind a `<Suspense>`
 * boundary and the page above prerenders once for every city. Both the facets
 * and the car query are cached readers, so a repeat visit costs no round trip
 * until the CMS purges the tag.
 *
 * @param props - Component props.
 * @param props.params - The path segments, as a promise.
 */
export async function LandingResults(
  props: LandingResultsProps
): Promise<React.JSX.Element> {
  const { filtros = [] } = await props.params

  const [facets, cities] = await Promise.all([
    getCatalogFacets(),
    getCityFacets(),
  ])

  if (filtros.length === 0) return <LandingHub cities={cities} />

  const page = resolveLandingPath(filtros, { brands: facets.brands, cities })
  if (!page) notFound()

  const [cars, brandsInCity] = await Promise.all([
    getCars(page.filters),
    getBrandsInCity(page.city.dealershipIds),
  ])

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: buildItemListLd(cars.docs),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: landingCrumbs(page).map((crumb, index) => ({
      '@type': 'ListItem',
      item: absoluteUrl(crumb.path),
      name: crumb.name,
      position: index + 1,
    })),
  }

  const otherBrands = brandsInCity.filter(
    (entry) => entry.brand.slug !== page.brand?.slug
  )
  const otherCities = cities.filter(
    (city) => city.count > 0 && city.slug !== page.city.slug
  )

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        type="application/ld+json"
      />

      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {page.heading}
      </h1>

      {/* The city's own copy, written in the CMS. Without it every landing
          reads like a copy of the others, which is what search engines treat
          as a doorway page. */}
      {page.city.intro ? (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          {page.city.intro}
        </p>
      ) : null}

      <p className="mt-4 text-sm font-medium text-slate-500">
        {cars.totalDocs} {cars.totalDocs === 1 ? 'auto disponible' : 'autos disponibles'}{' '}
        en {page.city.name}, {page.city.state}
      </p>

      <div className="mt-10 text-left">
        <CarGrid cars={cars.docs} />

        {cars.totalPages > 1 && (
          <div className="mt-10 text-center">
            <Link
              className="shadow-soft inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-accent-500"
              href={page.brand ? `/catalogo?brand=${page.brand.slug}` : '/catalogo'}
            >
              Ver los {cars.totalDocs} autos en el catálogo
            </Link>
          </div>
        )}

        {otherBrands.length > 0 && (
          <nav aria-label="Marcas en esta ciudad" className="mt-14">
            <h2 className="text-xl font-bold text-slate-900">
              Marcas en {page.city.name}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {otherBrands.map((entry) => (
                <li key={entry.brand.slug}>
                  <Link
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-accent-500"
                    href={`/seminuevos/${page.city.slug}/${entry.brand.slug}`}
                  >
                    {entry.brand.name}
                    <span className="ml-2 text-slate-400">{entry.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {otherCities.length > 0 && (
          <nav aria-label="Otras ciudades" className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">Otras ciudades</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {otherCities.map((city) => (
                <li key={city.slug}>
                  <Link
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-accent-500"
                    href={`/seminuevos/${city.slug}`}
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  )
}
