'use client'

import { useEffect, useMemo, useRef } from 'react'
import MapLibreGL from 'maplibre-gl'

import { MarkerContext, useMap } from './context'
import type { MapMarkerProps } from './types'

/**
 * Places a draggable/interactive marker on the map and provides marker context
 * to its children (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel).
 *
 * @param props - MapMarkerProps
 * @param props.children - The marker subcomponents.
 * @param props.draggable - Whether the marker can be dragged.
 * @param props.latitude - Latitude coordinate for the marker.
 * @param props.longitude - Longitude coordinate for the marker.
 * @param props.onClick - Callback when the marker is clicked.
 * @param props.onDrag - Callback fired continuously during a drag.
 * @param props.onDragEnd - Callback fired when a drag ends.
 * @param props.onDragStart - Callback fired when a drag starts.
 * @param props.onMouseEnter - Callback when the cursor enters the marker.
 * @param props.onMouseLeave - Callback when the cursor leaves the marker.
 * @returns The marker context provider.
 */
function MapMarker({
  children,
  draggable = false,
  latitude,
  longitude,
  onClick,
  onDrag,
  onDragEnd,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  ...markerOptions
}: MapMarkerProps): React.JSX.Element {
  const { map } = useMap()

  const callbacksRef = useRef({
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onMouseEnter,
    onMouseLeave,
  })
  callbacksRef.current = {
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onMouseEnter,
    onMouseLeave,
  }

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      draggable,
      element: document.createElement('div'),
    }).setLngLat([longitude, latitude])

    /**
     * Forward the marker click to the latest handler.
     *
     * @param e - The mouse event.
     */
    const handleClick = (e: MouseEvent): void =>
      callbacksRef.current.onClick?.(e)
    /**
     * Forward the marker mouse-enter to the latest handler.
     *
     * @param e - The mouse event.
     */
    const handleMouseEnter = (e: MouseEvent): void =>
      callbacksRef.current.onMouseEnter?.(e)
    /**
     * Forward the marker mouse-leave to the latest handler.
     *
     * @param e - The mouse event.
     */
    const handleMouseLeave = (e: MouseEvent): void =>
      callbacksRef.current.onMouseLeave?.(e)

    markerInstance.getElement()?.addEventListener('click', handleClick)
    markerInstance
      .getElement()
      ?.addEventListener('mouseenter', handleMouseEnter)
    markerInstance
      .getElement()
      ?.addEventListener('mouseleave', handleMouseLeave)

    /**
     * Forward the drag-start with the current coordinates.
     */
    const handleDragStart = (): void => {
      const lngLat = markerInstance.getLngLat()
      callbacksRef.current.onDragStart?.({ lat: lngLat.lat, lng: lngLat.lng })
    }
    /**
     * Forward the ongoing drag with the current coordinates.
     */
    const handleDrag = (): void => {
      const lngLat = markerInstance.getLngLat()
      callbacksRef.current.onDrag?.({ lat: lngLat.lat, lng: lngLat.lng })
    }
    /**
     * Forward the drag-end with the current coordinates.
     */
    const handleDragEnd = (): void => {
      const lngLat = markerInstance.getLngLat()
      callbacksRef.current.onDragEnd?.({ lat: lngLat.lat, lng: lngLat.lng })
    }

    markerInstance.on('dragstart', handleDragStart)
    markerInstance.on('drag', handleDrag)
    markerInstance.on('dragend', handleDragEnd)

    return markerInstance

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    marker.addTo(map)

    return (): void => {
      marker.remove()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  const { offset, pitchAlignment, rotation, rotationAlignment } = markerOptions

  useEffect(() => {
    const current = marker.getLngLat()
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude])
    }

    if (marker.isDraggable() !== draggable) {
      marker.setDraggable(draggable)
    }

    const currentOffset = marker.getOffset()
    const newOffset = offset ?? [0, 0]
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
      ? newOffset
      : [newOffset.x, newOffset.y]
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
      marker.setOffset(newOffset)
    }

    if (marker.getRotation() !== (rotation ?? 0)) {
      marker.setRotation(rotation ?? 0)
    }
    if (marker.getRotationAlignment() !== (rotationAlignment ?? 'auto')) {
      marker.setRotationAlignment(rotationAlignment ?? 'auto')
    }
    if (marker.getPitchAlignment() !== (pitchAlignment ?? 'auto')) {
      marker.setPitchAlignment(pitchAlignment ?? 'auto')
    }
  }, [
    marker,
    longitude,
    latitude,
    draggable,
    offset,
    rotation,
    rotationAlignment,
    pitchAlignment,
  ])

  const contextValue = useMemo(() => ({ map, marker }), [map, marker])

  return (
    <MarkerContext.Provider value={contextValue}>
      {children}
    </MarkerContext.Provider>
  )
}

export { MapMarker }
