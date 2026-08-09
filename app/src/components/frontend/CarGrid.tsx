import type { Car } from "../../types/car";
import { CarCard } from "./CarCard";

interface CarGridProps {
  cars: Car[];
}

export function CarGrid({ cars }: CarGridProps) {
  if (cars.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto max-w-md">
          {/* Empty State Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
            <svg
              className="h-12 w-12 text-slate-400 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Empty State Text */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            No se encontraron autos
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Intenta ajustar los filtros o realiza una búsqueda diferente para encontrar el auto ideal.
          </p>

          {/* Reset Button */}
          <a
            href="/"
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restablecer filtros
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
