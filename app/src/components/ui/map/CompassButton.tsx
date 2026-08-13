'use client'

import { useEffect, useRef } from 'react'

import { ControlButton } from './ControlButton'
import { useMap } from './context'

/**
 * Compass control that reflects the map bearing/pitch and resets north on click.
 *
 * @param props - Component props.
 * @param props.onClick - Callback invoked to reset the bearing.
 * @returns The compass button element.
 */
function CompassButton({
  onClick,
}: {
  onClick: () => void
}): React.JSX.Element {
  const { map } = useMap()
  const compassRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!map || !compassRef.current) return

    const compass = compassRef.current

    /**
     * Sync the compass rotation with the current map bearing and pitch.
     */
    const updateRotation = (): void => {
      const bearing = map.getBearing()
      const pitch = map.getPitch()
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`
    }

    map.on('rotate', updateRotation)
    map.on('pitch', updateRotation)
    updateRotation()

    return (): void => {
      map.off('rotate', updateRotation)
      map.off('pitch', updateRotation)
    }
  }, [map])

  return (
    <ControlButton label="Reset bearing to north" onClick={onClick}>
      <svg
        className="size-5"
        ref={compassRef}
        style={{ transformStyle: 'preserve-3d' }}
        viewBox="0 0 24 24"
      >
        <path className="fill-red-500" d="M12 2L16 12H12V2Z" />
        <path className="fill-red-300" d="M12 2L8 12H12V2Z" />
        <path className="fill-muted-foreground/60" d="M12 22L16 12H12V22Z" />
        <path className="fill-muted-foreground/30" d="M12 22L8 12H12V22Z" />
      </svg>
    </ControlButton>
  )
}

export { CompassButton }
