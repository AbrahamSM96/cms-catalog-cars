import type { GlobalConfig } from 'payload'

import { CACHE_TAGS } from '../lib/cache-tags'
import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'

export const Contact: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Público: el frontend lo consume sin auth
    update: editorsAndAdmins,
  },
  admin: {
    description:
      'Datos de contacto que se muestran en el footer y en la página de contacto.',
    group: 'Content',
  },
  fields: [
    {
      fields: [
        {
          admin: { placeholder: '+52 55 5001 0000', width: '50%' },
          label: 'Teléfono',
          name: 'phone',
          type: 'text',
        },
        {
          admin: {
            description:
              'Solo dígitos con lada país (ej. 5255...). Se usa para el enlace de WhatsApp.',
            placeholder: '525550010000',
            width: '50%',
          },
          label: 'WhatsApp',
          name: 'whatsapp',
          type: 'text',
        },
      ],
      type: 'row',
    },
    {
      admin: { placeholder: 'contacto@tu-negocio.com' },
      label: 'Correo electrónico',
      name: 'email',
      type: 'email',
    },
    {
      fields: [
        {
          admin: { placeholder: 'Av. Universidad 2060, Copilco Universidad' },
          label: 'Calle y número',
          name: 'line1',
          type: 'text',
        },
        {
          fields: [
            {
              admin: { placeholder: 'Ciudad de México', width: '50%' },
              label: 'Ciudad',
              name: 'city',
              type: 'text',
            },
            {
              admin: { placeholder: 'CDMX', width: '50%' },
              label: 'Estado',
              name: 'state',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          fields: [
            {
              admin: { placeholder: '04360', width: '50%' },
              label: 'Código postal',
              name: 'postalCode',
              type: 'text',
            },
            {
              admin: { width: '50%' },
              defaultValue: 'México',
              label: 'País',
              name: 'country',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: { placeholder: 'https://maps.app.goo.gl/...' },
          label: 'Enlace de Google Maps (opcional)',
          name: 'googleMapsUrl',
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
          'Horario general que se muestra en la página de contacto (opcional).',
        placeholder:
          'Lun a Vie 9:00 a.m. – 7:00 p.m. · Sáb 9:00 a.m. – 2:00 p.m.',
      },
      label: 'Horario (texto)',
      name: 'hoursNote',
      type: 'textarea',
    },
    {
      admin: {
        description:
          'Enlaces completos (https://...). Deja vacío lo que no uses.',
      },
      fields: [
        {
          admin: { placeholder: 'https://facebook.com/...' },
          label: 'Facebook',
          name: 'facebook',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://instagram.com/...' },
          label: 'Instagram',
          name: 'instagram',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://tiktok.com/@...' },
          label: 'TikTok',
          name: 'tiktok',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://youtube.com/@...' },
          label: 'YouTube',
          name: 'youtube',
          type: 'text',
        },
      ],
      label: 'Redes sociales',
      name: 'social',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.contact)],
  },
  label: 'Contacto',
  slug: 'contact',
}
