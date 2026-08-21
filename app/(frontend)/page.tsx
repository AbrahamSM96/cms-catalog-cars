import Link from 'next/link'
import type { Metadata } from 'next'

import {
  getDealerships,
  getFeaturedCars,
  getHomepage,
  getSiteSettings,
} from '@/lib/payload-client'
import { Hero, type HeroSlideView } from '@/components/frontend/Hero'
import { FeaturedCars } from '@/components/frontend/FeaturedCars'
import { getImageUrl } from '@/lib/images'
import { Locations } from '@/components/frontend/Locations'
import type { Media } from '@/types/car'
import { resolveSiteConfig } from '@/config/site'

/**
 * generateMetadata — home page SEO from the CMS `site-settings` global.
 */
export async function generateMetadata(): Promise<Metadata> {
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
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  // Fetch data in parallel
  const [featuredCars, homepage, dealerships] = await Promise.all([
    getFeaturedCars(),
    getHomepage(),
    getDealerships(),
  ])

  // Resolve hero carousel slides (image relation -> Cloudinary URL).
  const heroSlides: HeroSlideView[] = (homepage?.heroSlides ?? [])
    .map((slide): HeroSlideView | null => {
      const image = slide.image
      if (!image || typeof image !== 'object') return null
      const media = image as Media
      return {
        alt:
          media.alt || slide.caption || 'Catálogo de autos seminuevos en venta',
        caption: slide.caption,
        url: media.url || getImageUrl(media.filename),
      }
    })
    .filter((s): s is HeroSlideView => s !== null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Hero slides={heroSlides} text={homepage?.hero} />

      {/* Featured */}
      <FeaturedCars cars={featuredCars} />

      {/* Catalog CTA band */}
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
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

      {/* Locations */}
      {dealerships.length > 0 && (
        <section className="bg-white py-20 sm:py-24" id="ubicaciones">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Nuestras ubicaciones
              </h2>
              <p className="mt-2 text-slate-600">
                Visítanos en cualquiera de nuestros concesionarios. Consulta
                dirección, horario y teléfono.
              </p>
            </div>
            <Locations dealerships={dealerships} />
          </div>
        </section>
      )}
    </div>
  )
}
