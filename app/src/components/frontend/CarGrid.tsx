import type { Car } from '../../types/car'

import { CarCard } from './CarCard'

interface CarGridProps {
  cars: Car[]
}

/**
 * CarGrid component displays a grid of car cards. If no cars are available, it shows a message indicating that no cars were found and provides a link to reset filters.
 *
 * @param props - The properties for the CarGrid component.
 * @param props.cars - An array of Car objects to be displayed in the grid.
 */
export function CarGrid({ cars }: CarGridProps): React.ReactElement {
  if (cars.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="mx-auto max-w-md px-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <svg
              aria-hidden="true"
              className="h-10 w-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            No se encontraron autos
          </h3>
          <p className="mt-2 text-slate-600">
            Intenta ajustar los filtros o realiza una búsqueda diferente para
            encontrar el auto ideal.
          </p>

          <a
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/25"
            href="/catalogo"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Restablecer filtros
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard car={car} key={car.id} />
      ))}
    </div>
  )
}
