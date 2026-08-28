import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { carModels, common, groups } from '../i18n/labels'
import { pick } from '../i18n/locales'
import { CACHE_TAGS } from '../lib/cache-tags'

/**
 * Reject a model whose referenced brand does not exist, so a model can only be
 * attached to a brand already present in the catalog.
 *
 * @param props - The Payload beforeValidate hook arguments.
 */
export const ensureBrandExists: CollectionBeforeValidateHook = async (
  props
): Promise<Record<string, unknown> | undefined> => {
  const { data, req } = props
  const brand = data?.brand
  if (brand === null || brand === undefined) return data

  const id =
    typeof brand === 'object' ? (brand as { id?: number | string }).id : brand
  if (id === null || id === undefined) return data

  try {
    await req.payload.findByID({ collection: 'brands', depth: 0, id })
  } catch {
    const message = pick(
      carModels.errors.brandMissing,
      req.i18n?.language ?? ''
    )
    throw new Error(`${message} (id: ${String(id)}).`)
  }

  return data
}

export const CarModels: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * read
     */
    read: () => true, // Public read access for frontend
    update: editorsAndAdmins,
  },
  admin: {
    defaultColumns: ['name', 'brand'],
    group: groups.settings,
    useAsTitle: 'name',
  },
  fields: [
    {
      admin: {
        description: carModels.fields.brand.description,
      },
      hasMany: false,
      label: common.brand,
      name: 'brand',
      relationTo: 'brands',
      required: true,
      type: 'relationship',
    },
    {
      label: common.name,
      name: 'name',
      required: true,
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
    beforeValidate: [ensureBrandExists],
  },
  labels: carModels.labels,
  slug: 'car-models',
}
