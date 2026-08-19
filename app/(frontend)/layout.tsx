/* eslint-disable react/no-danger */
import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import '../globals.css'
import { Footer } from '@/components/frontend/Footer'
import { getContact } from '@/lib/payload-client'
import { inter } from '@/commons/inter'
import { Navbar } from '@/components/frontend/Navbar'
import { poppins } from '@/commons/poppins'
import { SITE_URL } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: siteConfig.seo.ogDescription,
    title: siteConfig.seo.titleDefault,
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: siteConfig.seo.titleDefault,
    template: siteConfig.seo.titleTemplate,
  },
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
  const contact = await getContact()

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
    name: siteConfig.name,
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    url: SITE_URL,
  }

  // Brand colours from the per-client config override the CSS-variable defaults
  // in globals.css, so anything using var(--accent) etc. re-themes from one file.
  const themeStyle = {
    '--accent': siteConfig.theme.accent,
    '--accent-strong': siteConfig.theme.accentStrong,
    '--primary': siteConfig.theme.primary,
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
          color={siteConfig.theme.accent}
          height={3}
          shadow={`0 0 10px ${siteConfig.theme.accent},0 0 5px ${siteConfig.theme.accent}`}
          showSpinner={false}
          speed={200}
          zIndex={9999}
        />
        <Navbar whatsapp={contact?.whatsapp} />
        {children}
        <Footer contact={contact} />
      </body>
    </html>
  )
}
