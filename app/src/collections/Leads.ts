import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import { groups, leads } from '../i18n/labels'

/**
 * Refuse every create request that arrives through the API.
 *
 * Leads are written by the server action in `lib/lead-actions.ts`, which goes
 * through the Local API and therefore bypasses access control entirely. Nothing
 * else may create one. The action behind a lead is public by nature — anyone
 * who can see a car can tap the WhatsApp button — so an open create endpoint is
 * a standing invitation to fill this collection with whatever a script decides
 * to post at it, and the collection is the client's sales report.
 */
const denyCreate = (): boolean => false

export const Leads: CollectionConfig = {
  access: {
    create: denyCreate,
    delete: adminsOnly,
    read: editorsAndAdmins,
    update: editorsAndAdmins,
  },
  admin: {
    components: {
      // Rolling 30-day overview above the list (components/admin/leads.css).
      beforeList: ['/components/admin/LeadsSummary#LeadsSummary'],
    },
    defaultColumns: ['createdAt', 'car', 'source', 'utmCampaign', 'status'],
    description: leads.description,
    group: groups.sales,
  },
  fields: [
    {
      fields: [
        {
          admin: {
            description: leads.fields.car.description,
            width: '50%',
          },
          hasMany: false,
          label: leads.fields.car.label,
          name: 'car',
          relationTo: 'cars',
          type: 'relationship',
        },
        {
          admin: {
            description: leads.fields.status.description,
            width: '50%',
          },
          defaultValue: 'new',
          label: leads.fields.status.label,
          name: 'status',
          options: [
            {
              label: leads.options.status.new,
              value: 'new',
            },
            {
              label: leads.options.status.contacted,
              value: 'contacted',
            },
            {
              label: leads.options.status.sold,
              value: 'sold',
            },
            {
              label: leads.options.status.lost,
              value: 'lost',
            },
          ],
          required: true,
          type: 'select',
        },
      ],
      type: 'row',
    },
    {
      fields: [
        {
          admin: {
            description: leads.fields.source.description,
            readOnly: true,
            width: '50%',
          },
          label: leads.fields.source.label,
          name: 'source',
          options: [
            {
              label: leads.options.source.whatsapp,
              value: 'whatsapp',
            },
            {
              label: leads.options.source.phone,
              value: 'phone',
            },
            {
              label: leads.options.source.form,
              value: 'form',
            },
          ],
          required: true,
          type: 'select',
        },
        {
          admin: {
            description: leads.fields.placement.description,
            readOnly: true,
            width: '50%',
          },
          label: leads.fields.placement.label,
          name: 'placement',
          options: [
            {
              label: leads.options.placement.carDetail,
              value: 'car-detail',
            },
            {
              label: leads.options.placement.navbar,
              value: 'navbar',
            },
            {
              label: leads.options.placement.footer,
              value: 'footer',
            },
            {
              label: leads.options.placement.contactPage,
              value: 'contact-page',
            },
          ],
          required: true,
          type: 'select',
        },
      ],
      type: 'row',
    },
    {
      admin: {
        description: leads.fields.notes.description,
      },
      label: leads.fields.notes.label,
      name: 'notes',
      type: 'textarea',
    },
    // Captured from the landing URL, never typed. Collapsed by default because
    // the answer these fields give ("this one came from the October campaign")
    // is already summarised in the list column, and an expanded block of five
    // empty fields is what most organic leads would show.
    {
      admin: { initCollapsed: true },
      fields: [
        {
          fields: [
            {
              admin: {
                description: leads.fields.utmSource.description,
                readOnly: true,
                width: '50%',
              },
              label: leads.fields.utmSource.label,
              name: 'utmSource',
              type: 'text',
            },
            {
              admin: {
                description: leads.fields.utmMedium.description,
                readOnly: true,
                width: '50%',
              },
              label: leads.fields.utmMedium.label,
              name: 'utmMedium',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          fields: [
            {
              admin: {
                description: leads.fields.utmCampaign.description,
                readOnly: true,
                width: '50%',
              },
              label: leads.fields.utmCampaign.label,
              name: 'utmCampaign',
              type: 'text',
            },
            {
              admin: {
                description: leads.fields.utmContent.description,
                readOnly: true,
                width: '50%',
              },
              label: leads.fields.utmContent.label,
              name: 'utmContent',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: {
            description: leads.fields.landingPath.description,
            readOnly: true,
          },
          label: leads.fields.landingPath.label,
          name: 'landingPath',
          type: 'text',
        },
        {
          admin: {
            description: leads.fields.fbclid.description,
            readOnly: true,
          },
          label: leads.fields.fbclid.label,
          name: 'fbclid',
          type: 'text',
        },
      ],
      label: leads.fields.origin.label,
      type: 'collapsible',
    },
  ],
  labels: leads.labels,
  slug: 'leads',
}
