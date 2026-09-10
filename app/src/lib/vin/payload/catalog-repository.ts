import type { Payload } from 'payload'

import type {
  CatalogBrand,
  CatalogModel,
  CatalogRepository,
} from '../catalog-resolver'

/**
 * Payload-backed implementation of {@link CatalogRepository}.
 *
 * The queries mirror the ones the cascading Brand/Model/Version fields already
 * make (`lib/catalog-actions.ts`), so the VIN panel and the dropdowns can never
 * disagree about what the catalogue contains.
 */

interface BrandDoc {
  id: number | string
  name?: string
  slug?: string
}

interface ModelDoc {
  id: number | string
  name?: string
}

interface VersionDoc {
  description?: string
}

/**
 * Build a catalogue reader backed by Payload's local API.
 *
 * @param payload - The Payload instance to query.
 */
export function payloadCatalogRepository(payload: Payload): CatalogRepository {
  return {
    /**
     * List every brand, name first.
     */
    listBrands: async (): Promise<CatalogBrand[]> => {
      const result = await payload.find({
        collection: 'brands',
        depth: 0,
        limit: 1000,
        sort: 'name',
      })

      return (result.docs as BrandDoc[]).map((doc) => ({
        id: doc.id,
        name: doc.name ?? '',
        slug: doc.slug ?? '',
      }))
    },

    /**
     * List the models of one brand.
     *
     * @param brandId - The brand whose models to list.
     */
    listModels: async (brandId: number | string): Promise<CatalogModel[]> => {
      const result = await payload.find({
        collection: 'car-models',
        depth: 0,
        limit: 1000,
        sort: 'name',
        where: { brand: { equals: brandId } },
      })

      return (result.docs as ModelDoc[]).map((doc) => ({
        id: doc.id,
        name: doc.name ?? '',
      }))
    },

    /**
     * List the version descriptions of one model in one year.
     *
     * @param props - Query parameters.
     * @param props.modelId - The model whose versions to list.
     * @param props.year - The model year to filter by.
     */
    listVersionDescriptions: async (props: {
      modelId: number | string
      year: number
    }): Promise<string[]> => {
      const { modelId, year } = props

      const result = await payload.find({
        collection: 'car-versions',
        depth: 0,
        limit: 1000,
        sort: 'description',
        where: {
          and: [{ model: { equals: modelId } }, { years: { equals: year } }],
        },
      })

      const descriptions = (result.docs as VersionDoc[])
        .map((doc) => doc.description)
        .filter((description): description is string => Boolean(description))

      return [...new Set(descriptions)]
    },
  }
}
