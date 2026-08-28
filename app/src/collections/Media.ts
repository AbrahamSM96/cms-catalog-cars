import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'

export const Media: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * read
     */
    read: () => true, // Public read access for frontend
    update: editorsAndAdmins,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      admin: {
        description:
          'Optional. If left empty, the site generates a descriptive alt text automatically: car photos use brand, model, version, year and city; slides use the caption or a default text. Fill it in only if you want a specific text.',
      },
      label: 'Alt text',
      name: 'alt',
      type: 'text',
    },
  ],

  hooks: {
    afterChange: [
      revalidateAfterChange(
        CACHE_TAGS.cars,
        CACHE_TAGS.dealerships,
        CACHE_TAGS.homepage,
        CACHE_TAGS.siteSettings
      ),
    ],
    afterDelete: [
      revalidateAfterDelete(
        CACHE_TAGS.cars,
        CACHE_TAGS.dealerships,
        CACHE_TAGS.homepage,
        CACHE_TAGS.siteSettings
      ),
    ],
  },
  slug: 'media',
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    // Enable the admin "Paste URL" feature. Without an `allowList` the admin
    // only attempts a browser-side fetch, which fails with CORS on most
    // external image hosts ("Failed to fetch the file"). Providing an allowList
    // turns on the server-side fetch fallback (no CORS) and gates which URLs
    // the server is allowed to download. `hostname: ""` matches any host (see
    // isURLAllowed), so any public http(s) image URL is accepted. This endpoint
    // is admin-only and gated by this collection's create/update access.
    pasteURL: {
      allowList: [
        { hostname: '', protocol: 'https' },
        { hostname: '', protocol: 'http' },
      ],
    },
  },
}
