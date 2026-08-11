import type { Metadata } from "next";
import { getDealerships } from "@/lib/payload-client";
import { Locations } from "@/components/frontend/Locations";

export const metadata: Metadata = {
  title: "Nuestras ubicaciones",
  description:
    "Encuentra nuestros concesionarios: dirección, horario y teléfono. Visítanos y encuentra tu próximo auto seminuevo.",
};

export default async function UbicacionesPage() {
  const dealerships = await getDealerships();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Nuestras ubicaciones
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Visítanos en cualquiera de nuestros concesionarios. Consulta dirección, horario y teléfono.
          </p>
        </div>

        <Locations dealerships={dealerships} />
      </div>
    </div>
  );
}
