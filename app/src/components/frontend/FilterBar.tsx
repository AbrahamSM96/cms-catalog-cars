'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { Brand } from '../../types/car'

interface FilterBarProps {
  brands: Brand[]
}

const SELECT_CLASS =
  "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 shadow-soft transition-colors hover:border-slate-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"

/**
 * FilterBar 
 *
 * @param props - FilterBarProps
 * @param props.brands - Brand[]
 */
export function FilterBar({ brands }: FilterBarProps): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Complete list of years (current year down to 2000) for the "año mínimo" filter.
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - 2016 + 1 },
    (_, i) => currentYear - i
  )

  /**
   * handleFilterChange
   *
   * @param key - string
   * @param value - string
   */
  const handleFilterChange = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  /**
   * handleClearAll
   */
  const handleClearAll = (): void => {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters =
    searchParams.get('brand') ||
    searchParams.get('status') ||
    searchParams.get('transmission') ||
    searchParams.get('minYear') ||
    searchParams.get('search')

  return (
    <div className="shadow-soft rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <h3 className="text-base font-semibold text-slate-900">
            Filtrar inventario
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            onClick={handleClearAll}
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            htmlFor="brand"
          >
            Marca
          </label>
          <select
            className={SELECT_CLASS}
            id="brand"
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            value={searchParams.get('brand') || 'all'}
          >
            <option value="all">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            htmlFor="status"
          >
            Estado
          </label>
          <select
            className={SELECT_CLASS}
            id="status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
            value={searchParams.get('status') || 'all'}
          >
            <option value="all">Todos</option>
            <option value="available">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            htmlFor="transmission"
          >
            Transmisión
          </label>
          <select
            className={SELECT_CLASS}
            id="transmission"
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            value={searchParams.get('transmission') || 'all'}
          >
            <option value="all">Todas</option>
            <option value="automatic">Automática</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            htmlFor="minYear"
          >
            Año mínimo
          </label>
          <select
            className={SELECT_CLASS}
            id="minYear"
            onChange={(e) => handleFilterChange('minYear', e.target.value)}
            value={searchParams.get('minYear') || 'all'}
          >
            <option value="all">Cualquier año</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
