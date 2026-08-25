import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../payload.config'

import { type CatalogVersion, vehicleCatalog } from './vehicleCatalog'
import { colorsList } from './colors'

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

/**
 * How many documents to create at once.
 *
 * The seed is bound by network round-trips, not by Postgres: against a managed
 * database each `payload.create` costs a few hundred milliseconds of latency, so
 * doing ~10k of them one after another took about 40 minutes. Running a fixed
 * number in flight collapses that to minutes.
 *
 * Kept well below node-postgres' default pool size of 10. Matching the pool
 * exactly starves it: every worker holds a connection, anything needing a second
 * one waits for a connection that cannot be released, and the server eventually
 * kills the stalled sessions (Postgres 25P03, idle-in-transaction timeout).
 */
const CONCURRENCY = 5

/**
 * Reference rows are independent, and the seed already resumes from whatever is
 * missing, so per-document transactions buy nothing here — they only hold a
 * pooled connection open for the length of each insert.
 */
const CREATE_OPTIONS = { disableTransaction: true } as const

/**
 * Run `task` over every item with at most CONCURRENCY promises in flight.
 *
 * Workers pull from a shared cursor rather than splitting the list up front, so
 * a slow item does not leave the other workers idle.
 *
 * @param items - Items to process.
 * @param task - Work to perform for one item.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array<R>(items.length)
  let cursor = 0

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await task(items[index] as T)
      }
    }
  )

  await Promise.all(workers)

  return results
}

/**
 * Narrow a Payload document id to a number.
 *
 * Payload types ids as `string | number` because it supports both Mongo and SQL
 * adapters. This project runs on Postgres, where every id column is a `serial`,
 * so the string half never occurs at runtime — but the compiler still sees it
 * and rejects assigning a raw `doc.id` into the numeric maps below.
 *
 * @param id - Document id as Payload reports it.
 */
function toId(id: number | string): number {
  return typeof id === 'number' ? id : Number(id)
}

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
    await payload.create({ ...CREATE_OPTIONS, collection: 'colors', data: color })
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
    existingBrands.docs.map((doc) => [doc.slug, toId(doc.id)])
  )
  /** `${brandId}::${modelName}` -> model id */
  const modelIds = new Map<string, number>(
    existingModels.docs.map((doc) => [
      `${toId(typeof doc.brand === 'object' ? doc.brand.id : doc.brand)}::${doc.name}`,
      toId(doc.id),
    ])
  )
  /** `${modelId}::${clave}` of every version already stored */
  const versionKeys = new Set(
    existingVersions.docs.map(
      (doc) =>
        `${toId(typeof doc.model === 'object' ? doc.model.id : doc.model)}::${doc.clave}`
    )
  )

  // Three phases, because each level needs the ids of the one above it: models
  // reference a brand, versions reference a model. Within a phase the rows are
  // independent, so they go out concurrently; across phases they cannot.

  // Phase 1 — brands.
  const missingBrands = vehicleCatalog.filter(
    (brand) => !brandIds.has(brand.slug)
  )
  const newBrands = await mapWithConcurrency(missingBrands, async (brand) => {
    const doc = await payload.create({
      ...CREATE_OPTIONS,
      collection: 'brands',
      data: { name: brand.name, slug: brand.slug },
    })

    return { id: toId(doc.id), slug: brand.slug }
  })
  for (const brand of newBrands) brandIds.set(brand.slug, brand.id)

  // Phase 2 — models, now that every brand id is known.
  const missingModels: { brandId: number; key: string; name: string }[] = []
  for (const brand of vehicleCatalog) {
    const brandId = brandIds.get(brand.slug) as number
    for (const model of brand.models) {
      const key = `${brandId}::${model.name}`
      if (!modelIds.has(key)) missingModels.push({ brandId, key, name: model.name })
    }
  }
  const newModels = await mapWithConcurrency(missingModels, async (model) => {
    const doc = await payload.create({
      ...CREATE_OPTIONS,
      collection: 'car-models',
      data: { brand: model.brandId, name: model.name },
    })

    return { id: toId(doc.id), key: model.key }
  })
  for (const model of newModels) modelIds.set(model.key, model.id)

  // Phase 3 — versions, the bulk of the work (~8.7k rows).
  const missingVersions: { modelId: number; version: CatalogVersion }[] = []
  for (const brand of vehicleCatalog) {
    const brandId = brandIds.get(brand.slug) as number
    for (const model of brand.models) {
      const modelId = modelIds.get(`${brandId}::${model.name}`) as number
      for (const version of model.versions) {
        if (versionKeys.has(`${modelId}::${version.clave}`)) continue
        missingVersions.push({ modelId, version })
      }
    }
  }
  await mapWithConcurrency(missingVersions, ({ modelId, version }) =>
    payload.create({
      ...CREATE_OPTIONS,
      collection: 'car-versions',
      data: {
        clave: version.clave,
        description: version.description,
        model: modelId,
        years: version.years,
      },
    })
  )

  return {
    brands: missingBrands.length,
    carModels: missingModels.length,
    carVersions: missingVersions.length,
  }
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
