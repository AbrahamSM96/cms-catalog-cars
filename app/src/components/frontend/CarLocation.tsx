"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Phone, Navigation, MapPin } from "lucide-react";
import type { Dealership } from "@/types/car";
import { getOpenStatus, type OpenStatus } from "@/lib/hours";
import { normalizeCoords } from "@/lib/geo";

const LocationsMap = dynamic(() => import("./LocationsMap").then((m) => m.LocationsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
      Cargando mapa…
    </div>
  ),
});

export function CarLocation({ dealership }: { dealership: Dealership }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    setStatus(getOpenStatus(dealership.hours));
  }, [dealership]);

  const coords = normalizeCoords(dealership.coordinates?.latitude, dealership.coordinates?.longitude);

  const a = dealership.address;
  const addressLines = a
    ? [a.line1, [a.neighborhood, a.postalCode, a.city, a.state, a.country].filter(Boolean).join(", ")].filter(
        Boolean,
      )
    : [];

  const mapsHref =
    dealership.googleMapsUrl ||
    (coords ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : null);

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Info */}
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Ubicación</h2>

            <p className="mt-4 font-semibold text-slate-900">{dealership.name}</p>

            {status && (
              <p className="mt-1 text-sm">
                <span className={status.open ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                  {status.label}
                </span>
                {status.detail && <span className="text-slate-500"> · {status.detail}</span>}
              </p>
            )}

            {addressLines.length > 0 && (
              <div className="mt-4 flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <p className="text-sm leading-relaxed">{addressLines.join(", ")}</p>
              </div>
            )}

            {dealership.phone && (
              <div className="mt-3 flex items-center gap-2 text-slate-700">
                <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
                <span className="text-sm">{dealership.phone}</span>
              </div>
            )}

            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Cómo llegar
              </a>
            )}
          </div>

          {/* Map */}
          <div className="h-[320px] min-h-[320px] lg:h-auto">
            {coords ? (
              <LocationsMap
                dealerships={[dealership]}
                selectedId={dealership.id}
                onSelect={() => {}}
                center={[coords.lng, coords.lat]}
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
  );
}
