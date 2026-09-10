import type { CollectionConfig } from 'payload'

import { adminsOnly } from '../access'
import { groups, vinDecodes } from '../i18n/labels'

/**
 * Durable cache of VIN decodes, one row per squish VIN.
 *
 * Nobody fills this in by hand — the decode endpoint writes it — but it is a
 * visible collection rather than an opaque table so an admin can see what the
 * provider actually answered, and delete a row to force a fresh lookup.
 *
 * Reads are admin-only: a VIN identifies a specific vehicle, so it has no
 * business being served to the public site the way the catalogue is.
 */
export const VinDecodes: CollectionConfig = {
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['squish', 'sampleVin', 'fetchedAt'],
    description: vinDecodes.description,
    group: groups.settings,
    useAsTitle: 'squish',
  },
  fields: [
    {
      admin: {
        description: vinDecodes.fields.squish.description,
        readOnly: true,
      },
      index: true,
      label: vinDecodes.fields.squish.label,
      name: 'squish',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: vinDecodes.fields.sampleVin.description,
        readOnly: true,
      },
      label: vinDecodes.fields.sampleVin.label,
      name: 'sampleVin',
      type: 'text',
    },
    {
      admin: { readOnly: true },
      label: vinDecodes.fields.fetchedAt.label,
      name: 'fetchedAt',
      type: 'date',
    },
    {
      admin: { readOnly: true },
      label: vinDecodes.fields.decoded.label,
      name: 'decoded',
      type: 'json',
    },
    {
      admin: {
        description: vinDecodes.fields.raw.description,
        readOnly: true,
      },
      label: vinDecodes.fields.raw.label,
      name: 'raw',
      type: 'json',
    },
  ],
  labels: vinDecodes.labels,
  slug: 'vin-decodes',
}
