import type { CollectionConfig, Field } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import { fillCoordinatesFromMapsUrl } from '../hooks/mapsCoordinates'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { common, dealerships, groups } from '../i18n/labels'
import type { Translated } from '../i18n/locales'
import { CACHE_TAGS } from '../lib/cache-tags'
import { validateLatitude, validateLongitude } from '../lib/coordinates'
import { isTimeOfDay } from '../lib/hours'

const DAYS: { label: Translated; name: string }[] = [
  { label: dealerships.fields.monday.label, name: 'monday' },
  { label: dealerships.fields.tuesday.label, name: 'tuesday' },
  { label: dealerships.fields.wednesday.label, name: 'wednesday' },
  { label: dealerships.fields.thursday.label, name: 'thursday' },
  { label: dealerships.fields.friday.label, name: 'friday' },
  { label: dealerships.fields.saturday.label, name: 'saturday' },
  { label: dealerships.fields.sunday.label, name: 'sunday' },
]

/**
 * Reject a time the site cannot read.
 *
 * The `TimeField` dropdown can only produce valid values, so this guards the
 * other door: the REST/Local API, where a free-form string would otherwise
 * reach the column and silently disable the open/closed badge.
 *
 * @param value - The submitted time, absent when the day is marked closed.
 */
const validateTime = (value?: null | string): string | true =>
  !value || isTimeOfDay(value) ? true : 'HH:MM (24h)'

// One row per weekday: a "Closed" toggle plus opening/closing time (HH:MM, 24h).
const dayFields: Field[] = DAYS.map((day) => ({
  fields: [
    {
      fields: [
        {
          admin: { width: '34%' },
          defaultValue: false,
          label: dealerships.fields.closed.label,
          name: 'closed',
          type: 'checkbox',
        },
        {
          admin: {
            /**
             * Condition to show open time field
             *
             * @param _ - The field value (unused)
             * @param siblingData - The sibling field data
             * @returns Whether to show the field
             */
            components: { Field: '/components/admin/TimeField#TimeField' },
            /**
             * Shows the opening time unless the dealership is closed.
             *
             * @param _ - The field value, which is unused.
             * @param siblingData - The sibling field data.
             */
            condition: (_, siblingData) => !siblingData?.closed,
            description: dealerships.fields.opens.description,
            width: '33%',
          },
          label: dealerships.fields.opens.label,
          name: 'open',
          type: 'text',
          validate: validateTime,
        },
        {
          admin: {
            /**
             * Condition to show close time field
             *
             * @param _ - The field value (unused)
             * @param siblingData - The sibling field data
             * @returns Whether to show the field
             */
            components: { Field: '/components/admin/TimeField#TimeField' },
            /**
             * Shows the closing time unless the dealership is closed.
             *
             * @param _ - The field value, which is unused.
             * @param siblingData - The sibling field data.
             */
            condition: (_, siblingData) => !siblingData?.closed,
            description: dealerships.fields.opens.description,
            width: '33%',
          },
          label: dealerships.fields.closes.label,
          name: 'close',
          type: 'text',
          validate: validateTime,
        },
      ],
      type: 'row',
    },
  ],
  label: day.label,
  name: day.name,
  type: 'group',
}))

export const Dealerships: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * Allow public read access for the frontend locations page
     */
    read: () => true,
    update: editorsAndAdmins,
  },
  admin: {
    defaultColumns: ['name', 'phone', 'updatedAt'],
    group: groups.content,
    useAsTitle: 'name',
  },
  fields: [
    {
      tabs: [
        // GENERAL
        {
          description: dealerships.tabs.general.description,
          fields: [
            {
              admin: { placeholder: 'Seminuevos Centro Magno' },
              label: common.name,
              name: 'name',
              required: true,
              type: 'text',
            },
            {
              admin: {
                description: dealerships.fields.dealershipPhoto.description,
              },
              label: dealerships.fields.dealershipPhoto.label,
              name: 'image',
              relationTo: 'media',
              type: 'upload',
            },
            {
              fields: [
                {
                  admin: { placeholder: '+52 33 3002 5050', width: '50%' },
                  label: common.phone,
                  name: 'phone',
                  type: 'text',
                },
                {
                  admin: {
                    description: dealerships.fields.whatsapp.description,
                    placeholder: '5233 3002 5050',
                    width: '50%',
                  },
                  label: common.whatsapp,
                  name: 'whatsapp',
                  type: 'text',
                },
              ],
              type: 'row',
            },
          ],
          label: dealerships.tabs.general.label,
        },

        // LOCATION
        {
          description: dealerships.tabs.location.description,
          fields: [
            {
              fields: [
                {
                  admin: { placeholder: 'Av. Adolfo López Mateos Sur 4247-B' },
                  label: dealerships.fields.line1.label,
                  name: 'line1',
                  type: 'text',
                },
                {
                  fields: [
                    {
                      admin: { placeholder: 'Loma Bonita', width: '50%' },
                      label: dealerships.fields.neighborhood.label,
                      name: 'neighborhood',
                      type: 'text',
                    },
                    {
                      admin: { placeholder: '45086', width: '50%' },
                      label: common.postalCode,
                      name: 'postalCode',
                      type: 'text',
                    },
                  ],
                  type: 'row',
                },
                {
                  admin: { description: dealerships.fields.city.description },
                  hasMany: false,
                  label: common.city,
                  name: 'city',
                  relationTo: 'cities',
                  required: true,
                  type: 'relationship',
                },
                {
                  defaultValue: 'México',
                  label: common.country,
                  name: 'country',
                  type: 'text',
                },
              ],
              label: common.address,
              name: 'address',
              type: 'group',
            },
            {
              admin: {
                description: dealerships.fields.googleMapsUrl.description,
                placeholder: 'https://maps.app.goo.gl/...',
              },
              label: common.googleMapsUrl,
              name: 'googleMapsUrl',
              type: 'text',
            },
            {
              admin: {
                description: dealerships.fields.coordinates.description,
              },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        placeholder: '20.6597',
                        step: 0.000001,
                        width: '50%',
                      },
                      label: dealerships.fields.latitude.label,
                      name: 'latitude',
                      type: 'number',
                      validate: validateLatitude,
                    },
                    {
                      admin: {
                        placeholder: '-103.3496',
                        step: 0.000001,
                        width: '50%',
                      },
                      label: dealerships.fields.longitude.label,
                      name: 'longitude',
                      type: 'number',
                      validate: validateLongitude,
                    },
                  ],
                  type: 'row',
                },
              ],
              label: dealerships.fields.coordinates.label,
              name: 'coordinates',
              type: 'group',
            },
          ],
          label: dealerships.tabs.location.label,
        },

        // HOURS
        {
          description: dealerships.tabs.hours.description,
          fields: [
            {
              fields: dayFields,
              label: false,
              name: 'hours',
              type: 'group',
            },
          ],
          label: dealerships.tabs.hours.label,
        },
      ],
      type: 'tabs',
    },
  ],
  hooks: {
    afterChange: [
      revalidateAfterChange(CACHE_TAGS.cars, CACHE_TAGS.dealerships),
    ],
    afterDelete: [
      revalidateAfterDelete(CACHE_TAGS.cars, CACHE_TAGS.dealerships),
    ],
    beforeChange: [fillCoordinatesFromMapsUrl],
  },
  labels: dealerships.labels,
  slug: 'dealerships',
}
