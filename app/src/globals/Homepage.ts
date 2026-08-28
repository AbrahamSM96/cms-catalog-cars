import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { groups, homepage } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'

export const Homepage: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public: the frontend reads it without auth
    update: editorsAndAdmins,
  },
  admin: {
    group: groups.content,
  },
  fields: [
    {
      admin: {
        description: homepage.fields.heroSlides.description,
        initCollapsed: true,
      },
      fields: [
        {
          label: homepage.fields.heroSlides.fields.image.label,
          name: 'image',
          relationTo: 'media',
          required: true,
          type: 'upload',
        },
        {
          admin: {
            description: homepage.fields.heroSlides.fields.caption.description,
          },
          label: homepage.fields.heroSlides.fields.caption.label,
          name: 'caption',
          type: 'text',
        },
      ],
      label: homepage.fields.heroSlides.label,
      labels: homepage.fields.heroSlides.labels,
      maxRows: 8,
      minRows: 0,
      name: 'heroSlides',
      type: 'array',
    },
    {
      admin: {
        description: homepage.fields.hero.description,
      },
      fields: [
        {
          defaultValue: 'Nuevos modelos disponibles',
          label: homepage.fields.hero.fields.badge.label,
          name: 'badge',
          type: 'text',
        },
        {
          defaultValue: 'Encuentra Tu Auto',
          label: homepage.fields.hero.fields.heading.label,
          name: 'heading',
          type: 'text',
        },
        {
          admin: {
            description:
              homepage.fields.hero.fields.headingHighlight.description,
          },
          defaultValue: 'Seminuevo Ideal',
          label: homepage.fields.hero.fields.headingHighlight.label,
          name: 'headingHighlight',
          type: 'text',
        },
        {
          defaultValue:
            'La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.',
          label: homepage.fields.hero.fields.subheading.label,
          name: 'subheading',
          type: 'textarea',
        },
      ],
      label: homepage.fields.hero.label,
      name: 'hero',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.homepage)],
  },
  label: homepage.label,
  slug: 'homepage',
}
