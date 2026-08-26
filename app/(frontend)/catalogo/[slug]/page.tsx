import type { Metadata } from 'next'
import { Suspense } from 'react'

import { absoluteUrl } from '@/lib/seo'
import { CarDetail } from '@/components/frontend/CarDetail'
import { getCarBySlug } from '@/lib/payload-client'
import { getImageUrl } from '@/lib/images'

interface CarDetailPageProps {
  params: Promise<{ slug: string }>
}

/**
 * generateMetadata
 *
 * @param props - component props
 * @param props.params  - parameters from the URL
 */
export async function generateMetadata({
  params,
}: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const car = await getCarBySlug(slug).catch(() => null)

  if (!car || !car.id) {
    return {
      robots: { follow: false, index: false },
      title: 'Auto no encontrado',
    }
  }

  const brandName = typeof car.brand === 'object' ? car.brand.name : 'Unknown'
  const title = `${brandName} ${car.model} ${car.version} ${car.year}`
  const carUrl = absoluteUrl(`/catalogo/${slug}`)

  const featuredFilename =
    typeof car.featuredImage === 'object'
      ? car.featuredImage?.filename
      : undefined
  const image = featuredFilename ? getImageUrl(featuredFilename) : undefined

  return {
    alternates: { canonical: carUrl },
    description: car.description || `${title} - Autos seminuevos de calidad`,
    openGraph: {
      description:
        car.description || `${title} - Auto seminuevo en venta de calidad`,
      images: image ? [image] : undefined,
      title,
      type: 'website',
      url: carUrl,
    },
    title,
  }
}

/**
 * CarDetailPage
 *
 * The slug decides everything on this page, so the whole body streams from a
 * `<Suspense>` boundary and Next prerenders a single reusable App Shell for the
 * route instead of one page per car.
 *
 * @param props - component props
 * @param props.params - parameters from the URL
 */
export default function CarDetailPage(
  props: CarDetailPageProps
): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-200" />
                <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200" />
              </div>
              <div className="lg:col-span-4">
                <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
              </div>
            </div>
          </div>
        }
      >
        <CarDetail params={props.params} />
      </Suspense>
    </div>
  )
}
