import type { Brand, CarFilters, CityFacet } from '../types/car'

import { slugify } from './slugify'

/** The facets a path is resolved against. Passed in so this stays pure. */
export interface LandingFacets {
  /** Brands with at least one car — see `getCatalogFacets`. */
  brands: Brand[]
  cities: CityFacet[]
}

/** Everything the landing page needs, derived from the path alone. */
export interface LandingPage {
  /** Null on a city-only page. */
  brand: Brand | null
  canonical: string
  city: CityFacet
  description: string
  filters: CarFilters
  /** The H1. */
  heading: string
  title: string
}

/**
 * A crumb for the BreadcrumbList JSON-LD: `Inicio › Seminuevos en Pachuca › …`.
 */
export interface LandingCrumb {
  name: string
  path: string
}

/**
 * Resolve a `/seminuevos/...` path into a landing page, or null when the path
 * is not one we publish.
 *
 * The order is fixed at **city first, brand second** (`/seminuevos/pachuca/mazda`),
 * and never more than two segments. Both rules exist for the same reason: if
 * the same list of cars were reachable at two URLs, search engines would split
 * the authority between them and pick a winner themselves. A fixed order also
 * makes a slug collision harmless — a brand and a city sharing a slug are told
 * apart by position, not by guessing.
 *
 * Segments must already be canonical (`pachuca`, not `Pachuca`): matching
 * loosely would publish the same page under every spelling.
 *
 * @param segments - The path segments after `/seminuevos`.
 * @param facets - The cities and brands that currently exist.
 */
export function resolveLandingPath(
  segments: string[],
  facets: LandingFacets
): LandingPage | null {
  if (segments.length === 0 || segments.length > 2) return null

  const [citySlug, brandSlug] = segments

  const city = facets.cities.find((entry) => entry.slug === citySlug)
  if (!city) return null

  const brand =
    brandSlug === undefined
      ? null
      : (facets.brands.find((entry) => entry.slug === brandSlug) ?? null)
  if (brandSlug !== undefined && !brand) return null

  const canonical = brand
    ? `/seminuevos/${city.slug}/${brand.slug}`
    : `/seminuevos/${city.slug}`

  const heading = brand
    ? `${brand.name} seminuevos en ${city.name}`
    : `Autos seminuevos en ${city.name}`

  const description = brand
    ? `${brand.name} seminuevos en venta en ${city.name}, ${city.state}. Precios, kilometraje y fotos de cada unidad.`
    : `Autos seminuevos en venta en ${city.name}, ${city.state}. Compara precios, año y kilometraje de nuestro inventario.`

  return {
    brand,
    canonical,
    city,
    description,
    filters: {
      dealershipIds: city.dealershipIds,
      ...(brand ? { brand: brand.slug } : {}),
    },
    heading,
    title: `${heading} | Seminuevos en ${city.state}`,
  }
}

/**
 * Normalise path segments to the single spelling the landings are published at.
 *
 * `/seminuevos/Pachuca` and `/seminuevos/pachuca` are the same page, so only
 * one of them may answer with content — the other has to redirect to it. The
 * resolver stays strict on purpose: being lenient there would serve the page at
 * both URLs, which is the duplicate the fixed segment order exists to prevent.
 *
 * @param segments - The raw path segments as they arrived.
 */
export function canonicalizeSegments(segments: string[]): string[] {
  return segments.map((segment) => slugify(segment))
}

/**
 * True when the path is not the canonical spelling of itself.
 *
 * @param segments - The raw path segments as they arrived.
 */
export function needsCanonicalRedirect(segments: string[]): boolean {
  return canonicalizeSegments(segments).some(
    (segment, index) => segment !== segments[index]
  )
}

/**
 * Build the breadcrumb trail for a landing page, deepest last.
 *
 * @param page - The resolved landing page.
 */
export function landingCrumbs(page: LandingPage): LandingCrumb[] {
  const crumbs: LandingCrumb[] = [
    { name: 'Inicio', path: '/' },
    {
      name: `Seminuevos en ${page.city.name}`,
      path: `/seminuevos/${page.city.slug}`,
    },
  ]

  if (page.brand) {
    crumbs.push({
      name: `${page.brand.name} en ${page.city.name}`,
      path: `/seminuevos/${page.city.slug}/${page.brand.slug}`,
    })
  }

  return crumbs
}
