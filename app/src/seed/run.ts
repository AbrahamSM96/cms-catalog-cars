import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../payload.config'

import { colorsList } from './colors'
import { vehicleCatalog } from './vehicleCatalog'

/**
 * Reference-data seed, run as an explicit provisioning step.
 *
 *   bun run seed
 *
 * This used to live in the config's `onInit`, which meant it ran inline on the
 * first request that initialised Payload: a brand-new client waited ~43s for
 * their first page, and two concurrent requests both entered the seed and
 * duplicated models and versions. Provisioning belongs next to `migrate`, not
 * in the request path.
 *
 * Colors and the vehicle catalog are reference data every deploy needs — the
 * admin's brand/model/version pickers read from them — so this runs once per
 * client database, after the migrations.
 *
 * Idempotent: existing rows are read up front and only the missing ones are
 * created, so an interrupted run resumes instead of duplicating or, worse,
 * skipping the rest because the collection was no longer empty.
 */

/** Number of documents created, per collection. */
interface SeedCounts {
  brands: number
  carModels: number
  carVersions: number
  colors: number
}

/**
 * Insert the colour palette, skipping colours that already exist by name.
 *
 * @param payload - Payload instance
 */
async function seedColors(payload: Payload): Promise<number> {
  const existing = await payload.find({ collection: 'colors', limit: 0 })
  const known = new Set(existing.docs.map((doc) => doc.name))

  let created = 0
  for (const color of colorsList) {
    if (known.has(color.name)) continue
    await payload.create({ collection: 'colors', data: color })
    created++
  }

  return created
}

/**
 * Insert the brand / model / version catalog, skipping what already exists.
 *
 * Existing rows are loaded once and matched in memory — brands by slug, models
 * by brand + name, versions by model + clave — rather than querying per row,
 * which would mean thousands of round-trips.
 *
 * @param payload - Payload instance
 */
async function seedVehicleCatalog(
  payload: Payload
): Promise<Pick<SeedCounts, 'brands' | 'carModels' | 'carVersions'>> {
  const [existingBrands, existingModels, existingVersions] = await Promise.all([
    payload.find({ collection: 'brands', depth: 0, limit: 0 }),
    payload.find({ collection: 'car-models', depth: 0, limit: 0 }),
    payload.find({ collection: 'car-versions', depth: 0, limit: 0 }),
  ])

  /** slug -> brand id */
  const brandIds = new Map<string, number>(
    existingBrands.docs.map((doc) => [doc.slug, doc.id])
  )
  /** `${brandId}::${modelName}` -> model id */
  const modelIds = new Map<string, number>(
    existingModels.docs.map((doc) => [
      `${typeof doc.brand === 'object' ? doc.brand.id : doc.brand}::${doc.name}`,
      doc.id,
    ])
  )
  /** `${modelId}::${clave}` of every version already stored */
  const versionKeys = new Set(
    existingVersions.docs.map(
      (doc) =>
        `${typeof doc.model === 'object' ? doc.model.id : doc.model}::${doc.clave}`
    )
  )

  const counts = { brands: 0, carModels: 0, carVersions: 0 }

  for (const brand of vehicleCatalog) {
    let brandId = brandIds.get(brand.slug)
    if (!brandId) {
      const doc = await payload.create({
        collection: 'brands',
        data: { name: brand.name, slug: brand.slug },
      })
      brandId = doc.id
      brandIds.set(brand.slug, brandId)
      counts.brands++
    }

    for (const model of brand.models) {
      const modelKey = `${brandId}::${model.name}`
      let modelId = modelIds.get(modelKey)
      if (!modelId) {
        const doc = await payload.create({
          collection: 'car-models',
          data: { brand: brandId, name: model.name },
        })
        modelId = doc.id
        modelIds.set(modelKey, modelId)
        counts.carModels++
      }

      for (const version of model.versions) {
        if (versionKeys.has(`${modelId}::${version.clave}`)) continue
        await payload.create({
          collection: 'car-versions',
          data: {
            clave: version.clave,
            description: version.description,
            model: modelId,
            years: version.years,
          },
        })
        counts.carVersions++
      }
    }
  }

  return counts
}

/**
 * Seed every collection of reference data and report what was created.
 */
export async function seed(): Promise<SeedCounts> {
  const payload = await getPayload({ config })

  const colors = await seedColors(payload)
  const catalog = await seedVehicleCatalog(payload)

  return { ...catalog, colors }
}

const counts = await seed()

// eslint-disable-next-line no-console
console.log(
  `Seed complete — created ${counts.colors} colors, ${counts.brands} brands, ` +
    `${counts.carModels} models, ${counts.carVersions} versions ` +
    `(existing rows left untouched).`
)

process.exit(0)
