'use client'

import type * as GeoJSON from 'geojson'
import { useEffect, useId, useMemo, useRef } from 'react'
import type MapLibreGL from 'maplibre-gl'

import type {
  MapFillPaint,
  MapGeoJSONFeature,
  MapGeoJSONProps,
  MapLinePaint,
} from './types'
import { mergeHoverPaint } from './utils'
import type { Theme } from './theme'
import { useMap } from './context'

// Monochrome defaults: a neutral-gray fill (hex of the grayscale chart tokens)
// with a fixed near-surface line for thin separators. Colors are hardcoded (not
// theme tokens), tuned for a typical light/dark surface. Override via
// `fillPaint` / `linePaint`.
const GEOJSON_DEFAULT_COLORS = {
  dark: { fill: '#404040', line: '#171717' },
  light: { fill: '#d4d4d4', line: '#ffffff' },
} satisfies Record<Theme, { fill: string; line: string }>

/**
 * Renders arbitrary GeoJSON as fill + outline layers on the map. Composes like
 * `MapRoute` / `MapArc` — drop it inside `<Map>` (typically with `blank`) for
 * choropleths and region/data maps. For full control over expressions and
 * multiple layers, manage layers directly via `useMap()` instead.
 *
 * @param props - MapGeoJSONProps
 * @param props.beforeId - Layer id to insert the layers before (z-order).
 * @param props.data - The GeoJSON data or a URL to fetch it from.
 * @param props.fillHoverPaint - Fill paint applied to the hovered feature.
 * @param props.fillPaint - Fill paint, or `false` to omit the fill layer.
 * @param props.id - Optional unique identifier prefix for the source/layers.
 * @param props.interactive - Whether features respond to mouse events.
 * @param props.linePaint - Outline paint, or `false` to omit the line layer.
 * @param props.onClick - Callback when a feature is clicked.
 * @param props.onHover - Callback when the hovered feature changes.
 * @param props.promoteId - Feature property to promote to the feature `id`.
 * @returns Nothing; the layers are managed imperatively.
 */
function MapGeoJSON<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  beforeId,
  data,
  fillHoverPaint,
  fillPaint,
  id: propId,
  interactive = false,
  linePaint,
  onClick,
  onHover,
  promoteId,
}: MapGeoJSONProps<P>): null {
  const { isLoaded, map, resolvedTheme } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `geojson-source-${id}`
  const fillLayerId = `geojson-fill-${id}`
  const lineLayerId = `geojson-line-${id}`

  const defaults = GEOJSON_DEFAULT_COLORS[resolvedTheme]

  const showFill = fillPaint !== false
  const showLine = linePaint !== false

  const mergedFillPaint = useMemo(
    () =>
      mergeHoverPaint(
        { 'fill-color': defaults.fill, ...fillPaint },
        fillHoverPaint
      ),
    [defaults.fill, fillPaint, fillHoverPaint]
  )
  const mergedLinePaint = useMemo(
    () => ({
      'line-color': defaults.line,
      'line-width': 0.5,
      ...linePaint,
    }),
    [defaults.line, linePaint]
  )
  const latestRef = useRef({ onClick, onHover })
  latestRef.current = { onClick, onHover }

  // Add source on mount.
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      data,
      type: 'geojson',
      ...(promoteId ? { promoteId } : {}),
    })

    return (): void => {
      try {
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // style may be mid-reload
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Sync data when it changes.
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as
      | MapLibreGL.GeoJSONSource
      | undefined
    source?.setData(data as never)
  }, [isLoaded, map, data, sourceId])

  // Sync layers and paint when visibility or styling changes.
  useEffect(() => {
    if (!isLoaded || !map) return

    const source = map.getSource(sourceId)
    if (!source) return

    if (showFill && !map.getLayer(fillLayerId)) {
      map.addLayer(
        {
          id: fillLayerId,
          paint: mergedFillPaint,
          source: sourceId,
          type: 'fill',
        },
        beforeId
      )
    } else if (!showFill && map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId)
    }

    if (showLine && !map.getLayer(lineLayerId)) {
      map.addLayer(
        {
          id: lineLayerId,
          paint: mergedLinePaint,
          source: sourceId,
          type: 'line',
        },
        beforeId
      )
    } else if (!showLine && map.getLayer(lineLayerId)) {
      map.removeLayer(lineLayerId)
    }

    if (showFill && map.getLayer(fillLayerId)) {
      for (const [key, value] of Object.entries(mergedFillPaint)) {
        map.setPaintProperty(
          fillLayerId,
          key as keyof MapFillPaint,
          value as never
        )
      }
    }
    if (showLine && map.getLayer(lineLayerId)) {
      for (const [key, value] of Object.entries(mergedLinePaint)) {
        map.setPaintProperty(
          lineLayerId,
          key as keyof MapLinePaint,
          value as never
        )
      }
    }
  }, [
    isLoaded,
    map,
    sourceId,
    fillLayerId,
    lineLayerId,
    showFill,
    showLine,
    mergedFillPaint,
    mergedLinePaint,
    beforeId,
  ])

  // Interaction handlers (bound to the fill layer).
  useEffect(() => {
    if (!isLoaded || !map || !interactive || !showFill) return

    let hoveredId: string | number | null = null

    /**
     * Move the `hover` feature-state from the previous feature to the next.
     *
     * @param next - The id of the feature to mark hovered, or `null`.
     */
    const setHover = (next: string | number | null): void => {
      if (next === hoveredId) return
      const sourceExists = !!map.getSource(sourceId)
      if (hoveredId != null && sourceExists) {
        map.setFeatureState(
          { id: hoveredId, source: sourceId },
          { hover: false }
        )
      }
      hoveredId = next
      if (next != null && sourceExists) {
        map.setFeatureState({ id: next, source: sourceId }, { hover: true })
      }
    }

    /**
     * Track the hovered feature and forward the hover event.
     *
     * @param e - The MapLibre mouse event.
     */
    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent): void => {
      const feature = e.features?.[0]
      if (!feature) return
      map.getCanvas().style.cursor = 'pointer'

      const featureId = feature.id
      if (featureId === hoveredId) return
      setHover(featureId ?? null)
      latestRef.current.onHover?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        originalEvent: e,
      })
    }

    /**
     * Clear the hover state when the cursor leaves the layer.
     */
    const handleMouseLeave = (): void => {
      setHover(null)
      map.getCanvas().style.cursor = ''
      latestRef.current.onHover?.(null)
    }

    /**
     * Forward the click event for the feature under the cursor.
     *
     * @param e - The MapLibre mouse event.
     */
    const handleClick = (e: MapLibreGL.MapLayerMouseEvent): void => {
      const feature = e.features?.[0]
      if (!feature) return
      latestRef.current.onClick?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        originalEvent: e,
      })
    }

    map.on('mousemove', fillLayerId, handleMouseMove)
    map.on('mouseleave', fillLayerId, handleMouseLeave)
    map.on('click', fillLayerId, handleClick)

    return (): void => {
      map.off('mousemove', fillLayerId, handleMouseMove)
      map.off('mouseleave', fillLayerId, handleMouseLeave)
      map.off('click', fillLayerId, handleClick)
      setHover(null)
      map.getCanvas().style.cursor = ''
    }
  }, [isLoaded, map, fillLayerId, sourceId, interactive, showFill])

  return null
}

export { MapGeoJSON }
