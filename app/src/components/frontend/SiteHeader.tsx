/* eslint-disable react/no-danger */
import { connection } from 'next/server'

import { getContact, getSiteSettings } from '@/lib/payload-client'
import { logoNeedsDarkPlate } from '@/lib/logo-contrast'
import { Navbar } from '@/components/frontend/Navbar'
import { resolveSiteConfig } from '@/config/site'
import { SITE_URL } from '@/lib/seo'

/**
 * SiteHeader — the navbar and the Organization structured data, both built from
 * the CMS.
 *
 * Rendered inside a `<Suspense>` boundary in the root layout: `connection()`
 * pushes the read to request time so the static shell of every route can be
 * prerendered without a database, and the cached settings stream in behind it.
 * The navbar is `fixed`, so it takes no space in the flow and its fallback
 * shifts nothing.
 */
export async function SiteHeader(): Promise<React.JSX.Element> {
  await connection()

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

  return (
    <>
      {}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        type="application/ld+json"
      />
      <Navbar
        logoNeedsDarkPlate={needsDarkPlate}
        site={site}
        whatsapp={contact?.whatsapp}
      />
    </>
  )
}
