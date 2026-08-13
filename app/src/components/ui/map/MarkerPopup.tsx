'use client'

import { useEffect, useMemo } from 'react'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'
import MapLibreGL from 'maplibre-gl'

import type { MarkerPopupProps } from './types'
import { PopupCloseButton } from './PopupCloseButton'
import { useMarkerContext } from './context'

/**
 * Popup anchored to the enclosing marker, opened on marker click.
 *
 * @param props - MarkerPopupProps
 * @param props.children - The popup content.
 * @param props.className - Additional CSS classes for the popup container.
 * @param props.closeButton - Whether to show a close button.
 * @returns A portal into the popup content element.
 */
function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps): React.ReactPortal {
  const { map, marker } = useMarkerContext()
  const container = useMemo(() => document.createElement('div'), [])
  const { maxWidth, offset } = popupOptions

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth('none')
      .setDOMContent(container)

    return popupInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    popup.setDOMContent(container)
    marker.setPopup(popup)

    return (): void => {
      marker.setPopup(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Sync popup options when they change.
  useEffect(() => {
    popup.setOffset(offset ?? 16)
    if (maxWidth) {
      popup.setMaxWidth(maxWidth)
    }
  }, [popup, offset, maxWidth])

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

export { MarkerPopup }
