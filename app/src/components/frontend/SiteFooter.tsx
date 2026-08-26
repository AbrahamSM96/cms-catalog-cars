import { connection } from 'next/server'

import { getContact, getSiteSettings } from '@/lib/payload-client'
import { Footer } from '@/components/frontend/Footer'
import { logoNeedsDarkPlate } from '@/lib/logo-contrast'
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

  const needsDarkPlate = await logoNeedsDarkPlate(site.logoUrl)

  return (
    <Footer contact={contact} logoNeedsDarkPlate={needsDarkPlate} site={site} />
  )
}
