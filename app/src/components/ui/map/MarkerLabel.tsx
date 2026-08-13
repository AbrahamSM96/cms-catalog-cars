'use client'

import { clsx } from 'clsx'

import type { MarkerLabelProps } from './types'

/**
 * Text label positioned above or below a marker.
 *
 * @param props - MarkerLabelProps
 * @param props.children - The label content.
 * @param props.className - Additional CSS classes for the label.
 * @param props.position - Position of the label relative to the marker.
 * @returns The label element.
 */
function MarkerLabel({
  children,
  className,
  position = 'top',
}: MarkerLabelProps): React.JSX.Element {
  const positionClasses = {
    bottom: 'top-full mt-1',
    top: 'bottom-full mb-1',
  }

  return (
    <div
      className={clsx(
        'absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
        'text-[10px] font-medium text-foreground',
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  )
}

export { MarkerLabel }
