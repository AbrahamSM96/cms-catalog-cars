'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { Car } from '../../types/car'

import { CarCard } from './CarCard'

interface FeaturedCarsProps {
  cars: Car[]
}

/**
 * FeaturedCars
 *
 * @param props - FeaturedCarsProps
 * @param props.cars - Car[]
 */
export function FeaturedCars({
  cars,
}: FeaturedCarsProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (cars.length === 0) return null

  return (
    <section
      className="relative overflow-hidden bg-white py-20 sm:py-24"
      id="featured"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3.5 py-1.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-accent-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-accent-600">
                Selección premium
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Autos destacados
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Nuestras mejores ofertas seleccionadas especialmente para ti.
            </p>
          </div>

          <Link
            className="group shadow-soft hidden cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:border-accent-500 hover:text-accent-600 sm:inline-flex"
            href="/catalogo"
          >
            Ver todo el inventario
            <svg
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
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

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, index) => (
            <div
              className={`transition-all duration-700 ${isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
                }`}
              key={car.id}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
