import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import type { LogoTone } from '@/lib/logo-contrast'
import type { SiteConfig } from '@/config/site'

interface BrandLogoProps {
  /** Extra classes for the link wrapper. */
  className?: string
  /** Rendered height of the logo in pixels. */
  height?: number
  /**
   * How bright the uploaded logo is, from `logoTone()`. Decides which theme
   * gets a plate behind it; `neutral` logos never get one.
   */
  logoTone?: LogoTone
  /** Load the logo eagerly (use it for the navbar, above the fold). */
  priority?: boolean
  /** Resolved per-client site configuration. */
  site: SiteConfig
}

/**
 * Brand logo and wordmark linking back to the homepage.
 *
 * The image comes from the `site-settings` global in the CMS and accepts any
 * uploaded format — SVG, PNG or WebP. SVGs are served untouched because the
 * Next.js image optimizer rejects them by default; raster logos still go
 * through it. When no logo is uploaded the built-in car icon is used instead,
 * and the wordmark can be switched off from the CMS for logos that already
 * include the brand name.
 *
 * A transparent logo only reads against one kind of surface, and we have two.
 * `logoTone` (measured server-side by `logoTone()`) says which: a `light`
 * wordmark gets a dark plate on the light theme and none on the dark one, where
 * the page already supplies the contrast; a `dark` mark is the mirror image.
 * The plate colours are `fixed-*` tokens, so they stay put while everything
 * around them flips — a plate that themed along with the page would track the
 * logo instead of contrasting with it, which is the bug this replaced.
 *
 * The switch has to happen in CSS: the tone is measured on the server, which
 * cannot know the visitor's colour scheme. Padding stays on in both themes so
 * the logo keeps one size and only the plate appears and disappears.
 *
 * @param props - Component props.
 */
export function BrandLogo(props: BrandLogoProps): React.JSX.Element {
  const {
    className,
    height = 36,
    logoTone = 'neutral',
    priority = false,
    site,
  } = props
  const isSvg = /\.svg(?:$|[?#])/i.test(site.logoUrl ?? '')

  return (
    <Link
      aria-label="Inicio"
      className={clsx('group flex items-center gap-2.5', className)}
      href="/"
    >
      {site.logoUrl ? (
        <Image
          alt={site.logoAlt || site.name}
          className={clsx(
            'w-auto max-w-40 object-contain',
            logoTone !== 'neutral' && 'rounded-xl px-2.5 py-1.5',
            logoTone === 'light' && 'bg-fixed-ink dark:bg-transparent',
            logoTone === 'dark' && 'bg-transparent dark:bg-fixed-white'
          )}
          height={height}
          priority={priority}
          src={site.logoUrl}
          style={{ height }}
          unoptimized={isSvg}
          width={height * 4}
        />
      ) : (
        <span
          className="flex items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-accent-600"
          style={{ height, width: height }}
        >
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
      )}
      {site.showName && (
        <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">
          {site.name}
        </span>
      )}
    </Link>
  )
}
