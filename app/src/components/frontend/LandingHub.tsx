import Link from 'next/link'

import type { CityFacet } from '@/types/car'

interface LandingHubProps {
  cities: CityFacet[]
}

/**
 * The index of city landing pages, served at `/seminuevos`.
 *
 * Its job is internal linking: without a page that links to every city, the
 * landings exist only in the sitemap, and a page a crawler reaches through no
 * link at all is a page it has little reason to value. Cities with no inventory
 * are left out — linking to an empty list helps nobody.
 *
 * @param props - Component props.
 * @param props.cities - Every city, with the inventory behind each one.
 */
export function LandingHub(props: LandingHubProps): React.JSX.Element {
  const { cities } = props
  const withStock = cities.filter((city) => city.count > 0)

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Seminuevos por ciudad
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
        Elige dónde quieres tu próximo auto y mira el inventario disponible ahí.
      </p>

      {withStock.length === 0 ? (
        <p className="mt-10 text-slate-600">
          Todavía no hay autos publicados. Vuelve pronto.
        </p>
      ) : (
        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {withStock.map((city) => (
            <li key={city.slug}>
              <Link
                className="shadow-soft block rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-accent-500 hover:shadow-md"
                href={`/seminuevos/${city.slug}`}
              >
                <span className="block text-lg font-bold text-slate-900">
                  {city.name}
                </span>
                <span className="block text-sm text-slate-500">
                  {city.state} · {city.count}{' '}
                  {city.count === 1 ? 'auto' : 'autos'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
