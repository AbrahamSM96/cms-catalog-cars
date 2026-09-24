/* eslint-disable react/no-danger */
import { connection } from 'next/server'

import { Navbar } from '@/components/layout/Navbar'
import { resolveSiteConfig } from '@/config/site'
import { serializeLd } from '@/lib/json-ld'
import { logoTone } from '@/lib/logo-contrast'
import { getContact, getSiteSettings } from '@/lib/payload-client'
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

  // Clients upload their own logo on transparent backgrounds — some white, some
  // near-black — and each kind vanishes on one of our two themes. Measure the
  // brightness once and let the navbar and footer plate it where it would not
  // read. The tone is theme-blind; the plate switches in CSS.
  const tone = await logoTone(site.logoUrl)

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
        dangerouslySetInnerHTML={{ __html: serializeLd(organizationLd) }}
        type="application/ld+json"
      />
      <Navbar logoTone={tone} site={site} whatsapp={contact?.whatsapp} />
    </>
  )
}
