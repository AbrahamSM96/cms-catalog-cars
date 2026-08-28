import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { brands, common, groups } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'

export const Brands: CollectionConfig = {
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
    group: groups.settings,
    useAsTitle: 'name',
  },
  fields: [
    {
      label: common.name,
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: brands.fields.slug.description,
      },
      label: brands.fields.slug.label,
      name: 'slug',
      required: true,
      type: 'text',
      unique: true,
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.brands, CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.brands, CACHE_TAGS.cars)],
  },
  labels: brands.labels,
  slug: 'brands',
}
