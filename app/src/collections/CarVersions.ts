import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { carVersions, common, groups } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'

export const CarVersions: CollectionConfig = {
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
    defaultColumns: ['description', 'model', 'years'],
    group: groups.settings,
    useAsTitle: 'description',
  },
  fields: [
    {
      admin: {
        description: carVersions.fields.model.description,
      },
      hasMany: false,
      label: common.model,
      name: 'model',
      relationTo: 'car-models',
      required: true,
      type: 'relationship',
    },
    {
      label: common.description,
      name: 'description',
      required: true,
      type: 'text',
    },
    {
      admin: {
        description: carVersions.fields.clave.description,
      },
      label: carVersions.fields.clave.label,
      name: 'clave',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: carVersions.fields.years.description,
      },
      hasMany: true,
      label: carVersions.fields.years.label,
      name: 'years',
      required: true,
      type: 'number',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
  },
  labels: carVersions.labels,
  slug: 'car-versions',
}
