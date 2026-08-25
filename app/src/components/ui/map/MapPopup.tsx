'use client'

import * as MapLibreGL from 'maplibre-gl'
import { useEffect, useMemo, useRef } from 'react'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'

import type { MapPopupProps } from './types'
import { PopupCloseButton } from './PopupCloseButton'
import { useMap } from './context'

/**
 * Standalone popup anchored to a coordinate (independent of any marker).
 *
 * @param props - MapPopupProps
 * @param props.children - The popup content.
 * @param props.className - Additional CSS classes for the popup container.
 * @param props.closeButton - Whether to show a close button.
 * @param props.latitude - Latitude coordinate for the popup.
 * @param props.longitude - Longitude coordinate for the popup.
 * @param props.onClose - Callback fired when the popup is closed.
 * @returns A portal into the popup content element.
 */
function MapPopup({
  children,
  className,
  closeButton = false,
  latitude,
  longitude,
  onClose,
  ...popupOptions
}: MapPopupProps): React.ReactPortal {
  const { map } = useMap()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const container = useMemo(() => document.createElement('div'), [])
  const { maxWidth, offset } = popupOptions

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth('none')
      .setLngLat([longitude, latitude])

    return popupInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    /**
     * Forward the popup close event to the latest handler.
     */
    const onCloseProp = (): void => onCloseRef.current?.()

    popup.on('close', onCloseProp)

    popup.setDOMContent(container)
    popup.addTo(map)

    return (): void => {
      popup.off('close', onCloseProp)
      if (popup.isOpen()) {
        popup.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Sync popup position and options when they change.
  useEffect(() => {
    const current = popup.getLngLat()
    if (!current || current.lng !== longitude || current.lat !== latitude) {
      popup.setLngLat([longitude, latitude])
    }
    popup.setOffset(offset ?? 16)
    if (maxWidth) {
      popup.setMaxWidth(maxWidth)
    }
  }, [popup, longitude, latitude, offset, maxWidth])

  /**
   * Remove the popup from the map.
   */
  const handleClose = (): void => {
    popup.remove()
  }

  return createPortal(
    <div
      className={clsx(
        'relative max-w-62 rounded-md border bg-popover p-3 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95 duration-200 ease-out',
        className
      )}
    >
      {closeButton && <PopupCloseButton onClick={handleClose} />}
      {children}
    </div>,
    container
  )
}

export { MapPopup }
