import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true, // Todos pueden ver las imágenes
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    // Enable the admin "Paste URL" feature. Without an `allowList` the admin
    // only attempts a browser-side fetch, which fails with CORS on most
    // external image hosts ("Failed to fetch the file"). Providing an allowList
    // turns on the server-side fetch fallback (no CORS) and gates which URLs
    // the server is allowed to download. `hostname: ""` matches any host (see
    // isURLAllowed), so any public http(s) image URL is accepted. This endpoint
    // is admin-only and gated by this collection's create/update access.
    pasteURL: {
      allowList: [
        { hostname: "", protocol: "https" },
        { hostname: "", protocol: "http" },
      ],
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 576,
        position: "centre",
      },
      {
        name: "featured",
        width: 1024,
        height: 768,
        position: "centre",
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texto alternativo (SEO)",
      admin: {
        description:
          "Opcional. Si lo dejas vacío, la web genera un texto alternativo descriptivo automáticamente: en las fotos de autos usa marca, modelo, versión, año y ciudad; en los slides usa el pie de foto o un texto por defecto. Complétalo solo si quieres un texto específico.",
      },
    },
  ],
};
