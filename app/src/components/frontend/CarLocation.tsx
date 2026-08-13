'use client'

import { MapPin, Navigation, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { getOpenStatus, type OpenStatus } from '@/lib/hours'
import type { Dealership } from '@/types/car'
import { normalizeCoords } from '@/lib/geo'

const LocationsMap = dynamic(
  () => import('./LocationsMap').then((m) => m.LocationsMap),
  {
    /**
     * loading
     */
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
        Cargando mapa…
      </div>
    ),
    ssr: false,
  }
)

/**
 * CarLocation
 *
 * @param props - CarLocationProps
 * @param props.dealership - Dealership
 */
export function CarLocation({
  dealership,
}: {
  dealership: Dealership
}): React.JSX.Element {
  const [status, setStatus] = useState<OpenStatus | null>(null)

  useEffect(() => {
    setStatus(getOpenStatus(dealership.hours))
  }, [dealership])

  const coords = normalizeCoords(
    dealership.coordinates?.latitude,
    dealership.coordinates?.longitude
  )

  const a = dealership.address
  const addressLines = a
    ? [
      a.line1,
      [a.neighborhood, a.postalCode, a.city, a.state, a.country]
        .filter(Boolean)
        .join(', '),
    ].filter(Boolean)
    : []

  const mapsHref =
    dealership.googleMapsUrl ||
    (coords
      ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
      : null)

  return (
    <section className="mt-8">
      <div className="shadow-soft overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Info */}
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Ubicación</h2>

            <p className="mt-4 font-semibold text-slate-900">
              {dealership.name}
            </p>

            {status && (
              <p className="mt-1 text-sm">
                <span
                  className={
                    status.open
                      ? 'font-semibold text-emerald-600'
                      : 'font-semibold text-red-600'
                  }
                >
                  {status.label}
                </span>
                {status.detail && (
                  <span className="text-slate-500"> · {status.detail}</span>
                )}
              </p>
            )}

            {addressLines.length > 0 && (
              <div className="mt-4 flex items-start gap-2 text-slate-600">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                />
                <p className="text-sm leading-relaxed">
                  {addressLines.join(', ')}
                </p>
              </div>
            )}

            {dealership.phone && (
              <div className="mt-3 flex items-center gap-2 text-slate-700">
                <Phone aria-hidden="true" className="h-5 w-5 text-slate-400" />
                <span className="text-sm">{dealership.phone}</span>
              </div>
            )}

            {mapsHref && (
              <a
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                href={mapsHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Navigation aria-hidden="true" className="h-4 w-4" />
                Cómo llegar
              </a>
            )}
          </div>

          {/* Map */}
          <div className="h-[320px] min-h-[320px] lg:h-auto">
            {coords ? (
              <LocationsMap
                center={[coords.lng, coords.lat]}
                dealerships={[dealership]}
                onSelect={() => {}}
                selectedId={dealership.id}
                zoom={14}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm text-slate-400">
                Sin coordenadas para mostrar el mapa.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
