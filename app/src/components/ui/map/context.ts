'use client'

import type * as MapLibreGL from 'maplibre-gl'
import { createContext, useContext } from 'react'

import type { Theme } from './theme'

type MapContextValue = {
  map: MapLibreGL.Map | null
  isLoaded: boolean
  resolvedTheme: Theme
}

const MapContext = createContext<MapContextValue | null>(null)

/**
 * Access the enclosing `Map` context.
 *
 * @returns The map context value.
 */
function useMap(): MapContextValue {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within a Map component')
  }
  return context
}

type MarkerContextValue = {
  marker: MapLibreGL.Marker
  map: MapLibreGL.Map | null
}

const MarkerContext = createContext<MarkerContextValue | null>(null)

/**
 * Access the enclosing `MapMarker` context.
 *
 * @returns The marker context value.
 */
function useMarkerContext(): MarkerContextValue {
  const context = useContext(MarkerContext)
  if (!context) {
    throw new Error('Marker components must be used within MapMarker')
  }
  return context
}

export { MapContext, MarkerContext, useMap, useMarkerContext }
export type { MapContextValue, MarkerContextValue }
