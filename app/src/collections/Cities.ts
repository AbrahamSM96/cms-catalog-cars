import type { CollectionConfig, FieldHook } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { cities, groups } from '../i18n/labels'
import { CACHE_TAGS } from '../lib/cache-tags'
import { slugify } from '../lib/slugify'

/**
 * Keep the slug URL-safe and derive it from the name when it is left empty.
 *
 * Always normalised, never trusted as typed: the slug is the city's URL
 * (`/seminuevos/pachuca`), and "Pachuca " and "pachuca" reaching the database
 * as two rows would split one city's inventory across two landing pages.
 *
 * Returns the incoming value untouched when there is nothing to derive from, so
 * the `required` validation reports the empty field instead of this hook
 * silently writing an empty slug.
 *
 * @param args - Payload field hook arguments.
 */
const deriveSlug: FieldHook = (args): string | undefined => {
  const { data, originalDoc, value } = args

  const typed = typeof value === 'string' ? value.trim() : ''
  if (typed) return slugify(typed)

  const name: unknown = data?.name ?? (originalDoc as { name?: unknown })?.name
  if (typeof name === 'string' && name.trim()) return slugify(name)

  return typeof value === 'string' ? value : undefined
}

export const Cities: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * read
     */
    read: () => true, // Public read access for the landing pages
    update: editorsAndAdmins,
  },
  admin: {
    defaultColumns: ['name', 'state', 'slug'],
    description: cities.description,
    group: groups.content,
    useAsTitle: 'name',
  },
  fields: [
    {
      fields: [
        {
          admin: {
            description: cities.fields.name.description,
            placeholder: 'Pachuca',
            width: '50%',
          },
          label: cities.fields.name.label,
          name: 'name',
          required: true,
          type: 'text',
          unique: true,
        },
        {
          admin: {
            description: cities.fields.state.description,
            placeholder: 'Hidalgo',
            width: '50%',
          },
          label: cities.fields.state.label,
          name: 'state',
          required: true,
          type: 'text',
        },
      ],
      type: 'row',
    },
    {
      admin: {
        description: cities.fields.slug.description,
        placeholder: 'pachuca',
      },
      hooks: { beforeValidate: [deriveSlug] },
      label: cities.fields.slug.label,
      name: 'slug',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: cities.fields.intro.description,
      },
      label: cities.fields.intro.label,
      name: 'intro',
      type: 'textarea',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars, CACHE_TAGS.cities)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars, CACHE_TAGS.cities)],
  },
  labels: cities.labels,
  slug: 'cities',
}
