import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { colors, groups } from '../i18n/labels'
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
    description: colors.description,
    group: groups.settings,
    useAsTitle: 'name',
  },
  fields: [
    {
      admin: {
        description: colors.fields.name.description,
        placeholder: 'Negro',
      },
      label: colors.fields.name.label,
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: colors.fields.hex.description,
        placeholder: '#000000',
      },
      label: colors.fields.hex.label,
      name: 'hex',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
  },
  labels: colors.labels,
  slug: 'colors',
}
