import catalog from './vehicle-catalog.json'

export interface CatalogVersion {
  clave: string
  description: string
  years: number[]
}

export interface CatalogModel {
  name: string
  versions: CatalogVersion[]
}

export interface CatalogBrand {
  models: CatalogModel[]
  name: string
  slug: string
}

/**
 * The full vehicle catalog (brands → models → versions), sourced once and now
 * owned by the project. Used to seed the Brands / CarModels / CarVersions
 * collections.
 */
export const vehicleCatalog = (catalog as { brands: CatalogBrand[] }).brands
