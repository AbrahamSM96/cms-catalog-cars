'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/**
 * SearchBar
 */
export function SearchBar(): React.JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(urlSearch)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)

  // Sync with URL search param without an effect
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearch(urlSearch)
  }

  /**
   * handleSearch
   *
   * @param e - Form event.
   */
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(search)}`, {
        scroll: false,
      })
    } else {
      router.push('/catalogo', { scroll: false })
    }
  }

  /**
   * handleClear
   */
  const handleClear = (): void => {
    setSearch('')
    router.push('/catalogo', { scroll: false })
  }

  return (
    <form className="w-full max-w-2xl" onSubmit={handleSearch}>
      <div className="group relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-accent-600">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>

        {/* Input */}
        <input
          aria-label="Buscar autos"
          className="shadow-soft focus:shadow-float w-full cursor-text rounded-2xl border border-slate-200 bg-white py-4 pr-32 pl-14 text-slate-900 transition-all duration-300 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo o versión..."
          type="text"
          value={search}
        />

        {/* Clear Button - Show when there's text */}
        {search && (
          <button
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-28 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={handleClear}
            title="Limpiar búsqueda"
            type="button"
          >
            <svg
              className="h-5 w-5"
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
          </button>
        )}

        {/* Search Button */}
        <button
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/30 active:scale-95"
          type="submit"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
