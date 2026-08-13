'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/**
 * Read an explicit theme from the document (works with next-themes, etc.).
 * Covers both `attribute="class"` (the default) and `attribute="data-theme"`.
 *
 * @returns The document theme, or `null` when none is set.
 */
function getDocumentTheme(): Theme | null {
  if (typeof document === 'undefined') return null
  const root = document.documentElement
  if (root.classList.contains('dark')) return 'dark'
  if (root.classList.contains('light')) return 'light'
  const dataTheme = root.dataset.theme
  if (dataTheme === 'dark' || dataTheme === 'light') return dataTheme
  return null
}

/**
 * Read the operating-system color-scheme preference.
 *
 * @returns The system theme, defaulting to `light` on the server.
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Resolve the effective theme, preferring an explicit prop and otherwise
 * detecting the document/system theme reactively.
 *
 * @param themeProp - An explicit theme that, when provided, disables detection.
 * @returns The resolved theme.
 */
function useResolvedTheme(themeProp?: 'light' | 'dark'): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(
    () => getDocumentTheme() ?? getSystemTheme()
  )

  useEffect(() => {
    if (themeProp) return // Skip detection if theme is provided via prop

    // Watch for document theme changes (e.g., next-themes toggling the class
    // or the data-theme attribute).
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme()
      if (docTheme) {
        setDetectedTheme(docTheme)
      }
    })
    observer.observe(document.documentElement, {
      attributeFilter: ['class', 'data-theme'],
      attributes: true,
    })

    // Also watch for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    /**
     * React to system color-scheme changes when no document theme is set.
     *
     * @param e - The media query change event.
     */
    const handleSystemChange = (e: MediaQueryListEvent): void => {
      // Only use system preference if no document class is set
      if (!getDocumentTheme()) {
        setDetectedTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleSystemChange)

    return (): void => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }, [themeProp])

  return themeProp ?? detectedTheme
}

export { getDocumentTheme, getSystemTheme, useResolvedTheme }
export type { Theme }
