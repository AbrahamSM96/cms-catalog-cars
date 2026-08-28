'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { BrandLogo } from '@/components/frontend/BrandLogo'
import type { SiteConfig } from '@/config/site'

const LINKS = [
  { href: '/#featured', label: 'Destacados' },
  { href: '/catalogo', label: 'Inventario' },
  { href: '/ubicaciones', label: 'Ubicaciones' },
  { href: '/contacto', label: 'Contacto' },
]

/**
 * Navbar
 *
 * @param props - Component props.
 * @param props.logoNeedsDarkPlate - Whether the uploaded logo is too light for
 *   the white header and needs a dark plate behind it.
 * @param props.site - Resolved per-client site configuration (logo, brand).
 * @param props.whatsapp - The WhatsApp number to use in the CTA button.
 */
export function Navbar({
  logoNeedsDarkPlate = false,
  site,
  whatsapp,
}: {
  logoNeedsDarkPlate?: boolean
  site: SiteConfig
  whatsapp?: string
}): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const whatsappUrl = `https://wa.me/${(whatsapp || '525512345678').replace(/\D/g, '')}`

  useEffect(() => {
    /**
     * onScroll
     */
    const onScroll = (): void => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return (): void => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
        ? 'shadow-soft border-b border-slate-200/80 bg-white/85 backdrop-blur-xl'
        : 'border-b border-transparent bg-white/40 backdrop-blur-md'
        }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <BrandLogo needsDarkPlate={logoNeedsDarkPlate} priority site={site} />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <a
            className="hidden cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/25 sm:inline-flex"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>

          {/* Mobile menu toggle */}
          <button
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {LINKS.map((link) => (
              <Link
                className="cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-base font-semibold text-white"
              href={whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
