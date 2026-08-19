import type { Metadata } from 'next'

import { CatalogFinder } from '@/components/frontend/CatalogFinder'
import { getBrands } from '@/lib/payload-client'

export const metadata: Metadata = {
  alternates: {
    canonical: '/buscador',
  },
  description:
    'Identifica tu vehículo por año, marca, modelo y versión con nuestro buscador guiado.',
  openGraph: {
    description:
      'Identifica la versión exacta de tu vehículo seleccionando año, marca y modelo.',
    title: 'Encuentra tu versión',
    type: 'website',
  },
  title: 'Encuentra tu versión',
}

/**
 * Guided vehicle finder page: año → marca → modelo → versión.
 */
export default async function BuscadorPage(): Promise<React.JSX.Element> {
  const brands = await getBrands()

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-white pt-28 pb-12 sm:pt-32">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Encuentra tu versión
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            ¿No sabes la versión exacta de tu auto? Selecciona año, marca y
            modelo para descubrirla.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <CatalogFinder brands={brands} />
        </div>
      </section>
    </div>
  )
}
