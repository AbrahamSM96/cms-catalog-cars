import { connection } from 'next/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getSiteSettings } from '@/lib/payload-client'
import { HomeFeatured } from '@/components/frontend/HomeFeatured'
import { HomeHero } from '@/components/frontend/HomeHero'
import { HomeLocations } from '@/components/frontend/HomeLocations'
import { resolveSiteConfig } from '@/config/site'

/**
 * generateMetadata — home page SEO from the CMS `site-settings` global.
 *
 * `connection()` keeps the read at request time; metadata cannot sit behind a
 * `<Suspense>` boundary and the production image is built without a database.
 */
export async function generateMetadata(): Promise<Metadata> {
  await connection()

  const site = resolveSiteConfig(await getSiteSettings())

  return {
    alternates: {
      canonical: '/',
    },
    description: site.seo.description,
    openGraph: {
      description: site.seo.ogDescription,
      ...(site.ogImageUrl ? { images: [site.ogImageUrl] } : {}),
      title: site.seo.titleDefault,
      type: 'website',
    },
    title: {
      absolute: site.seo.titleDefault,
    },
  }
}

/**
 * HomePage
 *
 * Only the CTA band is static; the hero, the featured strip and the locations
 * each stream from their own boundary, so the shell is prerendered at build
 * time and the CMS content arrives from cache at request time.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={<div className="h-[42rem] animate-pulse bg-slate-100" />}
      >
        <HomeHero />
      </Suspense>

      <Suspense fallback={<div className="h-[38rem] animate-pulse bg-white" />}>
        <HomeFeatured />
      </Suspense>

      {/* Catalog CTA band */}
      <section className="relative overflow-hidden bg-slate-50 py-12 sm:py-16 lg:py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="shadow-soft inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            <span className="text-sm font-medium text-slate-700">
              Inventario actualizado
            </span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explora todo nuestro inventario
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Busca por marca, modelo o versión y filtra por año, transmisión y
            estado para encontrar tu próximo auto.
          </p>
          <div className="mt-8">
            <Link
              className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-accent-700 hover:shadow-accent-600/30"
              href="/catalogo"
            >
              Ver catálogo completo
              <svg
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-[32rem] animate-pulse bg-white" />}>
        <HomeLocations />
      </Suspense>
    </div>
  )
}
