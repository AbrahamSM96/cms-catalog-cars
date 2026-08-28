import type { CollectionConfig } from 'payload'

import {
  adminsOnly,
  adminsOrSelf,
  adminsOrSelfFieldRead,
  editorsAndAdmins,
} from '../access'
import { groups, users } from '../i18n/labels'
import {
  forgotPasswordHTML,
  forgotPasswordSubject,
  RESET_TOKEN_EXPIRATION,
} from '../lib/email'

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
    group: groups.settings,
  },
  auth: {
    forgotPassword: {
      expiration: RESET_TOKEN_EXPIRATION,
      generateEmailHTML: forgotPasswordHTML,
      generateEmailSubject: forgotPasswordSubject,
    },
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
      label: users.fields.roles.label,
      name: 'roles',
      options: [
        {
          label: users.fields.roles.options.admin,
          value: 'admin',
        },
        {
          label: users.fields.roles.options.editor,
          value: 'editor',
        },
        {
          label: users.fields.roles.options.user,
          value: 'user',
        },
      ],
      saveToJWT: true,
      type: 'select',
    },
  ],
  labels: users.labels,
  slug: 'users',
}
