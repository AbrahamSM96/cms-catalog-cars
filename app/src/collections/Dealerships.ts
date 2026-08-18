import type { CollectionConfig, Field } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import { validateLatitude, validateLongitude } from '../lib/coordinates'

const DAYS: { label: string; name: string }[] = [
  { label: 'Lunes', name: 'monday' },
  { label: 'Martes', name: 'tuesday' },
  { label: 'Miércoles', name: 'wednesday' },
  { label: 'Jueves', name: 'thursday' },
  { label: 'Viernes', name: 'friday' },
  { label: 'Sábado', name: 'saturday' },
  { label: 'Domingo', name: 'sunday' },
]

// One row per weekday: a "Cerrado" toggle plus opening/closing time (HH:MM, 24h).
const dayFields: Field[] = DAYS.map((day) => ({
  fields: [
    {
      fields: [
        {
          admin: { width: '34%' },
          defaultValue: false,
          label: 'Cerrado',
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
            description: 'Formato 24h',
            placeholder: '09:00',
            width: '33%',
          },
          label: 'Abre',
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
            description: 'Formato 24h',
            placeholder: '19:00',
            width: '33%',
          },
          label: 'Cierra',
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
          description: 'Datos principales del concesionario.',
          fields: [
            {
              admin: { placeholder: 'Seminuevos Centro Magno' },
              label: 'Nombre',
              name: 'name',
              required: true,
              type: 'text',
            },
            {
              admin: {
                description:
                  'Imagen que se muestra en la tarjeta de ubicación.',
              },
              label: 'Foto del concesionario',
              name: 'image',
              relationTo: 'media',
              type: 'upload',
            },
            {
              fields: [
                {
                  admin: { placeholder: '+52 33 3002 5050', width: '50%' },
                  label: 'Teléfono',
                  name: 'phone',
                  type: 'text',
                },
                {
                  admin: {
                    description:
                      'Solo dígitos con lada país (ej. 5233...). Opcional.',
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

        // UBICACIÓN
        {
          description: 'Dirección y coordenadas para el mapa.',
          fields: [
            {
              fields: [
                {
                  admin: { placeholder: 'Av. Adolfo López Mateos Sur 4247-B' },
                  label: 'Calle y número',
                  name: 'line1',
                  type: 'text',
                },
                {
                  fields: [
                    {
                      admin: { placeholder: 'Loma Bonita', width: '50%' },
                      label: 'Colonia',
                      name: 'neighborhood',
                      type: 'text',
                    },
                    {
                      admin: { placeholder: '45086', width: '50%' },
                      label: 'Código postal',
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
                      label: 'Ciudad',
                      name: 'city',
                      type: 'text',
                    },
                    {
                      admin: { placeholder: 'Jalisco', width: '50%' },
                      label: 'Estado',
                      name: 'state',
                      type: 'text',
                    },
                  ],
                  type: 'row',
                },
                {
                  defaultValue: 'México',
                  label: 'País',
                  name: 'country',
                  type: 'text',
                },
              ],
              label: 'Dirección',
              name: 'address',
              type: 'group',
            },
            {
              admin: {
                description:
                  'Usa grados DECIMALES (ej. 20.6597 y -103.3496), no grados-minutos-segundos. En Google Maps: clic derecho sobre el lugar → clic en las coordenadas para copiarlas (vienen en decimal).',
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
                      label: 'Latitud',
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
                      label: 'Longitud',
                      name: 'longitude',
                      type: 'number',
                      validate: validateLongitude,
                    },
                  ],
                  type: 'row',
                },
              ],
              label: 'Coordenadas (para el mapa)',
              name: 'coordinates',
              type: 'group',
            },
            {
              admin: {
                description: "Para el botón 'Cómo llegar'.",
                placeholder: 'https://maps.app.goo.gl/...',
              },
              label: 'Enlace de Google Maps (opcional)',
              name: 'googleMapsUrl',
              type: 'text',
            },
          ],
          label: 'Ubicación',
        },

        // HORARIO
        {
          description:
            'Horario de atención por día. Se usa para mostrar Abierto/Cerrado.',
          fields: [
            {
              fields: dayFields,
              label: false,
              name: 'hours',
              type: 'group',
            },
          ],
          label: 'Horario',
        },
      ],
      type: 'tabs',
    },
  ],
  slug: 'dealerships',
}
