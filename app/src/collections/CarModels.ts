import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'

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
    throw new Error(`La marca seleccionada no existe (id: ${String(id)}).`)
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
    group: 'Settings',
    useAsTitle: 'name',
  },
  fields: [
    {
      admin: {
        description: 'Marca a la que pertenece el modelo',
      },
      hasMany: false,
      name: 'brand',
      relationTo: 'brands',
      required: true,
      type: 'relationship',
    },
    {
      name: 'name',
      required: true,
      type: 'text',
    },
  ],
  hooks: {
    beforeValidate: [ensureBrandExists],
  },
  slug: 'car-models',
}
