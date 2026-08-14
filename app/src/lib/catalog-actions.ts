'use server'

import { getPayload } from 'payload'

import config from '@payload-config'

export interface CatalogModelOption {
  id: number | string
  name: string
}

export interface CatalogVersionOption {
  clave: string
  description: string
  id: number | string
}

interface ModelDoc {
  id: number | string
  name: string
}

interface VersionDoc {
  clave: string
  description: string
  id: number | string
}

/**
 * List the models of a brand, sorted by name, for the cascading picker.
 *
 * @param props - Query parameters.
 * @param props.brandSlug - The slug of the brand whose models to list.
 */
export async function getCatalogModels(props: {
  brandSlug: string
}): Promise<CatalogModelOption[]> {
  const { brandSlug } = props
  if (!brandSlug) return []

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'car-models',
    depth: 0,
    limit: 1000,
    sort: 'name',
    where: { 'brand.slug': { equals: brandSlug } },
  })

  return (result.docs as ModelDoc[]).map((doc) => ({
    id: doc.id,
    name: doc.name,
  }))
}

/**
 * List the versions of a model for a given year, sorted by description.
 *
 * @param props - Query parameters.
 * @param props.modelId - The id of the model whose versions to list.
 * @param props.year - The model year to filter versions by.
 */
export async function getCatalogVersions(props: {
  modelId: number | string
  year: number
}): Promise<CatalogVersionOption[]> {
  const { modelId, year } = props
  if (!modelId || !year) return []

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'car-versions',
    depth: 0,
    limit: 1000,
    sort: 'description',
    where: {
      and: [{ model: { equals: modelId } }, { years: { equals: year } }],
    },
  })

  return (result.docs as VersionDoc[]).map((doc) => ({
    clave: doc.clave,
    description: doc.description,
    id: doc.id,
  }))
}
