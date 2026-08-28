import { connection } from 'next/server'

import { getDealerships } from '@/lib/payload-client'
import { Locations } from '@/components/frontend/Locations'

/**
 * HomeLocations — the dealership section on the home page, hidden entirely
 * while the client has not added a location yet.
 *
 * Streamed from a `<Suspense>` boundary so the page prerenders without a
 * database. See `lib/payload-client.ts`.
 */
export async function HomeLocations(): Promise<React.JSX.Element | null> {
  await connection()

  const dealerships = await getDealerships()
  if (dealerships.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24" id="ubicaciones">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Nuestras ubicaciones
          </h2>
          <p className="mt-2 text-slate-600">
            Visítanos en cualquiera de nuestros concesionarios. Consulta
            dirección, horario y teléfono.
          </p>
        </div>
        <Locations dealerships={dealerships} />
      </div>
    </section>
  )
}
