/* eslint-disable react/no-danger */
import { CarGrid } from '@/components/car/CarGrid'
import { FilterBar } from '@/components/catalog/FilterBar'
import { buildItemListLd, serializeLd } from '@/lib/json-ld'
import {
  getCars,
  getCatalogFacets,
  getCorrectedSearch,
} from '@/lib/payload-client'
import type { CarFilters } from '@/types/car'

/** The filters the catalogue accepts through the URL. */
export interface CatalogSearchParams {
  brand?: string
  maxPrice?: string
  maxYear?: string
  minPrice?: string
  minYear?: string
  search?: string
  status?: string
  transmission?: string
}

interface CatalogResultsProps {
  /** Passed through as a promise so the page above can stay prerenderable. */
  searchParams: Promise<CatalogSearchParams>
}

/**
 * CatalogResults — the filter bar and the result grid for the current URL.
 *
 * Reads `searchParams`, which is request data, so it has to live behind a
 * `<Suspense>` boundary: that is what lets the catalogue's heading and search
 * box prerender into a static shell while the results stream in. The queries
 * themselves are cached per filter combination (see `lib/payload-client.ts`).
 *
 * @param props - Component props.
 * @param props.searchParams - The search parameters from the URL, passed through as a promise so the page above can stay prerenderable.
 */
export async function CatalogResults({
  searchParams,
}: CatalogResultsProps): Promise<React.JSX.Element> {
  const params = await searchParams

  const filters: CarFilters = {
    brand: params.brand,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    maxYear: params.maxYear ? parseInt(params.maxYear) : undefined,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    minYear: params.minYear ? parseInt(params.minYear) : undefined,
    search: params.search,
    status: params.status,
    transmission: params.transmission,
  }

  const [carsData, facets, corrected] = await Promise.all([
    getCars(filters),
    getCatalogFacets(),
    params.search ? getCorrectedSearch(params.search) : null,
  ])

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: buildItemListLd(carsData.docs),
  }

  return (
    <>
      {}
      <script
        dangerouslySetInnerHTML={{ __html: serializeLd(itemListLd) }}
        type="application/ld+json"
      />
      <div className="mb-8">
        <FilterBar facets={facets} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {params.search
              ? `Resultados para "${corrected ?? params.search}"`
              : 'Todos los autos'}
          </h2>
          {/* Sin esta línea la corrección es invisible y no se entiende por
              qué salieron estos autos. */}
          {corrected && (
            <p className="mt-1 text-sm text-slate-500">
              Buscaste &quot;{params.search}&quot;
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-slate-500">
          {carsData.totalDocs} {carsData.totalDocs === 1 ? 'auto' : 'autos'}
        </span>
      </div>

      <CarGrid cars={carsData.docs} />

      {carsData.totalPages > 1 && (
        <div className="mt-10 text-center sm:mt-14">
          <div className="shadow-soft inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600">
            Página {carsData.page} de {carsData.totalPages}
          </div>
        </div>
      )}
    </>
  )
}
