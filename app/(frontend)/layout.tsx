import { connection } from 'next/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import '../globals.css'
import { BrandTheme } from '@/components/frontend/BrandTheme'
import { getSiteSettings } from '@/lib/payload-client'
import { inter } from '@/commons/inter'
import { poppins } from '@/commons/poppins'
import { resolveSiteConfig } from '@/config/site'
import { SITE_URL } from '@/lib/seo'
import { SiteFooter } from '@/components/frontend/SiteFooter'
import { SiteHeader } from '@/components/frontend/SiteHeader'

/**
 * generateMetadata — build the site metadata from the CMS `site-settings`
 * global, falling back to the static defaults when it is empty.
 *
 * `connection()` marks the metadata as request-time work. Metadata cannot be
 * wrapped in `<Suspense>`, so without it Next would resolve the cached read
 * while prerendering and the production image build — which has no database —
 * would fail. Next streams the metadata into the response instead.
 */
export async function generateMetadata(): Promise<Metadata> {
  await connection()

  const site = resolveSiteConfig(await getSiteSettings())

  return {
    description: site.seo.description,
    ...(site.faviconUrl ? { icons: { icon: site.faviconUrl } } : {}),
    keywords: site.seo.keywords,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      description: site.seo.ogDescription,
      ...(site.ogImageUrl ? { images: [site.ogImageUrl] } : {}),
      title: site.seo.titleDefault,
      type: 'website',
    },
    robots: {
      follow: true,
      index: true,
    },
    title: {
      default: site.seo.titleDefault,
      template: site.seo.titleTemplate,
    },
  }
}

/**
 * RootLayout
 *
 * Holds no CMS data of its own: every branded piece (colours, navbar, footer)
 * is streamed from its own `<Suspense>` boundary so Next can prerender a static
 * shell for every route without a database, which is what the production image
 * build has. See `lib/payload-client.ts` for the caching contract.
 *
 * @param props - component props
 * @param props.children - child components
 */
export default function RootLayout(
  props: Readonly<{
    children: React.ReactNode
  }>
): React.JSX.Element {
  const { children } = props

  return (
    <html
      className={`${poppins.variable} ${inter.variable} antialiased`}
      lang="es"
    >
      <body>
        <Suspense>
          <BrandTheme />
        </Suspense>
        {/* The navbar is fixed, so an empty fallback shifts nothing. */}
        <Suspense>
          <SiteHeader />
        </Suspense>
        {children}
        {/* Reserves the footer's height so the page does not jump when it
            arrives. */}
        <Suspense
          fallback={<div className="h-[26rem] border-t border-slate-200" />}
        >
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  )
}
