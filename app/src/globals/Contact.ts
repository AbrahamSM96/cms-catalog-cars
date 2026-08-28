import type { GlobalConfig } from 'payload'

import { CACHE_TAGS } from '../lib/cache-tags'
import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'

export const Contact: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public: the frontend reads it without auth
    update: editorsAndAdmins,
  },
  admin: {
    description:
      'Contact details shown in the footer and on the contact page.',
    group: 'Content',
  },
  fields: [
    {
      fields: [
        {
          admin: { placeholder: '+52 55 5001 0000', width: '50%' },
          label: 'Phone',
          name: 'phone',
          type: 'text',
        },
        {
          admin: {
            description:
              'Digits only, including country code (e.g. 5255...). Used for the WhatsApp link.',
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
      label: 'Email',
      name: 'email',
      type: 'email',
    },
    {
      fields: [
        {
          admin: { placeholder: 'Av. Universidad 2060, Copilco Universidad' },
          label: 'Street and number',
          name: 'line1',
          type: 'text',
        },
        {
          fields: [
            {
              admin: { placeholder: 'Ciudad de México', width: '50%' },
              label: 'City',
              name: 'city',
              type: 'text',
            },
            {
              admin: { placeholder: 'CDMX', width: '50%' },
              label: 'State',
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
              label: 'Postal code',
              name: 'postalCode',
              type: 'text',
            },
            {
              admin: { width: '50%' },
              defaultValue: 'México',
              label: 'Country',
              name: 'country',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: { placeholder: 'https://maps.app.goo.gl/...' },
          label: 'Google Maps link (optional)',
          name: 'googleMapsUrl',
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
          'General opening hours shown on the contact page (optional).',
        placeholder:
          'Lun a Vie 9:00 a.m. – 7:00 p.m. · Sáb 9:00 a.m. – 2:00 p.m.',
      },
      label: 'Hours (text)',
      name: 'hoursNote',
      type: 'textarea',
    },
    {
      admin: {
        description:
          'Full links (https://...). Leave empty what you do not use.',
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
      label: 'Social media',
      name: 'social',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.contact)],
  },
  label: 'Contact',
  slug: 'contact',
}
