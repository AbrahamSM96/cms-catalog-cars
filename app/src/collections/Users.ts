import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  admin: {
    group: 'Settings',
  },
  auth: true,
  fields: [],
  slug: 'users',
}
