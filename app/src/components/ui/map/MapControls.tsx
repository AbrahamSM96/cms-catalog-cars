'use client'

import { Loader2, Locate, Maximize, Minus, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { clsx } from 'clsx'

import { CompassButton } from './CompassButton'
import { ControlButton } from './ControlButton'
import { ControlGroup } from './ControlGroup'
import type { MapControlsProps } from './types'
import { useMap } from './context'

const positionClasses = {
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-10 right-2',
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
}

/**
 * Overlay control cluster (zoom, compass, locate, fullscreen) for a `Map`.
 *
 * @param props - MapControlsProps
 * @param props.className - Additional CSS classes for the controls container.
 * @param props.onLocate - Callback with the user coordinates when located.
 * @param props.position - Position of the controls on the map.
 * @param props.showCompass - Whether to show the compass button.
 * @param props.showFullscreen - Whether to show the fullscreen toggle.
 * @param props.showLocate - Whether to show the locate button.
 * @param props.showZoom - Whether to show the zoom buttons.
 * @returns The controls element.
 */
function MapControls({
  className,
  onLocate,
  position = 'bottom-right',
  showCompass = false,
  showFullscreen = false,
  showLocate = false,
  showZoom = true,
}: MapControlsProps): React.JSX.Element {
  const { map } = useMap()
  const [waitingForLocation, setWaitingForLocation] = useState(false)

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 })
  }, [map])

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 })
  }, [map])

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 })
  }, [map])

  const handleLocate = useCallback(() => {
    if (!('geolocation' in navigator)) return
    setWaitingForLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        map?.flyTo({
          center: [coords.longitude, coords.latitude],
          duration: 1500,
          zoom: 14,
        })
        onLocate?.(coords)
        setWaitingForLocation(false)
      },
      () => {
        setWaitingForLocation(false)
      },
      // Without a timeout the spec default is Infinity: a dismissed permission
      // prompt would leave the button disabled forever.
      { timeout: 10000 }
    )
  }, [map, onLocate])

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer()
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }, [map])

  return (
    <div
      className={clsx(
        'absolute z-10 flex flex-col gap-1.5',
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton label="Zoom in" onClick={handleZoomIn}>
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton label="Zoom out" onClick={handleZoomOut}>
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={handleResetBearing} />
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            disabled={waitingForLocation}
            label="Find my location"
            onClick={handleLocate}
          >
            {waitingForLocation ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton label="Toggle fullscreen" onClick={handleFullscreen}>
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  )
}

export { MapControls }
