import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DealershipLocations } from '@/components/frontend/DealershipLocations'

export const metadata: Metadata = {
  alternates: {
    canonical: '/ubicaciones',
  },
  description:
    'Encuentra nuestros concesionarios: dirección, horario y teléfono. Visítanos y encuentra tu próximo auto seminuevo.',
  openGraph: {
    description:
      'Conoce la dirección, horario y teléfono de nuestros concesionarios.',
    title: 'Nuestras ubicaciones',
    type: 'website',
  },
  title: 'Nuestras ubicaciones',
}

/**
 * UbicacionesPage
 *
 * The heading is static; the dealership list and its structured data stream
 * from their own boundary so the shell prerenders without a database.
 */
export default function UbicacionesPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Nuestras ubicaciones
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Visítanos en cualquiera de nuestros concesionarios. Consulta
            dirección, horario y teléfono.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-[32rem] animate-pulse rounded-2xl bg-slate-200" />
          }
        >
          <DealershipLocations />
        </Suspense>
      </div>
    </div>
  )
}
