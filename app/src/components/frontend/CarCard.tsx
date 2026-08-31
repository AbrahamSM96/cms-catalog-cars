'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { buildCarImageAlt, getImageUrl } from '../../lib/images'
import { buildCarSlug } from '../../lib/car-slug'
import type { Car } from '../../types/car'
import { formatPriceMXN } from '../../lib/currency'

interface CarCardProps {
  car: Car
}

/**
 * CarCard
 *
 * @param props - component props
 * @param props.car - car data
 */
export function CarCard({ car }: CarCardProps): React.JSX.Element {
  const brandName = typeof car.brand === 'object' ? car.brand.name : 'Unknown'

  // Get preview image: featured image, else first exterior/interior photo
  let imageUrl = '/placeholder-car.svg'
  /**
   * firstOf
   *
   * @param arr - array of images
   */
  const firstOf = (arr?: Car['exteriorImages']): string | undefined => {
    const first = Array.isArray(arr) ? arr[0] : undefined
    return first && typeof first === 'object'
      ? getImageUrl(first.filename)
      : undefined
  }
  if (car.featuredImage && typeof car.featuredImage === 'object') {
    imageUrl = getImageUrl(car.featuredImage.filename)
  } else {
    imageUrl =
      firstOf(car.exteriorImages) || firstOf(car.interiorImages) || imageUrl
  }

  const [imgSrc, setImgSrc] = useState(imageUrl)
  const [hasError, setHasError] = useState(false)

  const formattedPrice = formatPriceMXN(car.price)

  const formattedMileage = car.mileage
    ? new Intl.NumberFormat('en-US').format(car.mileage) + ' km'
    : 'N/A'

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

  return (
    // `prefetch` porque el detalle depende del slug (URL data): el App Shell
    // compartido no lo trae, así que el runtime prefetch resuelve el auto
    // cacheado antes del clic.
    <Link
      className="group block"
      href={`/catalogo/${buildCarSlug(car)}`}
      prefetch={true}
    >
      <article className="shadow-soft hover:shadow-float relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300">
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <Image
            alt={buildCarImageAlt(car)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            onError={() => {
              setHasError(true)
              setImgSrc('/placeholder-car.svg')
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={imgSrc}
            unoptimized={hasError}
          />

          {/* Badges */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {car.featured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Destacado
              </span>
            ) : (
              <span />
            )}

            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.colorClass}`}
            >
              {status.label}
            </span>
          </div>

          {/* Year */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-lg bg-slate-900/80 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
              {car.year}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-accent-600">
              {brandName} {car.model}
            </h3>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-500">
              {car.version}
            </p>
          </div>

          {/* Specs */}
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span className="font-medium">{formattedMileage}</span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span className="font-medium">
                {car.transmission === 'automatic' ? 'Automática' : 'Manual'}
              </span>
            </div>
          </div>

          <div className="mb-4 h-px bg-slate-100" />

          {/* Price & CTA */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500">Precio</div>
              <div className="text-2xl font-bold text-slate-900">
                {formattedPrice}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-all duration-300 group-hover:gap-2.5">
              Ver detalles
              <svg
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
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
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
