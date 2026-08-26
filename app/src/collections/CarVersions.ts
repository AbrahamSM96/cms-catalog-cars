import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
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
    group: 'Settings',
    useAsTitle: 'description',
  },
  fields: [
    {
      admin: {
        description: 'Modelo al que pertenece la versión',
      },
      hasMany: false,
      name: 'model',
      relationTo: 'car-models',
      required: true,
      type: 'relationship',
    },
    {
      name: 'description',
      required: true,
      type: 'text',
    },
    {
      admin: {
        description: 'Clave vehicular (identificador único de la versión)',
      },
      name: 'clave',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: 'Años en los que se comercializó esta versión',
      },
      hasMany: true,
      name: 'years',
      required: true,
      type: 'number',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
  },
  slug: 'car-versions',
}
