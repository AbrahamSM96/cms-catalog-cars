import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CatalogResults } from '@/components/frontend/CatalogResults'
import type { CatalogSearchParams } from '@/components/frontend/CatalogResults'
import { SearchBar } from '@/components/frontend/SearchBar'

export const metadata: Metadata = {
  alternates: {
    canonical: '/catalogo',
  },
  description:
    'Explora nuestro catálogo de autos seminuevos. Filtra por marca, año, precio y transmisión.',
  openGraph: {
    description:
      'Explora nuestro catálogo de autos seminuevos y encuentra el ideal para ti.',
    title: 'Catálogo de autos seminuevos',
    type: 'website',
  },
  title: 'Catálogo de autos seminuevos',
}

interface CatalogoPageProps {
  searchParams: Promise<CatalogSearchParams>
}

/**
 * CatalogoPage
 *
 * The heading and the search box are static. `searchParams` is never awaited
 * here — the promise is handed to `CatalogResults` behind a `<Suspense>`
 * boundary so this shell prerenders once and serves every filter combination.
 *
 * @param props - component props
 * @param props.searchParams - search parameters from the URL
 */
export default function CatalogoPage({
  searchParams,
}: CatalogoPageProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <section className="relative overflow-hidden bg-white pt-28 pb-12 sm:pt-32">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Catálogo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Encuentra el auto seminuevo ideal para ti.
          </p>
          <div className="mt-8 flex justify-center">
            {/* Reads the query string on the client, so it needs its own
                boundary. */}
            <Suspense
              fallback={
                <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-200" />
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    className="shadow-soft h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
                    key={i}
                  />
                ))}
              </div>
            }
          >
            <CatalogResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
