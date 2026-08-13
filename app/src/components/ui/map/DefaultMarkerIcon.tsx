'use client'

/**
 * Default marker icon: a small blue dot with a white ring.
 *
 * @returns The icon element.
 */
function DefaultMarkerIcon(): React.JSX.Element {
  return (
    <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
  )
}

export { DefaultMarkerIcon }
