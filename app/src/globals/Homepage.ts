import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Público: el frontend lo consume sin auth
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      admin: {
        description:
          'Imágenes del carrusel principal (header). Se muestran en el orden de la lista.',
        initCollapsed: true,
      },
      fields: [
        {
          label: 'Image',
          name: 'image',
          relationTo: 'media',
          required: true,
          type: 'upload',
        },
        {
          admin: {
            description:
              'Texto opcional que aparece sobre la imagen. También se usa como texto alternativo (SEO) del slide si la imagen no tiene uno propio.',
          },
          label: 'Caption',
          name: 'caption',
          type: 'text',
        },
      ],
      label: 'Hero slides',
      labels: {
        plural: 'Slides',
        singular: 'Slide',
      },
      maxRows: 8,
      minRows: 0,
      name: 'heroSlides',
      type: 'array',
    },
    {
      admin: {
        description: 'Título y textos del encabezado principal.',
      },
      fields: [
        {
          defaultValue: 'Nuevos modelos disponibles',
          label: 'Badge',
          name: 'badge',
          type: 'text',
        },
        {
          defaultValue: 'Encuentra Tu Auto',
          label: 'Heading',
          name: 'heading',
          type: 'text',
        },
        {
          admin: {
            description: 'Parte resaltada en rojo del título.',
          },
          defaultValue: 'Seminuevo Ideal',
          label: 'Heading highlight',
          name: 'headingHighlight',
          type: 'text',
        },
        {
          defaultValue:
            'La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.',
          label: 'Subheading',
          name: 'subheading',
          type: 'textarea',
        },
      ],
      label: 'Hero text',
      name: 'hero',
      type: 'group',
    },
  ],
  label: 'Homepage',
  slug: 'homepage',
}
