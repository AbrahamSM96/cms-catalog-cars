import type { CollectionConfig } from 'payload'

import { adminsOnly, adminsOrSelf } from '../access'

export const Users: CollectionConfig = {
  access: {
    admin: adminsOnly,
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    readVersions: adminsOnly,
    unlock: adminsOnly,
    update: adminsOrSelf,
  },
  admin: {
    group: 'Settings',
  },
  auth: {
    lockTime: 60 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 60 * 60 * 4,
  },
  fields: [
    {
      access: {
        read: adminsOnly,
        update: adminsOnly,
      },
      defaultValue: ['user'],
      hasMany: true,
      name: 'roles',
      options: ['admin', 'editor', 'user'],
      saveToJWT: true,
      type: 'select',
    },
  ],
  slug: 'users',
}
