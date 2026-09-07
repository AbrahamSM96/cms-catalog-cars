import Image from 'next/image'

import type { SiteConfig } from '@/config/site'
import { resolveSiteConfig, siteConfig } from '@/config/site'
import { getSiteSettings } from '@/lib/payload-client'

const COPY = {
  eyebrow: 'Panel de administración',
  footer: 'Catálogo · Sucursales · Contactos',
  introText: 'Inicia sesión para administrar el catálogo.',
  introTitle: 'Bienvenido de nuevo',
}

/**
 * Read the brand from the CMS, falling back to the static defaults.
 *
 * The sign-in screen has to render even when the database is unreachable —
 * the error belongs in the login attempt, not in a blank page — so a failed
 * lookup degrades to `siteConfig` instead of throwing.
 */
async function loadSite(): Promise<SiteConfig> {
  try {
    return resolveSiteConfig(await getSiteSettings())
  } catch {
    return siteConfig
  }
}

/**
 * Brand half of the split-screen sign-in view, rendered through Payload's
 * `admin.components.beforeLogin` hook.
 *
 * It returns two siblings: the fixed panel that fills the left half of the
 * viewport (a plain block stacked above the form on small screens), and the
 * heading that introduces the form on the right. Both live in the same
 * component because Payload only exposes a single injection point here.
 *
 * All layout lives in `login.css`, which the admin layout imports — the admin
 * has no Tailwind.
 */
export async function LoginBrandPanel(): Promise<React.JSX.Element> {
  const site = await loadSite()
  const isSvg = /\.svg(?:$|[?#])/i.test(site.logoUrl ?? '')

  return (
    <>
      <aside className="login-brand">
        <span className="login-brand__eyebrow">
          <span aria-hidden="true" className="login-brand__dot" />
          {COPY.eyebrow}
        </span>

        <div className="login-brand__body">
          <span className="login-brand__mark">
            {site.logoUrl ? (
              <Image
                alt={site.logoAlt || site.name}
                className="login-brand__logo"
                height={44}
                priority
                src={site.logoUrl}
                unoptimized={isSvg}
                width={176}
              />
            ) : (
              <svg
                aria-hidden="true"
                className="login-brand__icon"
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
            )}
          </span>

          <p className="login-brand__title">{site.name}</p>
          <p className="login-brand__text">{site.description}</p>
        </div>

        <p className="login-brand__footer">{COPY.footer}</p>
      </aside>

      <div className="login-intro">
        <h1 className="login-intro__title">{COPY.introTitle}</h1>
        <p className="login-intro__text">{COPY.introText}</p>
      </div>
    </>
  )
}
