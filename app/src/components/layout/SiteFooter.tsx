import { connection } from 'next/server'

import { getContact, getSiteSettings } from '@/lib/payload-client'
import { Footer } from '@/components/layout/Footer'
import { logoTone } from '@/lib/logo-contrast'
import { resolveSiteConfig } from '@/config/site'

/**
 * SiteFooter — the CMS-driven footer, streamed like the header.
 *
 * Shares its cached reads with `SiteHeader`, so the pair costs one database
 * round trip on a cache miss and none afterwards.
 */
export async function SiteFooter(): Promise<React.JSX.Element> {
  await connection()

  const [contact, site] = await Promise.all([
    getContact(),
    getSiteSettings().then(resolveSiteConfig),
  ])

  const tone = await logoTone(site.logoUrl)

  return <Footer contact={contact} logoTone={tone} site={site} />
}
