/* eslint-disable react/no-danger */
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { buildCarImageAlt, getImageUrl } from '@/lib/images'
import type { Dealership, Media } from '@/types/car'
import { getCarBySlug, getContact } from '@/lib/payload-client'
import { absoluteUrl } from '@/lib/seo'
import { CarFeatures } from '@/components/frontend/CarFeatures'
import { CarHeader } from '@/components/frontend/CarHeader'
import { CarHistory } from '@/components/frontend/CarHistory'
import { CarLocation } from '@/components/frontend/CarLocation'
import { ContactButton } from '@/components/frontend/ContactButton'
import { FinancingCalculator } from '@/components/frontend/FinancingCalculator'
import { formatPriceMXN } from '@/lib/currency'
import { ImageGallery } from '@/components/frontend/ImageGallery'

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
 * @param props - component props
 * @param props.params - parameters from the URL
 */
export default async function CarDetailPage({
  params,
}: CarDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params

  const car = await getCarBySlug(slug).catch(() => null)
  if (!car || !car.id) {
    notFound()
  }

  const contact = await getContact()

  const brandName = typeof car.brand === 'object' ? car.brand.name : 'Unknown'

  // Fallback image shown only if there are no exterior/interior photos yet.
  const fallbackImages: Media[] =
    car.featuredImage && typeof car.featuredImage === 'object'
      ? [car.featuredImage]
      : []

  const formattedPrice = formatPriceMXN(car.price)

  // JSON-LD structured data for SEO (Vehicle / Product)
  const featuredFilename =
    typeof car.featuredImage === 'object'
      ? car.featuredImage?.filename
      : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    brand: { '@type': 'Brand', name: brandName },
    model: car.model,
    name: `${brandName} ${car.model} ${car.version} ${car.year}`,
    vehicleModelDate: String(car.year),
    ...(car.mileage
      ? {
          mileageFromOdometer: {
            '@type': 'QuantitativeValue',
            unitCode: 'KMT',
            value: car.mileage,
          },
        }
      : {}),
    ...(car.fuelType ? { fuelType: car.fuelType } : {}),
    ...(car.horsepower
      ? {
          vehicleEngine: {
            '@type': 'EngineSpecification',
            enginePower: {
              '@type': 'QuantitativeValue',
              unitCode: 'HP',
              value: car.horsepower,
            },
          },
        }
      : {}),
    ...(featuredFilename ? { image: getImageUrl(featuredFilename) } : {}),
    offers: {
      '@type': 'Offer',
      availability:
        car.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
      price: car.price,
      priceCurrency: 'MXN',
      url: absoluteUrl(`/catalogo/${slug}`),
    },
    url: absoluteUrl(`/catalogo/${slug}`),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        item: absoluteUrl('/'),
        name: 'Inicio',
        position: 1,
      },
      {
        '@type': 'ListItem',
        item: absoluteUrl('/catalogo'),
        name: 'Catálogo',
        position: 2,
      },
      {
        '@type': 'ListItem',
        item: absoluteUrl(`/catalogo/${slug}`),
        name: `${brandName} ${car.model} ${car.version} ${car.year}`,
        position: 3,
      },
    ],
  }

  const statusConfig = {
    available: {
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Disponible',
    },
    reserved: {
      colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Reservado',
    },
    sold: {
      colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
      label: 'Vendido',
    },
  }
  const status = statusConfig[car.status]

  const dealership =
    car.dealership && typeof car.dealership === 'object'
      ? (car.dealership as Dealership)
      : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO structured data */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        type="application/ld+json"
      />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link className="transition-colors hover:text-accent-600" href="/">
            Inicio
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            className="transition-colors hover:text-accent-600"
            href="/catalogo"
          >
            Catálogo
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-900">
            {brandName} {car.model}
          </span>
        </nav>

        {/* Car Header */}
        <CarHeader car={car} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Gallery + details */}
          <div className="lg:col-span-8">
            <ImageGallery
              alt={buildCarImageAlt(car)}
              exteriorImages={car.exteriorImages}
              images={fallbackImages}
              interiorImages={car.interiorImages}
            />

            {/* Características */}
            <div className="mt-8">
              <CarFeatures car={car} />
            </div>

            {/* Historial del auto */}
            {car.history && (
              <div className="mt-8">
                <CarHistory history={car.history} />
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="shadow-soft mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h3 className="mb-4 text-xl font-bold text-slate-900">
                  Descripción
                </h3>
                <p className="leading-relaxed text-slate-700">
                  {car.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Price + Contact + Financing */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="shadow-soft rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Precio
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.colorClass}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                  {formattedPrice}
                </div>
                {car.hasVAT && (
                  <p className="mt-1 text-sm text-slate-500">Precio más IVA</p>
                )}
                <div className="mt-5">
                  <ContactButton car={car} whatsapp={contact?.whatsapp} />
                </div>
              </div>

              {/* Financing (optional — hidden for cash-only cars) */}
              {car.showFinancing !== false && (
                <FinancingCalculator
                  financing={car.financing}
                  price={car.price}
                />
              )}
            </div>
          </div>
        </div>

        {dealership && <CarLocation dealership={dealership} />}
      </div>
    </div>
  )
}
