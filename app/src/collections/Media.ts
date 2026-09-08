import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { groups, media } from '../i18n/labels'
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
    group: groups.content,
  },
  fields: [
    {
      admin: {
        description: media.fields.alt.description,
      },
      label: media.fields.alt.label,
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
  labels: media.labels,
  slug: 'media',
  upload: {
    imageSizes: [
      {
        // Social card used by the Open Graph tags (Facebook, WhatsApp, X).
        // 1200x630 is the size every platform asks for, and re-encoding to
        // JPEG keeps the file small enough that WhatsApp still renders a
        // preview — it drops thumbnails of a few hundred KB and up, which the
        // full-resolution originals easily exceed.
        // `withoutEnlargement: false` forces the size to exist even for
        // smaller uploads, so the card never degrades to a tiny image.
        formatOptions: {
          format: 'jpeg',
          options: { quality: 78 },
        },
        height: 630,
        name: 'og',
        position: 'centre',
        width: 1200,
        withoutEnlargement: false,
      },
    ],
    mimeTypes: ['image/*', 'video/*'],
    // The admin "Paste URL" button, server-side, and only in development.
    //
    // An `allowList` is what turns on the server-side fetch — the one that gets
    // past CORS, which is why it was added. But `hostname: ''` is falsy, and
    // `isURLAllowed` skips a falsy key entirely, so the list matched every URL,
    // and that had two consequences neither obvious nor intended:
    //
    // 1. `getExternalFile` skips `safeFetch` for any allowListed URL, and
    //    `safeFetch` is Payload's SSRF guard — it resolves the host and refuses
    //    to connect to a non-public IP. Matching everything disabled it, and
    //    that fetch carries `credentials: 'include'`.
    // 2. It opened `GET /api/media/paste-url?src=…`, which fetches with no
    //    guard at all and streams the response body back to the caller. Not a
    //    blind request: an authenticated proxy into whatever the deploy can
    //    reach, `mimeTypes` included, since that only gates the saved document.
    //
    // Both need a session with create/update on this collection — an editor.
    // That is a fine trade locally, where the network behind the app is your
    // own machine.
    //
    // Production gets `false`, not just a missing allowList. Both disable the
    // endpoint and put `getExternalFile` back on `safeFetch`, but only `false`
    // hides the button (`pasteURL !== false` is what renders it in
    // @payloadcms/ui). Leaving it visible would ship a control whose client-side
    // fetch fails on CORS for most image hosts and then reports "The provided
    // URL is not allowed" — a dead button explained by a misleading error.
    // Uploading by URL through the API is unaffected: that path still works,
    // through `safeFetch`.
    pasteURL:
      process.env.NODE_ENV === 'production'
        ? false
        : { allowList: [{ hostname: '' }] },
  },
}
