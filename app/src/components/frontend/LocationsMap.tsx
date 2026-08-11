"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { MapPin } from "lucide-react";
import { Map, MapControls, MapMarker, MarkerContent, type MapRef } from "@/components/ui/map";
import type { Dealership } from "@/types/car";
import { normalizeCoords } from "@/lib/geo";

interface LocationsMapProps {
  /** Dealerships that have valid coordinates. */
  dealerships: Dealership[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
  center: [number, number];
  zoom: number;
}

export function LocationsMap({ dealerships, selectedId, onSelect, center, zoom }: LocationsMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Fly to the selected dealership.
  useEffect(() => {
    if (selectedId == null) return;
    const d = dealerships.find((x) => x.id === selectedId);
    const c = normalizeCoords(d?.coordinates?.latitude, d?.coordinates?.longitude);
    if (c) {
      mapRef.current?.flyTo({ center: [c.lng, c.lat], zoom: 14, duration: 900, essential: true });
    }
  }, [selectedId, dealerships]);

  return (
    <Map ref={mapRef} center={center} zoom={zoom} theme="light" className="h-full w-full">
      <MapControls />
      {dealerships.map((d) => {
        const c = normalizeCoords(d.coordinates?.latitude, d.coordinates?.longitude);
        if (!c) return null;
        const active = d.id === selectedId;
        return (
          <MapMarker key={d.id} longitude={c.lng} latitude={c.lat} onClick={() => onSelect(d.id)}>
            <MarkerContent>
              <div
                className={clsx(
                  "flex items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-lg transition-transform duration-200",
                  active ? "z-10 h-10 w-10 scale-100" : "h-8 w-8 hover:scale-110",
                )}
                aria-label={d.name}
              >
                <MapPin className={active ? "h-5 w-5" : "h-4 w-4"} fill="currentColor" strokeWidth={1.5} />
              </div>
            </MarkerContent>
          </MapMarker>
        );
      })}
    </Map>
  );
}
