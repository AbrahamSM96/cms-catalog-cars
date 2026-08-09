import type { Metadata } from "next";
import { getCars, getBrands } from "@/lib/payload-client";
import { SearchBar } from "@/components/frontend/SearchBar";
import { FilterBar } from "@/components/frontend/FilterBar";
import { CarGrid } from "@/components/frontend/CarGrid";
import type { CarFilters } from "@/types/car";

export const metadata: Metadata = {
  title: "Catálogo de autos seminuevos",
  description: "Explora nuestro catálogo de autos seminuevos. Filtra por marca, año, precio y transmisión.",
};

interface CatalogoPageProps {
  searchParams: Promise<{
    brand?: string;
    status?: string;
    transmission?: string;
    minYear?: string;
    maxYear?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = await searchParams;

  // Build filters from search params
  const filters: CarFilters = {
    brand: params.brand,
    status: params.status,
    transmission: params.transmission,
    minYear: params.minYear ? parseInt(params.minYear) : undefined,
    maxYear: params.maxYear ? parseInt(params.maxYear) : undefined,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    search: params.search,
  };

  // Fetch data in parallel
  const [carsData, brands] = await Promise.all([getCars(filters), getBrands()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-slate-950 dark:to-black">
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-5xl">
              Catálogo
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Encuentra el auto seminuevo ideal para ti.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 flex justify-center">
            <SearchBar />
          </div>

          {/* Filter Bar */}
          <div className="mb-12">
            <FilterBar brands={brands} />
          </div>

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {params.search ? `Resultados para "${params.search}"` : "Todos los Autos"}
            </h2>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {carsData.totalDocs} {carsData.totalDocs === 1 ? "auto" : "autos"} encontrados
            </span>
          </div>

          {/* Cars Grid */}
          <CarGrid cars={carsData.docs} />

          {/* Pagination */}
          {carsData.totalPages > 1 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Página {carsData.page} de {carsData.totalPages}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
