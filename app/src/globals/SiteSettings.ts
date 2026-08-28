import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { common, groups, siteSettings } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'

/**
 * Per-client site configuration, editable from the admin panel.
 *
 * Everything a dealership needs to brand its site — name, tagline, SEO defaults,
 * favicon, Open Graph image and accent colours — lives here in its OWN database.
 * That keeps a single shared codebase: no per-client `.env` branding, no forks.
 * The frontend reads this global and falls back to sane defaults when empty.
 */
export const SiteSettings: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public: the frontend reads it without auth
    update: editorsAndAdmins,
  },
  admin: {
    description: siteSettings.description,
    group: groups.settings,
  },
  fields: [
    {
      admin: {
        description: siteSettings.fields.brand.description,
      },
      fields: [
        {
          admin: { placeholder: 'AutoCatálogo' },
          label: siteSettings.fields.brand.fields.brandName.label,
          name: 'name',
          required: true,
          type: 'text',
        },
        {
          admin: { placeholder: 'Autos seminuevos de calidad' },
          label: siteSettings.fields.brand.fields.tagline.label,
          name: 'tagline',
          type: 'text',
        },
        {
          admin: {
            description:
              siteSettings.fields.brand.fields.description.description,
          },
          label: common.description,
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description: siteSettings.fields.brand.fields.showName.description,
          },
          defaultValue: true,
          label: siteSettings.fields.brand.fields.showName.label,
          name: 'showName',
          type: 'checkbox',
        },
      ],
      label: siteSettings.fields.brand.label,
      name: 'brand',
      type: 'group',
    },
    {
      admin: {
        description: siteSettings.fields.seo.description,
      },
      fields: [
        {
          admin: {
            description:
              siteSettings.fields.seo.fields.titleDefault.description,
            placeholder: 'AutoCatálogo - Autos Seminuevos de Calidad',
          },
          label: siteSettings.fields.seo.fields.titleDefault.label,
          name: 'titleDefault',
          type: 'text',
        },
        {
          admin: {
            description:
              siteSettings.fields.seo.fields.titleTemplate.description,
            placeholder: '%s | AutoCatálogo',
          },
          label: siteSettings.fields.seo.fields.titleTemplate.label,
          name: 'titleTemplate',
          type: 'text',
        },
        {
          admin: {
            description: siteSettings.fields.seo.fields.description.description,
          },
          label: siteSettings.fields.seo.fields.description.label,
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description:
              siteSettings.fields.seo.fields.ogDescription.description,
          },
          label: siteSettings.fields.seo.fields.ogDescription.label,
          name: 'ogDescription',
          type: 'textarea',
        },
        {
          admin: {
            description: siteSettings.fields.seo.fields.keywords.description,
          },
          fields: [
            {
              label: siteSettings.fields.seo.fields.keywords.fields.value.label,
              name: 'value',
              required: true,
              type: 'text',
            },
          ],
          label: siteSettings.fields.seo.fields.keywords.label,
          name: 'keywords',
          type: 'array',
        },
      ],
      label: siteSettings.fields.seo.label,
      name: 'seo',
      type: 'group',
    },
    {
      admin: {
        description: siteSettings.fields.media.description,
      },
      fields: [
        {
          admin: {
            description: siteSettings.fields.media.fields.logo.description,
          },
          label: siteSettings.fields.media.fields.logo.label,
          name: 'logo',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description: siteSettings.fields.media.fields.favicon.description,
          },
          label: siteSettings.fields.media.fields.favicon.label,
          name: 'favicon',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description: siteSettings.fields.media.fields.ogImage.description,
          },
          label: siteSettings.fields.media.fields.ogImage.label,
          name: 'ogImage',
          relationTo: 'media',
          type: 'upload',
        },
      ],
      label: siteSettings.fields.media.label,
      name: 'media',
      type: 'group',
    },
    {
      admin: {
        description: siteSettings.fields.theme.description,
      },
      fields: [
        {
          fields: [
            {
              admin: { placeholder: '#276CF5', width: '50%' },
              label: siteSettings.fields.theme.fields.accent.label,
              name: 'accent',
              type: 'text',
            },
            {
              admin: { placeholder: '#1D4ED8', width: '50%' },
              label: siteSettings.fields.theme.fields.accentStrong.label,
              name: 'accentStrong',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: {
            description: siteSettings.fields.theme.fields.primary.description,
            placeholder: '#0f172a',
          },
          label: siteSettings.fields.theme.fields.primary.label,
          name: 'primary',
          type: 'text',
        },
      ],
      label: siteSettings.fields.theme.label,
      name: 'theme',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.siteSettings)],
  },
  label: siteSettings.label,
  slug: 'site-settings',
}
