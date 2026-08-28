import type { GlobalConfig } from 'payload'

import { CACHE_TAGS } from '../lib/cache-tags'
import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'

export const Homepage: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public: the frontend reads it without auth
    update: editorsAndAdmins,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      admin: {
        description:
          'Main carousel (header) images. Shown in list order.',
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
              'Optional text shown over the image. Also used as the slide alt text (SEO) when the image has none of its own.',
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
        description: 'Title and copy for the main header.',
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
            description: 'Part of the title highlighted in red.',
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
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.homepage)],
  },
  label: 'Homepage',
  slug: 'homepage',
}
