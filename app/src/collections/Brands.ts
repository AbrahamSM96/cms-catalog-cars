import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'

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
    group: 'Settings',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: 'URL-friendly version of the brand name',
      },
      name: 'slug',
      required: true,
      type: 'text',
      unique: true,
    },
  ],
  slug: 'brands',
}
