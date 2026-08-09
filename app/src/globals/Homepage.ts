import type { GlobalConfig } from "payload";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: {
    group: "Content",
  },
  access: {
    read: () => true, // Público: el frontend lo consume sin auth
  },
  fields: [
    {
      name: "heroSlides",
      label: "Hero slides",
      type: "array",
      minRows: 0,
      maxRows: 8,
      labels: {
        singular: "Slide",
        plural: "Slides",
      },
      admin: {
        description:
          "Imágenes del carrusel principal (header). Se muestran en el orden de la lista.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "image",
          label: "Image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          label: "Caption",
          type: "text",
          admin: {
            description:
              "Texto opcional que aparece sobre la imagen. También se usa como texto alternativo (SEO) del slide si la imagen no tiene uno propio.",
          },
        },
      ],
    },
    {
      name: "hero",
      label: "Hero text",
      type: "group",
      admin: {
        description: "Título y textos del encabezado principal.",
      },
      fields: [
        {
          name: "badge",
          label: "Badge",
          type: "text",
          defaultValue: "Nuevos modelos disponibles",
        },
        {
          name: "heading",
          label: "Heading",
          type: "text",
          defaultValue: "Encuentra Tu Auto",
        },
        {
          name: "headingHighlight",
          label: "Heading highlight",
          type: "text",
          defaultValue: "Seminuevo Ideal",
          admin: {
            description: "Parte resaltada en rojo del título.",
          },
        },
        {
          name: "subheading",
          label: "Subheading",
          type: "textarea",
          defaultValue:
            "La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.",
        },
      ],
    },
  ],
};
