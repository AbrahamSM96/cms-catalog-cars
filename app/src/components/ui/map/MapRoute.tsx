'use client'

import type * as MapLibreGL from 'maplibre-gl'
import { useEffect, useId } from 'react'

import type { MapRouteProps } from './types'
import { useMap } from './context'

/**
 * Draws a polyline route on the map from an array of coordinates.
 *
 * @param props - MapRouteProps
 * @param props.color - Line color as a CSS color value.
 * @param props.coordinates - The [longitude, latitude] pairs defining the route.
 * @param props.dashArray - Dash pattern for dashed lines.
 * @param props.id - Optional unique identifier for the route layer.
 * @param props.interactive - Whether the route responds to mouse events.
 * @param props.onClick - Callback when the route is clicked.
 * @param props.onMouseEnter - Callback when the cursor enters the route.
 * @param props.onMouseLeave - Callback when the cursor leaves the route.
 * @param props.opacity - Line opacity from 0 to 1.
 * @param props.width - Line width in pixels.
 * @returns Nothing; the route is drawn imperatively.
 */
function MapRoute({
  color = '#4285F4',
  coordinates,
  dashArray,
  id: propId,
  interactive = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  opacity = 0.8,
  width = 3,
}: MapRouteProps): null {
  const { isLoaded, map } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `route-source-${id}`
  const layerId = `route-layer-${id}`

  // Add source and layer on mount
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      data: {
        geometry: { coordinates: [], type: 'LineString' },
        properties: {},
        type: 'Feature',
      },
      type: 'geojson',
    })

    map.addLayer({
      id: layerId,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': color,
        'line-opacity': opacity,
        'line-width': width,
        ...(dashArray && { 'line-dasharray': dashArray }),
      },
      source: sourceId,
      type: 'line',
    })

    return (): void => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // When coordinates change, update the source data
  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData({
        geometry: { coordinates, type: 'LineString' },
        properties: {},
        type: 'Feature',
      })
    }
  }, [isLoaded, map, coordinates, sourceId])

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return

    map.setPaintProperty(layerId, 'line-color', color)
    map.setPaintProperty(layerId, 'line-width', width)
    map.setPaintProperty(layerId, 'line-opacity', opacity)
    map.setPaintProperty(layerId, 'line-dasharray', dashArray)
  }, [isLoaded, map, layerId, color, width, opacity, dashArray])

  // Handle click and hover events
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return

    /**
     * Forward a route click to the handler.
     */
    const handleClick = (): void => {
      onClick?.()
    }
    /**
     * Show the pointer cursor and forward mouse-enter.
     */
    const handleMouseEnter = (): void => {
      map.getCanvas().style.cursor = 'pointer'
      onMouseEnter?.()
    }
    /**
     * Reset the cursor and forward mouse-leave.
     */
    const handleMouseLeave = (): void => {
      map.getCanvas().style.cursor = ''
      onMouseLeave?.()
    }

    map.on('click', layerId, handleClick)
    map.on('mouseenter', layerId, handleMouseEnter)
    map.on('mouseleave', layerId, handleMouseLeave)

    return (): void => {
      map.off('click', layerId, handleClick)
      map.off('mouseenter', layerId, handleMouseEnter)
      map.off('mouseleave', layerId, handleMouseLeave)
    }
  }, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive])

  return null
}

export { MapRoute }
