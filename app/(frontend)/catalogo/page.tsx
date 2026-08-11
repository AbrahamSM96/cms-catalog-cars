import type { Metadata } from "next";
import { getCars, getBrands } from "@/lib/payload-client";
import { SearchBar } from "@/components/frontend/SearchBar";
import { FilterBar } from "@/components/frontend/FilterBar";
import { CarGrid } from "@/components/frontend/CarGrid";
import type { CarFilters } from "@/types/car";

export const metadata: Metadata = {
  title: "Catálogo de autos seminuevos",
  description:
    "Explora nuestro catálogo de autos seminuevos. Filtra por marca, año, precio y transmisión.",
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

  const [carsData, brands] = await Promise.all([getCars(filters), getBrands()]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <section className="relative overflow-hidden bg-white pt-28 pb-12 sm:pt-32">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Catálogo</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Encuentra el auto seminuevo ideal para ti.
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <FilterBar brands={brands} />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {params.search ? `Resultados para "${params.search}"` : "Todos los autos"}
            </h2>
            <span className="text-sm font-medium text-slate-500">
              {carsData.totalDocs} {carsData.totalDocs === 1 ? "auto" : "autos"}
            </span>
          </div>

          <CarGrid cars={carsData.docs} />

          {carsData.totalPages > 1 && (
            <div className="mt-14 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-soft">
                Página {carsData.page} de {carsData.totalPages}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
