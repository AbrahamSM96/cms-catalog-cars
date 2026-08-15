import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'

export const Media: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * read
     */
    read: () => true, // Todos pueden ver las imágenes
    update: editorsAndAdmins,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      admin: {
        description:
          'Opcional. Si lo dejas vacío, la web genera un texto alternativo descriptivo automáticamente: en las fotos de autos usa marca, modelo, versión, año y ciudad; en los slides usa el pie de foto o un texto por defecto. Complétalo solo si quieres un texto específico.',
      },
      name: 'alt',
      type: 'text',
    },
  ],

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
