import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

/**
 * robots
 *
 * Block crawlers from the Payload admin and the Payload REST API, and point
 * them at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
