'use client'

import type * as GeoJSON from 'geojson'
import { useEffect, useId, useMemo, useRef } from 'react'
import type MapLibreGL from 'maplibre-gl'

import type {
  MapArcDatum,
  MapArcLineLayout,
  MapArcLinePaint,
  MapArcProps,
} from './types'
import { mergeHoverPaint } from './utils'
import { useMap } from './context'

const DEFAULT_ARC_CURVATURE = 0.2
const DEFAULT_ARC_SAMPLES = 64
const ARC_HIT_MIN_WIDTH = 12
const ARC_HIT_PADDING = 6

const DEFAULT_ARC_PAINT: MapArcLinePaint = {
  'line-color': '#4285F4',
  'line-opacity': 0.85,
  'line-width': 2,
}

const DEFAULT_ARC_LAYOUT: MapArcLineLayout = {
  'line-cap': 'round',
  'line-join': 'round',
}

/**
 * Compute the sampled coordinates of a quadratic Bézier arc between two points.
 *
 * @param from - Start coordinate as [longitude, latitude].
 * @param to - End coordinate as [longitude, latitude].
 * @param curvature - How far the arc bows away from a straight line.
 * @param samples - Number of samples used to render the curve.
 * @returns The arc coordinates as [longitude, latitude] pairs.
 */
function buildArcCoordinates(
  from: [number, number],
  to: [number, number],
  curvature: number,
  samples: number
): [number, number][] {
  const [x0, y0] = from
  const [xTo, y2] = to
  // Unwrap the destination longitude so |dx| <= 180. This makes arcs that
  // straddle the antimeridian (e.g. Tokyo -> San Francisco) bow the short way
  // across the Pacific instead of the long way around the globe. Resulting
  // longitudes may fall outside [-180, 180]; MapLibre renders them correctly
  // on the globe projection, and on mercator when world copies are enabled.
  const rawDx = xTo - x0
  const x2 = rawDx > 180 ? xTo - 360 : rawDx < -180 ? xTo + 360 : xTo
  const dx = x2 - x0
  const dy = y2 - y0
  const distance = Math.hypot(dx, dy)

  if (distance === 0 || curvature === 0) return [from, [x2, y2]]

  const mx = (x0 + x2) / 2
  const my = (y0 + y2) / 2
  const nx = -dy / distance
  const ny = dx / distance
  const offset = distance * curvature
  const cx = mx + nx * offset
  const cy = my + ny * offset

  const points: [number, number][] = []
  const segments = Math.max(2, Math.floor(samples))
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const inv = 1 - t
    const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2
    const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y2
    points.push([x, y])
  }
  return points
}

/**
 * Renders curved arcs between coordinate pairs, with an invisible wider hit
 * layer for reliable hover/click interaction.
 *
 * @param props - MapArcProps
 * @param props.beforeId - Layer id to insert the arc layers before (z-order).
 * @param props.curvature - How far each arc bows away from a straight line.
 * @param props.data - The arcs to render; each must have a unique `id`.
 * @param props.hoverPaint - Paint applied to the arc under the cursor.
 * @param props.id - Optional unique identifier prefix for the source/layers.
 * @param props.interactive - Whether arcs respond to mouse events.
 * @param props.layout - MapLibre layout properties for the arc layer.
 * @param props.onClick - Callback when an arc is clicked.
 * @param props.onHover - Callback when the hovered arc changes.
 * @param props.paint - MapLibre paint properties for the arc layer.
 * @param props.samples - Number of samples used to render each curve.
 * @returns Nothing; the layers are managed imperatively.
 */
function MapArc<T extends MapArcDatum = MapArcDatum>({
  beforeId,
  curvature = DEFAULT_ARC_CURVATURE,
  data,
  hoverPaint,
  id: propId,
  interactive = true,
  layout,
  onClick,
  onHover,
  paint,
  samples = DEFAULT_ARC_SAMPLES,
}: MapArcProps<T>): null {
  const { isLoaded, map } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `arc-source-${id}`
  const layerId = `arc-layer-${id}`
  const hitLayerId = `arc-hit-layer-${id}`

  const mergedPaint = useMemo(
    () => mergeHoverPaint({ ...DEFAULT_ARC_PAINT, ...paint }, hoverPaint),
    [paint, hoverPaint]
  )
  const mergedLayout = useMemo(
    () => ({ ...DEFAULT_ARC_LAYOUT, ...layout }),
    [layout]
  )

  const hitWidth = useMemo(() => {
    const w = paint?.['line-width'] ?? DEFAULT_ARC_PAINT['line-width']
    const base = typeof w === 'number' ? w : ARC_HIT_MIN_WIDTH
    return Math.max(base + ARC_HIT_PADDING, ARC_HIT_MIN_WIDTH)
  }, [paint])

  const geoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
    () => ({
      features: data.map((arc) => {
        const { from, to, ...properties } = arc
        return {
          geometry: {
            coordinates: buildArcCoordinates(from, to, curvature, samples),
            type: 'LineString',
          },
          properties,
          type: 'Feature',
        }
      }),
      type: 'FeatureCollection',
    }),
    [data, curvature, samples]
  )

  const latestRef = useRef({ data, onClick, onHover })
  latestRef.current = { data, onClick, onHover }

  // Add source and layers on mount.
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      data: geoJSON,
      promoteId: 'id',
      type: 'geojson',
    })

    map.addLayer(
      {
        id: hitLayerId,
        layout: DEFAULT_ARC_LAYOUT,
        paint: {
          'line-color': 'rgba(0, 0, 0, 0)',
          'line-opacity': 1,
          'line-width': hitWidth,
        },
        source: sourceId,
        type: 'line',
      },
      beforeId
    )

    map.addLayer(
      {
        id: layerId,
        layout: mergedLayout,
        paint: mergedPaint,
        source: sourceId,
        type: 'line',
      },
      beforeId
    )

    return (): void => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Sync features when data / curvature / samples change.
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as
      | MapLibreGL.GeoJSONSource
      | undefined
    source?.setData(geoJSON)
  }, [isLoaded, map, geoJSON, sourceId])

  // Sync paint/layout when they change.
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return
    for (const [key, value] of Object.entries(mergedPaint)) {
      map.setPaintProperty(
        layerId,
        key as keyof MapArcLinePaint,
        value as never
      )
    }
    for (const [key, value] of Object.entries(mergedLayout)) {
      map.setLayoutProperty(
        layerId,
        key as keyof MapArcLineLayout,
        value as never
      )
    }
    if (map.getLayer(hitLayerId)) {
      map.setPaintProperty(hitLayerId, 'line-width', hitWidth)
    }
  }, [isLoaded, map, layerId, hitLayerId, mergedPaint, mergedLayout, hitWidth])

  // Interaction handlers
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return

    let hoveredId: string | number | null = null

    /**
     * Move the `hover` feature-state from the previous arc to the next.
     *
     * @param next - The id of the arc to mark hovered, or `null`.
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
     * Look up the arc datum matching a rendered feature id.
     *
     * @param featureId - The rendered feature id.
     * @returns The matching arc datum, if any.
     */
    const findArc = (featureId: string | number | undefined): T | undefined =>
      featureId == null
        ? undefined
        : latestRef.current.data.find(
            (arc) => String(arc.id) === String(featureId)
          )

    /**
     * Track the hovered arc and forward the hover event.
     *
     * @param e - The MapLibre mouse event.
     */
    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent): void => {
      const featureId = e.features?.[0]?.id as string | number | undefined
      if (featureId == null || featureId === hoveredId) return

      setHover(featureId)
      map.getCanvas().style.cursor = 'pointer'

      const arc = findArc(featureId)
      if (arc) {
        latestRef.current.onHover?.({
          arc: arc as T,
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
          originalEvent: e,
        })
      }
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
     * Forward the click event for the arc under the cursor.
     *
     * @param e - The MapLibre mouse event.
     */
    const handleClick = (e: MapLibreGL.MapLayerMouseEvent): void => {
      const arc = findArc(e.features?.[0]?.id as string | number | undefined)
      if (!arc) return
      latestRef.current.onClick?.({
        arc: arc as T,
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        originalEvent: e,
      })
    }

    map.on('mousemove', hitLayerId, handleMouseMove)
    map.on('mouseleave', hitLayerId, handleMouseLeave)
    map.on('click', hitLayerId, handleClick)

    return (): void => {
      map.off('mousemove', hitLayerId, handleMouseMove)
      map.off('mouseleave', hitLayerId, handleMouseLeave)
      map.off('click', hitLayerId, handleClick)
      setHover(null)
      map.getCanvas().style.cursor = ''
    }
  }, [isLoaded, map, hitLayerId, sourceId, interactive])

  return null
}

export { MapArc }
