'use client'

import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { MapPin } from 'lucide-react'

import {
  Map,
  MapControls,
  MapMarker,
  type MapRef,
  MarkerContent,
} from '@/components/ui/map'
import type { Dealership } from '@/types/car'
import { normalizeCoords } from '@/lib/geo'

interface LocationsMapProps {
  /** Dealerships that have valid coordinates. */
  dealerships: Dealership[]
  selectedId: string | number | null
  onSelect: (id: string | number) => void
  center: [number, number]
  zoom: number
}

/**
 * LocationsMap
 *
 * @param props - Component props.
 * @param props.center - The initial center of the map.
 * @param props.dealerships - The dealerships to display on the map.
 * @param props.onSelect - Callback when a dealership is selected.
 * @param props.selectedId - The currently selected dealership ID.
 * @param props.zoom -
 */
export function LocationsMap({
  center,
  dealerships,
  onSelect,
  selectedId,
  zoom,
}: LocationsMapProps): React.JSX.Element {
  const mapRef = useRef<MapRef>(null)

  // Fly to the selected dealership.
  useEffect(() => {
    if (selectedId == null) return
    const d = dealerships.find((x) => x.id === selectedId)
    const c = normalizeCoords(
      d?.coordinates?.latitude,
      d?.coordinates?.longitude
    )
    if (c) {
      mapRef.current?.flyTo({
        center: [c.lng, c.lat],
        duration: 900,
        essential: true,
        zoom: 14,
      })
    }
  }, [selectedId, dealerships])

  return (
    <Map
      center={center}
      className="h-full w-full"
      ref={mapRef}
      theme="light"
      zoom={zoom}
    >
      <MapControls />
      {dealerships.map((d) => {
        const c = normalizeCoords(
          d.coordinates?.latitude,
          d.coordinates?.longitude
        )
        if (!c) return null
        const active = d.id === selectedId
        return (
          <MapMarker
            key={d.id}
            latitude={c.lat}
            longitude={c.lng}
            onClick={() => onSelect(d.id)}
          >
            <MarkerContent>
              <div
                aria-label={d.name}
                className={clsx(
                  'flex items-center justify-center rounded-full border-2 border-white bg-accent-600 text-white shadow-lg transition-transform duration-200',
                  active
                    ? 'z-10 h-10 w-10 scale-100'
                    : 'h-8 w-8 hover:scale-110'
                )}
              >
                <MapPin
                  className={active ? 'h-5 w-5' : 'h-4 w-4'}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </div>
            </MarkerContent>
          </MapMarker>
        )
      })}
    </Map>
  )
}
