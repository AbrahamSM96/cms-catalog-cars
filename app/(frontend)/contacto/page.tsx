import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react'
import type { Metadata } from 'next'

import { getContact } from '@/lib/payload-client'

export const metadata: Metadata = {
  description:
    'Ponte en contacto con nosotros: WhatsApp, teléfono, correo y ubicación.',
  title: 'Contacto',
}

const FALLBACK_WHATSAPP = '525512345678'
const FALLBACK_PHONE = '+52 55 1234 5678'

/** 
 * ContactoPage
 */
export default async function ContactoPage(): Promise<React.JSX.Element> {
  const contact = await getContact()

  const whatsappDigits = (contact?.whatsapp || FALLBACK_WHATSAPP).replace(
    /\D/g,
    ''
  )
  const phone = contact?.phone || FALLBACK_PHONE
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const email = contact?.email
  const addr = contact?.address
  const addressText = addr
    ? [
      addr.line1,
      [addr.postalCode, addr.city, addr.state].filter(Boolean).join(', '),
      addr.country,
    ]
      .filter(Boolean)
      .join(', ')
    : null
  const mapsHref = addr?.googleMapsUrl
  const hours = contact?.hoursNote

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <section className="relative overflow-hidden bg-white pt-28 pb-12 sm:pt-32">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
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

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* WhatsApp */}
            <a
              className="group shadow-soft hover:shadow-float flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-green-300"
              href={`https://wa.me/${whatsappDigits}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <MessageCircle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">WhatsApp</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Respuesta rápida a tus dudas
                </p>
                <span className="mt-2 inline-block text-sm font-semibold text-green-600">
                  Escríbenos →
                </span>
              </div>
            </a>

            {/* Phone */}
            <a
              className="group shadow-soft hover:shadow-float flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-red-300"
              href={telHref}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Phone className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">Teléfono</h2>
                <p className="mt-0.5 text-sm text-slate-500">{phone}</p>
                <span className="mt-2 inline-block text-sm font-semibold text-red-600">
                  Llamar →
                </span>
              </div>
            </a>

            {/* Email */}
            {email && (
              <a
                className="group shadow-soft hover:shadow-float flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-red-300"
                href={`mailto:${email}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Correo</h2>
                  <p className="mt-0.5 text-sm break-all text-slate-500">
                    {email}
                  </p>
                  <span className="mt-2 inline-block text-sm font-semibold text-red-600">
                    Enviar correo →
                  </span>
                </div>
              </a>
            )}

            {/* Address */}
            {addressText && (
              <div className="shadow-soft flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Dirección</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{addressText}</p>
                  {mapsHref && (
                    <a
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                      href={mapsHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Navigation className="h-4 w-4" />
                      Cómo llegar
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hours */}
          {hours && (
            <div className="shadow-soft mt-4 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Clock className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">Horario</h2>
                <p className="mt-0.5 text-sm whitespace-pre-line text-slate-500">
                  {hours}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
