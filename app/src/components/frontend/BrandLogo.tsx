import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import type { SiteConfig } from '@/config/site'

interface BrandLogoProps {
  /** Extra classes for the link wrapper. */
  className?: string
  /** Rendered height of the logo in pixels. */
  height?: number
  /**
   * Paint a dark plate behind the logo. Comes from `logoNeedsDarkPlate()`,
   * which measures the uploaded logo against our white surfaces.
   */
  needsDarkPlate?: boolean
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
 * White-on-transparent logos would disappear on our white navbar and footer, so
 * `needsDarkPlate` (measured server-side by `logoNeedsDarkPlate()`) puts a dark
 * rounded plate behind the image to restore the contrast.
 *
 * @param props - Component props.
 */
export function BrandLogo(props: BrandLogoProps): React.JSX.Element {
  const {
    className,
    height = 36,
    needsDarkPlate = false,
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
            needsDarkPlate && 'rounded-xl bg-slate-900 px-2.5 py-1.5'
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
        <span className="hidden sm:inline text-lg font-bold tracking-tight text-slate-900">
          {site.name}
        </span>
      )}
    </Link>
  )
}
