import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getCars, getCatalogFacets, getCityFacets } from '@/lib/payload-client'
import { resolveLandingPath } from '@/lib/landing-routes'
import type { LandingParams } from '@/components/frontend/LandingResults'
import { LandingResults } from '@/components/frontend/LandingResults'

interface SeminuevosPageProps {
  params: Promise<LandingParams>
}

/**
 * generateMetadata
 *
 * A path that resolves to nothing, and a page with no cars behind it, both come
 * back `noindex`. `notFound()` alone is not enough here: this version of Next
 * answers it with a 200, which search engines read as a real page — a soft 404.
 * `follow` stays on so the links out of the page still count.
 *
 * @param props - component props
 * @param props.params - the path segments after /seminuevos
 */
export async function generateMetadata(
  props: SeminuevosPageProps
): Promise<Metadata> {
  const { filtros = [] } = await props.params

  if (filtros.length === 0) {
    return {
      alternates: { canonical: '/seminuevos' },
      description:
        'Autos seminuevos por ciudad. Elige dónde quieres tu próximo auto y mira el inventario disponible.',
      title: 'Seminuevos por ciudad',
    }
  }

  const [facets, cities] = await Promise.all([
    getCatalogFacets(),
    getCityFacets(),
  ])

  // A non-canonical spelling never reaches this far: `proxy.ts` 308s it to the
  // published URL first. The resolver stays strict anyway — being lenient here
  // would serve the page at both spellings, which is the duplicate the redirect
  // exists to prevent.
  const page = resolveLandingPath(filtros, { brands: facets.brands, cities })

  if (!page) {
    return {
      robots: { follow: false, index: false },
      title: 'Página no encontrada',
    }
  }

  const cars = await getCars(page.filters)

  return {
    alternates: { canonical: page.canonical },
    description: page.description,
    openGraph: {
      description: page.description,
      title: page.heading,
      type: 'website',
      url: page.canonical,
    },
    ...(cars.totalDocs === 0
      ? { robots: { follow: true, index: false } }
      : {}),
    title: page.title,
  }
}

/**
 * SeminuevosPage
 *
 * City landing pages: `/seminuevos`, `/seminuevos/pachuca` and
 * `/seminuevos/pachuca/mazda`. City always comes first — the same list of cars
 * reachable at two URLs would split its authority between them.
 *
 * No `generateStaticParams`: the cities live in the database and the build runs
 * without one, and under Cache Components an empty list is a build error. The
 * shell below prerenders once for the whole route and the results stream in.
 *
 * @param props - component props
 * @param props.params - the path segments after /seminuevos
 */
export default function SeminuevosPage(
  props: SeminuevosPageProps
): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-white pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto h-12 w-2/3 animate-pulse rounded-xl bg-slate-200" />
                <div className="mx-auto mt-4 h-6 w-1/2 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      className="shadow-soft h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
                      key={i}
                    />
                  ))}
                </div>
              </div>
            }
          >
            <LandingResults params={props.params} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
