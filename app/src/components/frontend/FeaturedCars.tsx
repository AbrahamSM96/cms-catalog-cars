'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import type { Car } from "../../types/car";
import { CarCard } from "./CarCard";

interface FeaturedCarsProps {
  cars: Car[];
}

export function FeaturedCars({ cars }: FeaturedCarsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (cars.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-24 dark:from-black dark:via-slate-950 dark:to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 dark:bg-red-950/20 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <svg className="h-4 w-4 text-red-600 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-red-600 dark:text-red-500">
              Selección Premium
            </span>
          </div>

          <h2
            className={`text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl transition-all duration-700 delay-100 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Autos Destacados
          </h2>

          <p
            className={`mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400 transition-all duration-700 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Nuestras mejores ofertas seleccionadas especialmente para ti
          </p>
        </div>

        {/* Cars Grid with Staggered Animation */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, index) => (
            <div
              key={car.id}
              className={`transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <Link
            href="/catalogo"
            className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-red-600 dark:hover:bg-red-600"
          >
            Ver Todo el Inventario
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
