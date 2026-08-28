import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'

export const Colors: CollectionConfig = {
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
    defaultColumns: ['name', 'hex'],
    description:
      'Color catalog (exterior and interior). Add as many as you need.',
    group: 'Settings',
    useAsTitle: 'name',
  },
  fields: [
    {
      admin: {
        description:
          'Color name in Spanish, as shown on the site (e.g. Negro, Blanco, Gris Oxford)',
        placeholder: 'Negro',
      },
      label: 'Color',
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: 'Hex code for the visual swatch (e.g. #000000)',
        placeholder: '#000000',
      },
      label: 'Color code (optional)',
      name: 'hex',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
  },
  slug: 'colors',
}
