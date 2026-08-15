import type { CollectionConfig } from 'payload'

import { adminsOnly, adminsOrSelf, adminsOrSelfFieldRead, editorsAndAdmins } from '../access'

export const Users: CollectionConfig = {
  access: {
    admin: editorsAndAdmins,
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOrSelf,
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
        read: adminsOrSelfFieldRead,
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
