import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ContactDetails } from '@/components/frontend/ContactDetails'

export const metadata: Metadata = {
  alternates: {
    canonical: '/contacto',
  },
  description:
    'Ponte en contacto con nosotros: WhatsApp, teléfono, correo y ubicación.',
  openGraph: {
    description:
      'Ponte en contacto con nosotros por WhatsApp, teléfono, correo o visítanos.',
    title: 'Contacto',
    type: 'website',
  },
  title: 'Contacto',
}

/**
 * ContactoPage
 *
 * The heading is static; every contact detail comes from the CMS and streams
 * from its own boundary, so the shell prerenders without a database.
 */
export default function ContactoPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <section className="relative overflow-hidden bg-white pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Contacto
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Estamos para ayudarte. Escríbenos o visítanos y con gusto te
            atendemos.
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  className="h-32 animate-pulse rounded-2xl bg-slate-200"
                  key={i}
                />
              ))}
            </div>
          </div>
        }
      >
        <ContactDetails />
      </Suspense>
    </div>
  )
}
