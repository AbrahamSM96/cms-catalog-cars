"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Brand } from "../../types/car";

interface FilterBarProps {
  brands: Brand[];
}

export function FilterBar({ brands }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleClearAll = () => {
    router.push(pathname, { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchParams.get('brand') ||
    searchParams.get('status') ||
    searchParams.get('transmission') ||
    searchParams.get('minYear') ||
    searchParams.get('search');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Filtros
          </h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Filter */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Marca
          </label>
          <select
            id="brand"
            className="mt-1 block w-full cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-red-600"
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            value={searchParams.get("brand") || "all"}
          >
            <option value="all">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Estado
          </label>
          <select
            id="status"
            className="mt-1 block w-full cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-red-600"
            onChange={(e) => handleFilterChange("status", e.target.value)}
            value={searchParams.get("status") || "all"}
          >
            <option value="all">Todos</option>
            <option value="available">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </div>

        {/* Transmission Filter */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Transmisión
          </label>
          <select
            id="transmission"
            className="mt-1 block w-full cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-red-600"
            onChange={(e) => handleFilterChange("transmission", e.target.value)}
            value={searchParams.get("transmission") || "all"}
          >
            <option value="all">Todas</option>
            <option value="automatic">Automática</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label htmlFor="minYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Año mínimo
          </label>
          <select
            id="minYear"
            className="mt-1 block w-full cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-red-600"
            onChange={(e) => handleFilterChange("minYear", e.target.value)}
            value={searchParams.get("minYear") || "all"}
          >
            <option value="all">Cualquier año</option>
            <option value="2020">2020+</option>
            <option value="2018">2018+</option>
            <option value="2015">2015+</option>
            <option value="2010">2010+</option>
          </select>
        </div>
        </div>
      </div>
    </div>
  );
}
