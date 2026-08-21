/* eslint-disable react/no-danger */
import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import '../globals.css'
import { Footer } from '@/components/frontend/Footer'
import { getContact, getSiteSettings } from '@/lib/payload-client'
import { inter } from '@/commons/inter'
import { Navbar } from '@/components/frontend/Navbar'
import { poppins } from '@/commons/poppins'
import { resolveSiteConfig } from '@/config/site'
import { SITE_URL } from '@/lib/seo'

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
        <Navbar brandName={site.name} whatsapp={contact?.whatsapp} />
        {children}
        <Footer site={site} contact={contact} />
      </body>
    </html>
  )
}
