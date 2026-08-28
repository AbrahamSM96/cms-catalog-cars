import type { GlobalConfig } from 'payload'

import { CACHE_TAGS } from '../lib/cache-tags'
import { editorsAndAdmins } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'

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
    description:
      'Site identity: brand, SEO, favicon, share image and colors.',
    group: 'Settings',
  },
  fields: [
    {
      admin: {
        description: 'Brand name and copy shown on the site.',
      },
      fields: [
        {
          admin: { placeholder: 'AutoCatálogo' },
          label: 'Brand name',
          name: 'name',
          required: true,
          type: 'text',
        },
        {
          admin: { placeholder: 'Autos seminuevos de calidad' },
          label: 'Tagline',
          name: 'tagline',
          type: 'text',
        },
        {
          admin: {
            description: 'Short description used in the footer.',
          },
          label: 'Description',
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description:
              'Shows the brand name next to the logo in the top bar and footer. Turn it off if your logo already includes the name.',
          },
          defaultValue: true,
          label: 'Show name next to logo',
          name: 'showName',
          type: 'checkbox',
        },
      ],
      label: 'Brand',
      name: 'brand',
      type: 'group',
    },
    {
      admin: {
        description:
          'Text seen by search engines (Google) and social networks when the site is shared.',
      },
      fields: [
        {
          admin: {
            description: 'Default title, also used on the home page.',
            placeholder: 'AutoCatálogo - Autos Seminuevos de Calidad',
          },
          label: 'Default title',
          name: 'titleDefault',
          type: 'text',
        },
        {
          admin: {
            description:
              'Template for inner pages. Use %s where the page title goes.',
            placeholder: '%s | AutoCatálogo',
          },
          label: 'Title template',
          name: 'titleTemplate',
          type: 'text',
        },
        {
          admin: {
            description: 'Long description (meta description).',
          },
          label: 'SEO description',
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description: 'Short description for social media (Open Graph).',
          },
          label: 'Social description',
          name: 'ogDescription',
          type: 'textarea',
        },
        {
          admin: {
            description: 'Keywords (one per row).',
          },
          fields: [
            {
              label: 'Keyword',
              name: 'value',
              required: true,
              type: 'text',
            },
          ],
          label: 'Keywords',
          name: 'keywords',
          type: 'array',
        },
      ],
      label: 'SEO',
      name: 'seo',
      type: 'group',
    },
    {
      admin: {
        description:
          'Brand images. The logo shows in the top bar and footer; the favicon is the browser tab icon; the share image appears when the link is pasted on social media.',
      },
      fields: [
        {
          admin: {
            description:
              'Brand logo (SVG, PNG or WebP). Displayed at 36 px tall, so use a file with a transparent background. If left empty the default icon is used.',
          },
          label: 'Logo',
          name: 'logo',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description: 'Browser tab icon (PNG or ICO).',
          },
          label: 'Favicon',
          name: 'favicon',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description:
              'Image shown when the site is shared (1200×630 recommended).',
          },
          label: 'Share image (Open Graph)',
          name: 'ogImage',
          relationTo: 'media',
          type: 'upload',
        },
      ],
      label: 'Images',
      name: 'media',
      type: 'group',
    },
    {
      admin: {
        description:
          'Brand colors. Applied to buttons, highlights and the loading bar.',
      },
      fields: [
        {
          fields: [
            {
              admin: { placeholder: '#276CF5', width: '50%' },
              label: 'Accent',
              name: 'accent',
              type: 'text',
            },
            {
              admin: { placeholder: '#1D4ED8', width: '50%' },
              label: 'Accent (hover)',
              name: 'accentStrong',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: {
            description: 'Main neutral color (text, dark surfaces).',
            placeholder: '#0f172a',
          },
          label: 'Primary',
          name: 'primary',
          type: 'text',
        },
      ],
      label: 'Colors',
      name: 'theme',
      type: 'group',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobalAfterChange(CACHE_TAGS.siteSettings)],
  },
  label: 'Site settings',
  slug: 'site-settings',
}
