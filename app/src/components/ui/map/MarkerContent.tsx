'use client'

import { clsx } from 'clsx'
import { createPortal } from 'react-dom'

import { DefaultMarkerIcon } from './DefaultMarkerIcon'
import type { MarkerContentProps } from './types'
import { useMarkerContext } from './context'

/**
 * Renders custom content into a marker's DOM element via a portal.
 *
 * @param props - MarkerContentProps
 * @param props.children - Custom marker content; defaults to a blue dot.
 * @param props.className - Additional CSS classes for the marker container.
 * @returns A portal into the marker element.
 */
function MarkerContent({
  children,
  className,
}: MarkerContentProps): React.ReactPortal {
  const { marker } = useMarkerContext()

  return createPortal(
    <div className={clsx('relative cursor-pointer', className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement()
  )
}

export { MarkerContent }
