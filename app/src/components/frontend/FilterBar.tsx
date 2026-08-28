'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import clsx from 'clsx'

import { applyFilter, hasActiveFilters } from '../../lib/catalog-filters'
import type { Brand, CatalogFacets } from '../../types/car'
import type { FilterKey } from '../../lib/catalog-filters'

interface FilterBarProps {
  /** Brands and years that actually have a car behind them. */
  facets: CatalogFacets
}

interface ActiveChip {
  key: FilterKey
  label: string
}

const CHIP_KEYS: FilterKey[] = [
  'search',
  'brand',
  'status',
  'transmission',
  'minYear',
]

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
}

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: 'Automática',
  manual: 'Manual',
}

// text-base on mobile keeps iOS from zooming the viewport on focus, and
// min-h-11 keeps every control above the 44px touch-target floor.
const SELECT_CLASS =
  "w-full min-h-11 cursor-pointer touch-manipulation appearance-none rounded-xl border border-slate-200 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-base font-medium text-slate-800 shadow-soft transition-colors hover:border-slate-300 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 sm:text-sm"

/**
 * Human-readable label for an active filter value.
 *
 * @param brands - available brands, used to resolve a brand slug to its name.
 * @param key - the filter key.
 * @param value - the raw filter value from the URL.
 */
function filterLabel(brands: Brand[], key: FilterKey, value: string): string {
  switch (key) {
    case 'brand':
      return brands.find((brand) => brand.slug === value)?.name ?? value
    case 'minYear':
      return `Desde ${value}`
    case 'search':
      return `“${value}”`
    case 'status':
      return STATUS_LABELS[value] ?? value
    case 'transmission':
      return TRANSMISSION_LABELS[value] ?? value
  }
}

/**
 * FilterBar
 *
 * @param props - FilterBarProps
 */
export function FilterBar(props: FilterBarProps): React.JSX.Element {
  const { brands, years } = props.facets
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  /**
   * handleFilterChange
   *
   * @param key - string
   * @param value - string
   */
  const handleFilterChange = (key: string, value: string): void => {
    const query = applyFilter(searchParams, key as FilterKey, value)
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  /**
   * handleClearAll
   */
  const handleClearAll = (): void => {
    router.push(pathname, { scroll: false })
  }

  const activeFilters = hasActiveFilters(searchParams)
  const activeChips: ActiveChip[] = CHIP_KEYS.flatMap((key) => {
    const value = searchParams.get(key)
    if (!value || value === 'all') return []
    return [{ key, label: filterLabel(brands, key, value) }]
  })

  return (
    <div className="shadow-soft rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-sm sm:p-5">
      {/* One row, three slots: label, spacer, disclosure. "Limpiar" lives with
          the chips below — on a 320px card a fourth element forces the title to
          wrap and the whole row loses its baseline. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-slate-500"
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
          <h3 className="truncate text-base font-semibold text-slate-900">
            Filtrar inventario
          </h3>
          {activeChips.length > 0 && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-semibold text-white">
              {activeChips.length}
              <span className="sr-only"> filtros activos</span>
            </span>
          )}
        </div>

        <button
          aria-controls="filter-panel"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          className="-mr-2 inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 sm:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className={clsx(
              'h-5 w-5 transition-transform duration-200 motion-reduce:transition-none',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 9l6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>

      {/* "Limpiar todo" closes the chip row instead of sitting in the header:
          it belongs to the same group it acts on, and it only ever appears
          alongside the chips. */}
      {activeFilters && (
        <ul className="mt-3 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <button
                className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:min-h-9"
                onClick={() => handleFilterChange(chip.key, 'all')}
                type="button"
              >
                {chip.label}
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-slate-400"
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
                <span className="sr-only">Quitar filtro</span>
              </button>
            </li>
          ))}
          <li>
            <button
              className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center rounded-full px-3 text-sm font-medium text-accent-600 underline-offset-4 transition-colors hover:bg-accent-50 hover:underline sm:min-h-9"
              onClick={handleClearAll}
              type="button"
            >
              Limpiar todo
            </button>
          </li>
        </ul>
      )}

      {/* Collapsed on mobile only: `invisible` also drops the controls out of
          the tab order, while sm: keeps the panel permanently open. */}
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none sm:visible sm:grid-rows-[1fr]',
          isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
        )}
        id="filter-panel"
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-4">
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
                onChange={(e) =>
                  handleFilterChange('transmission', e.target.value)
                }
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
      </div>
    </div>
  )
}
