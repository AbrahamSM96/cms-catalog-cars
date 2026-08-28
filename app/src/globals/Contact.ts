import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { common, contact, groups } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'

export const Contact: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public: the frontend reads it without auth
    update: editorsAndAdmins,
  },
  admin: {
    description: contact.description,
    group: groups.content,
  },
  fields: [
    {
      fields: [
        {
          admin: { placeholder: '+52 55 5001 0000', width: '50%' },
          label: common.phone,
          name: 'phone',
          type: 'text',
        },
        {
          admin: {
            description: contact.fields.whatsapp.description,
            placeholder: '525550010000',
            width: '50%',
          },
          label: common.whatsapp,
          name: 'whatsapp',
          type: 'text',
        },
      ],
      type: 'row',
    },
    {
      admin: { placeholder: 'contacto@tu-negocio.com' },
      label: common.email,
      name: 'email',
      type: 'email',
    },
    {
      fields: [
        {
          admin: { placeholder: 'Av. Universidad 2060, Copilco Universidad' },
          label: contact.fields.streetAndNumber.label,
          name: 'line1',
          type: 'text',
        },
        {
          fields: [
            {
              admin: { placeholder: 'Ciudad de México', width: '50%' },
              label: common.city,
              name: 'city',
              type: 'text',
            },
            {
              admin: { placeholder: 'CDMX', width: '50%' },
              label: common.state,
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
              label: common.postalCode,
              name: 'postalCode',
              type: 'text',
            },
            {
              admin: { width: '50%' },
              defaultValue: 'México',
              label: common.country,
              name: 'country',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: { placeholder: 'https://maps.app.goo.gl/...' },
          label: common.googleMapsUrl,
          name: 'googleMapsUrl',
          type: 'text',
        },
      ],
      label: common.address,
      name: 'address',
      type: 'group',
    },
    {
      admin: {
        description: contact.fields.hoursNote.description,
        placeholder:
          'Lun a Vie 9:00 a.m. – 7:00 p.m. · Sáb 9:00 a.m. – 2:00 p.m.',
      },
      label: contact.fields.hoursNote.label,
      name: 'hoursNote',
      type: 'textarea',
    },
    {
      admin: {
        description: contact.fields.social.description,
      },
      fields: [
        {
          admin: { placeholder: 'https://facebook.com/...' },
          label: contact.fields.social.fields.facebook.label,
          name: 'facebook',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://instagram.com/...' },
          label: contact.fields.social.fields.instagram.label,
          name: 'instagram',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://tiktok.com/@...' },
          label: contact.fields.social.fields.tiktok.label,
          name: 'tiktok',
          type: 'text',
        },
        {
          admin: { placeholder: 'https://youtube.com/@...' },
          label: contact.fields.social.fields.youtube.label,
          name: 'youtube',
          type: 'text',
        },
      ],
      label: contact.fields.social.label,
      name: 'social',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.contact)],
  },
  label: contact.label,
  slug: 'contact',
}
