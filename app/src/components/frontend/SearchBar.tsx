"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync with URL search param
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearch(currentSearch);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(search)}`, { scroll: false });
    } else {
      router.push("/catalogo", { scroll: false });
    }
  };

  const handleClear = () => {
    setSearch("");
    router.push("/catalogo", { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="group relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Buscar por marca, modelo o versión..."
          aria-label="Buscar autos"
          className="w-full cursor-text rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-32 text-slate-900 shadow-soft transition-all duration-300 placeholder:text-slate-400 focus:border-red-500 focus:shadow-float focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Clear Button - Show when there's text */}
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-28 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
