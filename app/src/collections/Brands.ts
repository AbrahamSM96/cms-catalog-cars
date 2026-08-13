import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public read access for frontend
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
