'use client'

import { useEffect, useMemo } from 'react'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'
import MapLibreGL from 'maplibre-gl'

import type { MarkerTooltipProps } from './types'
import { useMarkerContext } from './context'

/**
 * Tooltip anchored to the enclosing marker, shown on hover.
 *
 * @param props - MarkerTooltipProps
 * @param props.children - The tooltip content.
 * @param props.className - Additional CSS classes for the tooltip container.
 * @returns A portal into the tooltip content element.
 */
function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps): React.ReactPortal {
  const { map, marker } = useMarkerContext()
  const container = useMemo(() => document.createElement('div'), [])
  const { maxWidth, offset } = popupOptions

  const tooltip = useMemo(() => {
    const tooltipInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
      closeOnClick: true,
    }).setMaxWidth('none')

    return tooltipInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    tooltip.setDOMContent(container)

    /**
     * Show the tooltip at the marker position on hover.
     */
    const handleMouseEnter = (): void => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map)
    }
    /**
     * Hide the tooltip when the cursor leaves the marker.
     */
    const handleMouseLeave = (): void => {
      tooltip.remove()
    }

    marker.getElement()?.addEventListener('mouseenter', handleMouseEnter)
    marker.getElement()?.addEventListener('mouseleave', handleMouseLeave)

    return (): void => {
      marker.getElement()?.removeEventListener('mouseenter', handleMouseEnter)
      marker.getElement()?.removeEventListener('mouseleave', handleMouseLeave)
      tooltip.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Sync tooltip options when they change.
  useEffect(() => {
    tooltip.setOffset(offset ?? 16)
    if (maxWidth) {
      tooltip.setMaxWidth(maxWidth)
    }
  }, [tooltip, offset, maxWidth])

  return createPortal(
    <div
      className={clsx(
        'pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs text-balance text-background shadow-md',
        'animate-in fade-in-0 zoom-in-95 duration-200 ease-out',
        className
      )}
    >
      {children}
    </div>,
    container
  )
}

export { MarkerTooltip }
