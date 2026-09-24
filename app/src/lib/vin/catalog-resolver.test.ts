import { describe, expect, it } from 'vitest'

import { decodedVin } from './__fixtures__/decoded'
import type { CatalogBrand, CatalogModel, CatalogRepository } from './catalog-resolver'
import {
  resolveBrand,
  resolveCatalogFields,
  resolveModel,
  resolveVersion,
  scoreVersion,
} from './catalog-resolver'

const BRANDS: CatalogBrand[] = [
  { id: 1, name: 'Volkswagen', slug: 'volkswagen' },
  { id: 2, name: 'Mazda', slug: 'mazda' },
  { id: 3, name: 'Mercedes Benz', slug: 'mercedes-benz' },
  { id: 4, name: 'Land Rover', slug: 'land-rover' },
]

const MAZDA_MODELS: CatalogModel[] = [
  { id: 20, name: 'Mazda 3' },
  { id: 21, name: 'CX-5' },
]

/**
 * Build a catalogue that answers from plain in-memory data.
 *
 * @param props - What this catalogue contains.
 * @param props.brands - The brands to serve.
 * @param props.models - The models to serve for any brand.
 * @param props.versions - The version descriptions to serve for any model.
 */
function fakeRepo(props: {
  brands?: CatalogBrand[]
  models?: CatalogModel[]
  versions?: string[]
}): CatalogRepository {
  const { brands = BRANDS, models = MAZDA_MODELS, versions = [] } = props
  return {
    /**
     * List every brand.
     */
    listBrands: (): Promise<CatalogBrand[]> => Promise.resolve(brands),
    /**
     * List the models of a brand.
     */
    listModels: (): Promise<CatalogModel[]> => Promise.resolve(models),
    /**
     * List the version descriptions of a model and year.
     */
    listVersionDescriptions: (): Promise<string[]> => Promise.resolve(versions),
  }
}

describe('resolveBrand', () => {
  it('matches the make against the brand slug', () => {
    expect(resolveBrand(BRANDS, 'VOLKSWAGEN')).toEqual({
      brand: BRANDS[0],
      confidence: 'exact',
    })
  })

  it('ignores the punctuation vPIC and the catalogue disagree about', () => {
    expect(resolveBrand(BRANDS, 'MERCEDES-BENZ')?.brand).toEqual(BRANDS[2])
  })

  it('understands the short names people write', () => {
    expect(resolveBrand(BRANDS, 'VW')).toEqual({
      brand: BRANDS[0],
      confidence: 'inferred',
    })
  })

  it('accepts a prefix as a last resort, flagged as a guess', () => {
    expect(resolveBrand(BRANDS, 'LAND ROVER 4X4')).toEqual({
      brand: BRANDS[3],
      confidence: 'guess',
    })
  })

  it('returns nothing for a brand the catalogue does not sell', () => {
    expect(resolveBrand(BRANDS, 'FERRARI')).toBeNull()
  })

  it('returns nothing when the VIN carries no make', () => {
    expect(resolveBrand(BRANDS, null)).toBeNull()
  })
})

describe('resolveModel', () => {
  it('matches across the spacing vPIC drops', () => {
    expect(resolveModel(MAZDA_MODELS, 'Mazda3')).toEqual({
      confidence: 'exact',
      model: MAZDA_MODELS[0],
    })
  })

  it('matches a model written with its punctuation', () => {
    expect(resolveModel(MAZDA_MODELS, 'CX5')?.model).toEqual(MAZDA_MODELS[1])
  })

  it('accepts a prefix as a guess', () => {
    expect(resolveModel(MAZDA_MODELS, 'CX-5 Signature')).toEqual({
      confidence: 'guess',
      model: MAZDA_MODELS[1],
    })
  })

  it('returns nothing for a model the brand does not list', () => {
    expect(resolveModel(MAZDA_MODELS, 'Miata')).toBeNull()
  })

  it('returns nothing when the VIN carries no model', () => {
    expect(resolveModel(MAZDA_MODELS, null)).toBeNull()
  })
})

describe('scoreVersion', () => {
  it('rewards each piece of evidence the description confirms', () => {
    const decoded = decodedVin({
      displacementL: 2,
      doors: 5,
      engineCylinders: 4,
      transmissionStyle: 'Manual',
      trim: 'EX',
    })

    const score = scoreVersion(
      decoded,
      '2.0L EX AA EE CD BA ESTANDAR HATCHBACK 4 CIL 5 P'
    )

    // trim (3) + displacement (2) + cylinders (1) + doors (1) + gearbox (1)
    expect(score).toBe(8)
  })

  it('ignores single letters, which would match almost anything', () => {
    const decoded = decodedVin({ trim: 'S' })

    expect(scoreVersion(decoded, '2.0L EX ESTANDAR SEDAN 4 CIL 4 P')).toBe(0)
  })

  it('matches a short trim as a whole word, not as a fragment', () => {
    const decoded = decodedVin({ trim: 'GT' })

    expect(scoreVersion(decoded, '2.0L GTI ESTANDAR HATCHBACK 4 CIL 5 P')).toBe(0)
    expect(scoreVersion(decoded, '2.0L GT ESTANDAR HATCHBACK 4 CIL 5 P')).toBe(3)
  })

  it('does not count a transmission the description contradicts', () => {
    const decoded = decodedVin({ transmissionStyle: 'Automatic' })

    expect(scoreVersion(decoded, '2.0L EX ESTANDAR SEDAN 4 CIL 4 P')).toBe(0)
  })

  it('scores nothing when the VIN contradicts every number', () => {
    const decoded = decodedVin({
      displacementL: 1.6,
      doors: 2,
      engineCylinders: 6,
    })

    expect(scoreVersion(decoded, '2.0L GT ESTANDAR SEDAN 4 CIL 4 P')).toBe(0)
  })

  it('scores nothing when the VIN describes none of it', () => {
    expect(scoreVersion(decodedVin(), '2.0L EX ESTANDAR SEDAN 4 CIL 4 P')).toBe(0)
  })
})

describe('resolveVersion', () => {
  const descriptions = [
    '2.0L EX AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P',
    '2.0L GT AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P',
  ]

  it('picks the description the VIN points at', () => {
    const decoded = decodedVin({
      displacementL: 2,
      transmissionStyle: 'Automatic',
      trim: 'GT',
    })

    expect(resolveVersion(decoded, descriptions)).toBe(descriptions[1])
  })

  it('proposes nothing when the evidence is too thin', () => {
    const decoded = decodedVin({ engineCylinders: 4 })

    expect(resolveVersion(decoded, descriptions)).toBeNull()
  })

  it('proposes nothing when two descriptions score the same', () => {
    const decoded = decodedVin({
      displacementL: 2,
      doors: 4,
      engineCylinders: 4,
      transmissionStyle: 'Automatic',
    })

    expect(resolveVersion(decoded, descriptions)).toBeNull()
  })

  it('proposes nothing when the model has no versions for that year', () => {
    expect(resolveVersion(decodedVin({ trim: 'GT' }), [])).toBeNull()
  })
})

describe('resolveCatalogFields', () => {
  it('resolves brand, model and version when the catalogue knows all three', async () => {
    const decoded = decodedVin({
      displacementL: 2,
      make: 'MAZDA',
      model: 'Mazda3',
      modelYear: 2019,
      transmissionStyle: 'Automatic',
      trim: 'GT',
    })

    const suggestions = await resolveCatalogFields({
      decoded,
      repo: fakeRepo({
        versions: [
          '2.0L I AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P',
          '2.0L GT AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P',
        ],
      }),
    })

    expect(suggestions).toEqual([
      {
        confidence: 'exact',
        display: 'Mazda',
        label: expect.anything(),
        path: 'brand',
        value: 2,
      },
      {
        confidence: 'exact',
        label: expect.anything(),
        path: 'model',
        value: 'Mazda 3',
      },
      {
        confidence: 'guess',
        label: expect.anything(),
        path: 'version',
        value: '2.0L GT AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P',
      },
    ])
  })

  it('stops at the brand when the catalogue does not list the model', async () => {
    const decoded = decodedVin({ make: 'MAZDA', model: 'Miata' })

    const suggestions = await resolveCatalogFields({
      decoded,
      repo: fakeRepo({}),
    })

    expect(suggestions.map((s) => s.path)).toEqual(['brand'])
  })

  it('proposes nothing when the catalogue does not sell the brand', async () => {
    const decoded = decodedVin({ make: 'FERRARI', model: 'Roma' })

    const suggestions = await resolveCatalogFields({
      decoded,
      repo: fakeRepo({}),
    })

    expect(suggestions).toEqual([])
  })

  it('skips the version when the VIN carries no model year', async () => {
    const decoded = decodedVin({ make: 'MAZDA', model: 'Mazda3' })

    const suggestions = await resolveCatalogFields({
      decoded,
      repo: fakeRepo({ versions: ['2.0L GT AUTOMATICA SEDAN 4 CIL 4 P'] }),
    })

    expect(suggestions.map((s) => s.path)).toEqual(['brand', 'model'])
  })

  it('leaves the version empty when no description matches well enough', async () => {
    const decoded = decodedVin({
      make: 'MAZDA',
      model: 'Mazda3',
      modelYear: 2019,
    })

    const suggestions = await resolveCatalogFields({
      decoded,
      repo: fakeRepo({ versions: ['2.0L GT AUTOMATICA SEDAN 4 CIL 4 P'] }),
    })

    expect(suggestions.map((s) => s.path)).toEqual(['brand', 'model'])
  })
})
