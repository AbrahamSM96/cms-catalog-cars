'use client'

import { MapPin, Navigation, Phone, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'
import Image from 'next/image'

import type { Dealership, Media } from '@/types/car'
import { getOpenStatus, type OpenStatus } from '@/lib/hours'
import { getImageUrl } from '@/lib/images'
import { normalizeCoords } from '@/lib/geo'

const LocationsMap = dynamic(
  () => import('./LocationsMap').then((m) => m.LocationsMap),
  {
    /**
     * loading
     */
    loading: (): React.JSX.Element => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
        Cargando mapa…
      </div>
    ),
    ssr: false,
  }
)

interface LocationsProps {
  dealerships: Dealership[]
}

/**
 * coordsOf
 *
 * @param d - The dealership to get coordinates for.
 */
function coordsOf(d: Dealership): ReturnType<typeof normalizeCoords> {
  return normalizeCoords(d.coordinates?.latitude, d.coordinates?.longitude)
}

/**
 * imageUrlOf
 *
 * @param d - The dealership to get the image URL for.
 */
function imageUrlOf(d: Dealership): string | null {
  const img = d.image
  if (img && typeof img === 'object') {
    const media = img as Media
    return media.url || getImageUrl(media.filename)
  }
  return null
}

/**
 * addressLines
 *
 * @param d - The dealership to get the address lines for.
 */
function addressLines(d: Dealership): string[] {
  const a = d.address
  if (!a) return []
  const rest = [a.neighborhood, a.postalCode, a.city, a.state, a.country]
    .filter(Boolean)
    .join(', ')
  return [a.line1, rest].filter(Boolean) as string[]
}

/**
 * Locations
 *
 * @param props - Component props.
 * @param props.dealerships - The dealerships to display.
 */
export function Locations({ dealerships }: LocationsProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [statuses, setStatuses] = useState<Record<string, OpenStatus | null>>(
    {}
  )
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Compute open/closed on the client only (time-dependent → avoid SSR mismatch).
  useEffect(() => {
    const next: Record<string, OpenStatus | null> = {}
    for (const d of dealerships) next[String(d.id)] = getOpenStatus(d.hours)
    setStatuses(next)
  }, [dealerships])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dealerships
    return dealerships.filter((d) => {
      const hay = [
        d.name,
        d.address?.line1,
        d.address?.neighborhood,
        d.address?.city,
        d.address?.state,
        d.address?.postalCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [dealerships, query])

  const withCoords = useMemo(
    () => dealerships.filter((d) => coordsOf(d) !== null),
    [dealerships]
  )

  const { center, zoom } = useMemo<{
    center: [number, number]
    zoom: number
  }>(() => {
    const points = withCoords.map((d) => coordsOf(d)!)
    if (points.length === 0) return { center: [-102.5, 23.6], zoom: 5 }
    const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
    const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length
    return { center: [avgLng, avgLat], zoom: points.length === 1 ? 13 : 6 }
  }, [withCoords])

  // Scroll the selected card into view (e.g. after a marker click).
  useEffect(() => {
    if (selectedId == null) return
    cardRefs.current[String(selectedId)]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [selectedId])

  if (dealerships.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <MapPin className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Aún no hay ubicaciones
        </h3>
        <p className="mt-1 text-slate-500">
          Agrega concesionarios en el panel de administración.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:h-[76vh] lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* Left: search + list */}
      <div className="shadow-soft flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Search */}
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Buscar ubicación"
              className="w-full cursor-text rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por dirección, ciudad o C.P…"
              type="text"
              value={query}
            />
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No encontramos ubicaciones para “{query}”.
            </p>
          ) : (
            filtered.map((d) => {
              const status = statuses[String(d.id)]
              const img = imageUrlOf(d)
              const lines = addressLines(d)
              const active = d.id === selectedId
              const c = coordsOf(d)
              const mapsHref =
                d.googleMapsUrl ||
                (c
                  ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`
                  : null)

              return (
                <button
                  className={clsx(
                    'flex w-full cursor-pointer gap-4 p-4 text-left transition-colors',
                    active ? 'bg-red-50/60' : 'hover:bg-slate-50'
                  )}
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  ref={(el) => {
                    cardRefs.current[String(d.id)] = el
                  }}
                  type="button"
                >
                  {/* Thumb */}
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {img ? (
                      <Image
                        alt={d.name}
                        className="object-cover"
                        fill
                        sizes="96px"
                        src={img}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <MapPin className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">{d.name}</h3>

                    {status && (
                      <p className="mt-0.5 text-sm">
                        <span
                          className={clsx(
                            'font-semibold',
                            status.open ? 'text-emerald-600' : 'text-red-600'
                          )}
                        >
                          {status.label}
                        </span>
                        {status.detail && (
                          <span className="text-slate-500">
                            {' '}
                            · {status.detail}
                          </span>
                        )}
                      </p>
                    )}

                    {lines.length > 0 && (
                      <p className="mt-1 text-sm leading-snug text-slate-600">
                        {lines.join(' · ')}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {d.phone && (
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {d.phone}
                        </span>
                      )}
                      {mapsHref && (
                        <a
                          className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-red-600 hover:text-red-700"
                          href={mapsHref}
                          onClick={(e) => e.stopPropagation()}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Navigation className="h-4 w-4" />
                          Cómo llegar
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: map */}
      <div className="shadow-soft h-[50vh] overflow-hidden rounded-2xl border border-slate-200 lg:h-auto">
        <LocationsMap
          center={center}
          dealerships={withCoords}
          onSelect={setSelectedId}
          selectedId={selectedId}
          zoom={zoom}
        />
      </div>
    </div>
  )
}
