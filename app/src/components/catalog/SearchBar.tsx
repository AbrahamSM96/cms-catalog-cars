'use client'

import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import type { SearchSuggestion } from '@/types/car'
import { filterSuggestions } from '@/lib/fuzzy-search'

/** Cuántas sugerencias se despliegan a la vez. */
const VISIBLE_SUGGESTIONS = 6

/** Ninguna opción resaltada. */
const NONE = -1

interface SearchBarProps {
  /**
   * Las sugerencias del inventario publicado. Vienen ya calculadas desde el
   * servidor (`getSearchIndex`), así que el desplegable filtra en memoria y no
   * hace una llamada por tecla. Vacío deja la barra sin autocompletado.
   */
  suggestions?: SearchSuggestion[]
}

/**
 * SearchBar — la barra de búsqueda del catálogo, con autocompletado.
 *
 * El desplegable se arma con `filterSuggestions`, que corrige lo tecleado
 * antes de filtrar: escribir "masda" ofrece "Mazda 3" igual que escribirlo
 * bien. Y como las sugerencias solo contienen autos disponibles, ninguna lleva
 * a un catálogo vacío.
 *
 * @param props - Component props.
 */
export function SearchBar(props: SearchBarProps): React.JSX.Element {
  const { suggestions = [] } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(urlSearch)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)
  const [isOpen, setIsOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(NONE)

  // Sync with URL search param without an effect
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearch(urlSearch)
  }

  const matches =
    isOpen && search.trim()
      ? filterSuggestions(search, suggestions, VISIBLE_SUGGESTIONS)
      : []

  /**
   * Lanza la búsqueda y cierra el desplegable.
   *
   * @param term - El texto a buscar.
   */
  const submit = (term: string): void => {
    setIsOpen(false)
    setHighlighted(NONE)
    if (term.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(term)}`, {
        scroll: false,
      })
    } else {
      router.push('/catalogo', { scroll: false })
    }
  }

  /**
   * Toma una sugerencia del desplegable.
   *
   * @param label - La sugerencia elegida.
   */
  const choose = (label: string): void => {
    setSearch(label)
    submit(label)
  }

  /**
   * handleSearch
   *
   * @param e - Form event.
   */
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    submit(search)
  }

  /**
   * handleClear
   */
  const handleClear = (): void => {
    setSearch('')
    setIsOpen(false)
    setHighlighted(NONE)
    router.push('/catalogo', { scroll: false })
  }

  /**
   * Navegación con teclado sobre el desplegable.
   *
   * @param e - Keyboard event.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlighted(NONE)
      return
    }
    if (matches.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((index) => (index + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((index) =>
        index <= 0 ? matches.length - 1 : index - 1
      )
    } else if (e.key === 'Enter') {
      const match = matches[highlighted]
      if (match) {
        e.preventDefault()
        choose(match.label)
      }
    }
  }

  return (
    <form
      className="relative w-full max-w-2xl"
      onSubmit={handleSearch}
      role="search"
    >
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
          aria-activedescendant={
            matches[highlighted] ? `suggestion-${highlighted}` : undefined
          }
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={matches.length > 0}
          aria-label="Buscar autos"
          autoComplete="off"
          className="shadow-soft focus:shadow-float w-full cursor-text rounded-2xl border border-slate-200 bg-white py-4 pr-32 pl-14 text-slate-900 transition-all duration-300 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none"
          onBlur={() => setIsOpen(false)}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
            setHighlighted(NONE)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por marca, modelo o versión..."
          role="combobox"
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

      {/* Suggestions */}
      {matches.length > 0 && (
        <ul
          className="shadow-float absolute top-full right-0 left-0 z-30 mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-1.5 text-left"
          id="search-suggestions"
          role="listbox"
        >
          {matches.map((match, index) => (
            <li
              aria-selected={index === highlighted}
              className={clsx(
                'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors duration-150',
                index === highlighted ? 'bg-accent-50' : 'hover:bg-slate-50'
              )}
              id={`suggestion-${index}`}
              key={match.label}
              onClick={() => choose(match.label)}
              // El mousedown se adelanta al blur del input, que cerraría la
              // lista antes de que el click llegue a registrarse.
              onMouseDown={(e) => e.preventDefault()}
              role="option"
            >
              <svg
                aria-hidden="true"
                className={clsx(
                  'h-4 w-4 shrink-0 transition-colors duration-150',
                  index === highlighted ? 'text-accent-600' : 'text-slate-400'
                )}
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
              <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                {match.label}
              </span>
              <span className="shrink-0 text-sm text-slate-500 tabular-nums">
                {match.count} {match.count === 1 ? 'auto' : 'autos'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
