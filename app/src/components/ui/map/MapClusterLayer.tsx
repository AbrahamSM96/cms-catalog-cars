'use client'

import type * as GeoJSON from 'geojson'
import { useEffect, useId, useRef } from 'react'
import type MapLibreGL from 'maplibre-gl'

import type { MapClusterLayerProps } from './types'
import { useMap } from './context'

const DEFAULT_CLUSTER_COLORS: [string, string, string] = [
  '#3b82f6',
  '#1d4ed8',
  '#1e3a8a',
]
const DEFAULT_CLUSTER_THRESHOLDS: [number, number] = [100, 750]

/**
 * Renders a clustered point layer with cluster circles, count labels, and
 * unclustered points, handling cluster expansion and point clicks.
 *
 * @param props - MapClusterLayerProps
 * @param props.clusterColors - Colors for cluster circles by point count.
 * @param props.clusterMaxZoom - Maximum zoom level to cluster points on.
 * @param props.clusterRadius - Cluster radius in pixels.
 * @param props.clusterThresholds - Point-count thresholds for color/size steps.
 * @param props.data - GeoJSON FeatureCollection or a URL to fetch it from.
 * @param props.onClusterClick - Callback when a cluster is clicked.
 * @param props.onPointClick - Callback when an unclustered point is clicked.
 * @param props.pointColor - Color for unclustered individual points.
 * @returns Nothing; the layers are managed imperatively.
 */
function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  clusterColors = DEFAULT_CLUSTER_COLORS,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterThresholds = DEFAULT_CLUSTER_THRESHOLDS,
  data,
  onClusterClick,
  onPointClick,
  pointColor = '#3b82f6',
}: MapClusterLayerProps<P>): null {
  const { isLoaded, map } = useMap()
  const id = useId()
  const sourceId = `cluster-source-${id}`
  const clusterLayerId = `clusters-${id}`
  const clusterCountLayerId = `cluster-count-${id}`
  const unclusteredLayerId = `unclustered-point-${id}`

  const stylePropsRef = useRef({
    clusterColors,
    clusterThresholds,
    pointColor,
  })

  // Add source and layers on mount
  useEffect(() => {
    if (!isLoaded || !map) return

    // Add clustered GeoJSON source
    map.addSource(sourceId, {
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
      data,
      type: 'geojson',
    })

    // Add cluster circles layer
    map.addLayer({
      filter: ['has', 'point_count'],
      id: clusterLayerId,
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          clusterColors[0],
          clusterThresholds[0],
          clusterColors[1],
          clusterThresholds[1],
          clusterColors[2],
        ],
        'circle-opacity': 0.85,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          clusterThresholds[0],
          30,
          clusterThresholds[1],
          40,
        ],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 0.75,
      },
      source: sourceId,
      type: 'circle',
    })

    // Add cluster count text layer
    map.addLayer({
      filter: ['has', 'point_count'],
      id: clusterCountLayerId,
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Semibold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#fff',
      },
      source: sourceId,
      type: 'symbol',
    })

    // Add unclustered point layer
    map.addLayer({
      filter: ['!', ['has', 'point_count']],
      id: unclusteredLayerId,
      paint: {
        'circle-color': pointColor,
        'circle-radius': 5,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2,
      },
      source: sourceId,
      type: 'circle',
    })

    return (): void => {
      try {
        if (map.getLayer(clusterCountLayerId))
          map.removeLayer(clusterCountLayerId)
        if (map.getLayer(unclusteredLayerId))
          map.removeLayer(unclusteredLayerId)
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, sourceId])

  // Update source data when data prop changes (only for non-URL data)
  useEffect(() => {
    if (!isLoaded || !map || typeof data === 'string') return

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData(data)
    }
  }, [isLoaded, map, data, sourceId])

  // Update layer styles when props change
  useEffect(() => {
    if (!isLoaded || !map) return

    const prev = stylePropsRef.current
    const colorsChanged =
      prev.clusterColors !== clusterColors ||
      prev.clusterThresholds !== clusterThresholds

    // Update cluster layer colors and sizes
    if (map.getLayer(clusterLayerId) && colorsChanged) {
      map.setPaintProperty(clusterLayerId, 'circle-color', [
        'step',
        ['get', 'point_count'],
        clusterColors[0],
        clusterThresholds[0],
        clusterColors[1],
        clusterThresholds[1],
        clusterColors[2],
      ])
      map.setPaintProperty(clusterLayerId, 'circle-radius', [
        'step',
        ['get', 'point_count'],
        20,
        clusterThresholds[0],
        30,
        clusterThresholds[1],
        40,
      ])
    }

    // Update unclustered point layer color
    if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor) {
      map.setPaintProperty(unclusteredLayerId, 'circle-color', pointColor)
    }

    stylePropsRef.current = { clusterColors, clusterThresholds, pointColor }
  }, [
    isLoaded,
    map,
    clusterLayerId,
    unclusteredLayerId,
    clusterColors,
    clusterThresholds,
    pointColor,
  ])

  // Handle click events
  useEffect(() => {
    if (!isLoaded || !map) return

    /**
     * Zoom into a clicked cluster, or delegate to `onClusterClick`.
     *
     * @param e - The MapLibre mouse event.
     */
    const handleClusterClick = async (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[]
      }
    ): Promise<void> => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId],
      })
      if (!features.length) return

      const feature = features[0]
      const clusterId = feature.properties?.cluster_id as number
      const pointCount = feature.properties?.point_count as number
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ]

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount)
      } else {
        // Default behavior: zoom to cluster expansion zoom
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
        const zoom = await source.getClusterExpansionZoom(clusterId)
        map.easeTo({
          center: coordinates,
          zoom,
        })
      }
    }

    /**
     * Forward a clicked unclustered point to `onPointClick`.
     *
     * @param e - The MapLibre mouse event.
     */
    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[]
      }
    ): void => {
      if (!onPointClick || !e.features?.length) return

      const feature = e.features[0]
      const coordinates = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number]

      // Handle world copies
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      onPointClick(
        feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
        coordinates
      )
    }

    /**
     * Show the pointer cursor when hovering a cluster.
     */
    const handleMouseEnterCluster = (): void => {
      map.getCanvas().style.cursor = 'pointer'
    }
    /**
     * Reset the cursor when leaving a cluster.
     */
    const handleMouseLeaveCluster = (): void => {
      map.getCanvas().style.cursor = ''
    }
    /**
     * Show the pointer cursor when hovering a clickable point.
     */
    const handleMouseEnterPoint = (): void => {
      if (onPointClick) {
        map.getCanvas().style.cursor = 'pointer'
      }
    }
    /**
     * Reset the cursor when leaving a point.
     */
    const handleMouseLeavePoint = (): void => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', clusterLayerId, handleClusterClick)
    map.on('click', unclusteredLayerId, handlePointClick)
    map.on('mouseenter', clusterLayerId, handleMouseEnterCluster)
    map.on('mouseleave', clusterLayerId, handleMouseLeaveCluster)
    map.on('mouseenter', unclusteredLayerId, handleMouseEnterPoint)
    map.on('mouseleave', unclusteredLayerId, handleMouseLeavePoint)

    return (): void => {
      map.off('click', clusterLayerId, handleClusterClick)
      map.off('click', unclusteredLayerId, handlePointClick)
      map.off('mouseenter', clusterLayerId, handleMouseEnterCluster)
      map.off('mouseleave', clusterLayerId, handleMouseLeaveCluster)
      map.off('mouseenter', unclusteredLayerId, handleMouseEnterPoint)
      map.off('mouseleave', unclusteredLayerId, handleMouseLeavePoint)
    }
  }, [
    isLoaded,
    map,
    clusterLayerId,
    unclusteredLayerId,
    sourceId,
    onClusterClick,
    onPointClick,
  ])

  return null
}

export { MapClusterLayer }
