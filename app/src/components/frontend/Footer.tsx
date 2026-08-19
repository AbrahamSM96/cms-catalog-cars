import Link from 'next/link'

import type { Contact } from '@/types/car'
import { siteConfig } from '@/config/site'

interface FooterProps {
  contact: Contact | null
}

const FALLBACK_WHATSAPP = '525512345678'
const FALLBACK_PHONE = '+52 55 1234 5678'

const SOCIALS: {
  key: keyof NonNullable<Contact['social']>
  label: string
  path: string
}[] = [
    {
      key: 'facebook',
      label: 'Facebook',
      path: 'M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 1116 12a4 4 0 01-4 4zm6.4-10.4a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z',
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      path: 'M16.6 5.82a4.28 4.28 0 01-1.06-2.82h-3.02v11.67a2.44 2.44 0 11-2.44-2.44c.25 0 .5.04.72.11V9.24a5.6 5.6 0 00-.72-.05 5.44 5.44 0 105.44 5.44V9.01a7.27 7.27 0 004.24 1.36V7.35a4.28 4.28 0 01-3.16-1.53z',
    },
    {
      key: 'youtube',
      label: 'YouTube',
      path: 'M23 12s0-3.2-.4-4.73a2.49 2.49 0 00-1.75-1.76C19.3 5.1 12 5.1 12 5.1s-7.3 0-8.85.41A2.49 2.49 0 001.4 7.27C1 8.8 1 12 1 12s0 3.2.4 4.73a2.49 2.49 0 001.75 1.76C4.7 18.9 12 18.9 12 18.9s7.3 0 8.85-.41a2.49 2.49 0 001.75-1.76C23 15.2 23 12 23 12zM9.75 15.02V8.98L15 12z',
    },
  ]

/**
 * Footer
 *
 * @param props - FooterProps
 * @param props.contact - Contact | null
 */
export function Footer({ contact }: FooterProps): React.JSX.Element {
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

  const socials = SOCIALS.filter((s) => contact?.social?.[s.key])
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white" id="contact">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              aria-label="Inicio"
              className="group inline-flex items-center gap-2.5"
              href="/"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-red-600">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 17H6a2 2 0 01-2-2v-3.28a2 2 0 01.12-.68l1.7-4.53A2 2 0 017.7 5.2h8.6a2 2 0 011.88 1.31l1.7 4.53a2 2 0 01.12.68V15a2 2 0 01-2 2h-2M9 17h6M9 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Auto<span className="text-red-600">Catálogo</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Autos seminuevos con garantía de calidad, financiamiento
              disponible y facilidades de pago.
            </p>

            {socials.length > 0 && (
              <div className="mt-5 flex gap-2.5">
                {socials.map((s) => (
                  <a
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-500 hover:bg-red-600 hover:text-white"
                    href={contact!.social![s.key]}
                    key={s.key}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explora */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Explora
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link
                  className="transition-colors hover:text-red-600"
                  href="/catalogo"
                >
                  Inventario
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-red-600"
                  href="/ubicaciones"
                >
                  Ubicaciones
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-red-600"
                  href="/contacto"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Contacto
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a
                  className="transition-colors hover:text-red-600"
                  href={telHref}
                >
                  {phone}
                </a>
              </li>
              {email && (
                <li>
                  <a
                    className="break-all transition-colors hover:text-red-600"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                </li>
              )}
              {addressText && <li className="text-slate-500">{addressText}</li>}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              ¿Hablamos?
            </h4>
            <div className="mt-4 flex flex-col gap-3">
              <a
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-green-700 hover:shadow-green-600/30"
                href={`https://wa.me/${whatsappDigits}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                WhatsApp
              </a>
              <a
                className="shadow-soft inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-red-500 hover:text-red-600"
                href={telHref}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Llamar
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p className="text-sm text-slate-400">{siteConfig.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
