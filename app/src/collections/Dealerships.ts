import type { CollectionConfig, Field } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { validateLatitude, validateLongitude } from '../lib/coordinates'
import { CACHE_TAGS } from '../lib/cache-tags'

const DAYS: { label: string; name: string }[] = [
  { label: 'Monday', name: 'monday' },
  { label: 'Tuesday', name: 'tuesday' },
  { label: 'Wednesday', name: 'wednesday' },
  { label: 'Thursday', name: 'thursday' },
  { label: 'Friday', name: 'friday' },
  { label: 'Saturday', name: 'saturday' },
  { label: 'Sunday', name: 'sunday' },
]

// One row per weekday: a "Closed" toggle plus opening/closing time (HH:MM, 24h).
const dayFields: Field[] = DAYS.map((day) => ({
  fields: [
    {
      fields: [
        {
          admin: { width: '34%' },
          defaultValue: false,
          label: 'Closed',
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
            condition: (_, siblingData) => !siblingData?.closed,
            description: '24h format',
            placeholder: '09:00',
            width: '33%',
          },
          label: 'Opens',
          name: 'open',
          type: 'text',
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
            condition: (_, siblingData) => !siblingData?.closed,
            description: '24h format',
            placeholder: '19:00',
            width: '33%',
          },
          label: 'Closes',
          name: 'close',
          type: 'text',
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
    group: 'Content',
    useAsTitle: 'name',
  },
  fields: [
    {
      tabs: [
        // GENERAL
        {
          description: 'Main dealership data.',
          fields: [
            {
              admin: { placeholder: 'Seminuevos Centro Magno' },
              label: 'Name',
              name: 'name',
              required: true,
              type: 'text',
            },
            {
              admin: {
                description:
                  'Image shown on the location card.',
              },
              label: 'Dealership photo',
              name: 'image',
              relationTo: 'media',
              type: 'upload',
            },
            {
              fields: [
                {
                  admin: { placeholder: '+52 33 3002 5050', width: '50%' },
                  label: 'Phone',
                  name: 'phone',
                  type: 'text',
                },
                {
                  admin: {
                    description:
                      'Digits only, including country code (e.g. 5233...). Optional.',
                    placeholder: '5233 3002 5050',
                    width: '50%',
                  },
                  label: 'WhatsApp',
                  name: 'whatsapp',
                  type: 'text',
                },
              ],
              type: 'row',
            },
          ],
          label: 'General',
        },

        // LOCATION
        {
          description: 'Address and coordinates for the map.',
          fields: [
            {
              fields: [
                {
                  admin: { placeholder: 'Av. Adolfo López Mateos Sur 4247-B' },
                  label: 'Street and number',
                  name: 'line1',
                  type: 'text',
                },
                {
                  fields: [
                    {
                      admin: { placeholder: 'Loma Bonita', width: '50%' },
                      label: 'Neighborhood',
                      name: 'neighborhood',
                      type: 'text',
                    },
                    {
                      admin: { placeholder: '45086', width: '50%' },
                      label: 'Postal code',
                      name: 'postalCode',
                      type: 'text',
                    },
                  ],
                  type: 'row',
                },
                {
                  fields: [
                    {
                      admin: { placeholder: 'Zapopan', width: '50%' },
                      label: 'City',
                      name: 'city',
                      type: 'text',
                    },
                    {
                      admin: { placeholder: 'Jalisco', width: '50%' },
                      label: 'State',
                      name: 'state',
                      type: 'text',
                    },
                  ],
                  type: 'row',
                },
                {
                  defaultValue: 'México',
                  label: 'Country',
                  name: 'country',
                  type: 'text',
                },
              ],
              label: 'Address',
              name: 'address',
              type: 'group',
            },
            {
              admin: {
                description:
                  'Use DECIMAL degrees (e.g. 20.6597 and -103.3496), not degrees-minutes-seconds. In Google Maps: right-click the place → click the coordinates to copy them (they come in decimal).',
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
                      label: 'Latitude',
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
                      label: 'Longitude',
                      name: 'longitude',
                      type: 'number',
                      validate: validateLongitude,
                    },
                  ],
                  type: 'row',
                },
              ],
              label: 'Coordinates (for the map)',
              name: 'coordinates',
              type: 'group',
            },
            {
              admin: {
                description: "For the 'Get directions' button.",
                placeholder: 'https://maps.app.goo.gl/...',
              },
              label: 'Google Maps link (optional)',
              name: 'googleMapsUrl',
              type: 'text',
            },
          ],
          label: 'Location',
        },

        // HOURS
        {
          description:
            'Opening hours per day. Used to show Open/Closed.',
          fields: [
            {
              fields: dayFields,
              label: false,
              name: 'hours',
              type: 'group',
            },
          ],
          label: 'Hours',
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
  },
  slug: 'dealerships',
}
