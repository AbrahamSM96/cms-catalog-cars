/* eslint-disable react/no-danger */
import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import '../globals.css'
import { getContact, getSiteSettings } from '@/lib/payload-client'
import { Footer } from '@/components/frontend/Footer'
import { inter } from '@/commons/inter'
import { logoNeedsDarkPlate } from '@/lib/logo-contrast'
import { Navbar } from '@/components/frontend/Navbar'
import { poppins } from '@/commons/poppins'
import { resolveSiteConfig } from '@/config/site'
import { SITE_URL } from '@/lib/seo'

/**
 * Every page under this layout reads from the CMS — the layout itself pulls the
 * brand, navigation and footer from the `site-settings` and `contact` globals,
 * and the pages below add cars, brands and dealerships on top. Prerendering them
 * would bake whatever the database held at build time into the deploy, so an
 * edit in the admin would not appear until the next rebuild. Worse, production
 * images are built without database access, which bakes empty pages.
 *
 * Applied on the layout so it covers the whole route group in one place.
 */
export const dynamic = 'force-dynamic'

/**
 * generateMetadata — build the site metadata from the CMS `site-settings`
 * global, falling back to the static defaults when it is empty.
 */
export async function generateMetadata(): Promise<Metadata> {
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
 * @param props - component props
 * @param props.children - child components
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const [contact, site] = await Promise.all([
    getContact(),
    getSiteSettings().then(resolveSiteConfig),
  ])

  // Clients upload their own logo and some are white-on-transparent, which is
  // invisible on the white navbar and footer. Measure it once and let the two
  // put a dark plate behind it when it would not read.
  const needsDarkPlate = await logoNeedsDarkPlate(site.logoUrl)

  const socials = [
    contact?.social?.facebook,
    contact?.social?.instagram,
    contact?.social?.tiktok,
    contact?.social?.youtube,
  ].filter((url): url is string => Boolean(url))

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...(contact?.phone
      ? {
        contactPoint: [
          {
            '@type': 'ContactPoint',
            availableLanguage: ['es'],
            contactType: 'sales',
            telephone: contact.phone,
          },
        ],
      }
      : {}),
    name: site.name,
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    url: SITE_URL,
  }

  // Brand colours from the per-client config override the CSS-variable defaults
  // in globals.css, so anything using var(--accent) etc. re-themes from one file.
  const themeStyle = {
    '--accent': site.theme.accent,
    '--accent-strong': site.theme.accentStrong,
    '--primary': site.theme.primary,
  } as React.CSSProperties

  return (
    <html
      className={`${poppins.variable} ${inter.variable} antialiased`}
      lang="es"
      style={themeStyle}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
          type="application/ld+json"
        />
        <NextTopLoader
          color={site.theme.accent}
          height={3}
          shadow={`0 0 10px ${site.theme.accent},0 0 5px ${site.theme.accent}`}
          showSpinner={false}
          speed={200}
          zIndex={9999}
        />
        <Navbar
          logoNeedsDarkPlate={needsDarkPlate}
          site={site}
          whatsapp={contact?.whatsapp}
        />
        {children}
        <Footer
          contact={contact}
          logoNeedsDarkPlate={needsDarkPlate}
          site={site}
        />
      </body>
    </html>
  )
}
