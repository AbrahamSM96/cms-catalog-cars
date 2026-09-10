import type { CatalogBrand, CatalogModel, CatalogRepository } from './catalog-resolver'
import type { DecodeOutcome, VinDecoder } from './types'

import { describe, expect, it } from 'vitest'

import { decodeVinToSuggestions, inFormOrder } from './decode-vin'
import { decodedVin } from './__fixtures__/decoded'

const VW_JETTA_MX_2013 = '3vwdx7aj1dm389728'

const LABEL = { en: 'Field', es: 'Campo' }

const BRANDS: CatalogBrand[] = [
  { id: 1, name: 'Volkswagen', slug: 'volkswagen' },
]
const MODELS: CatalogModel[] = [{ id: 10, name: 'Jetta' }]

const repo: CatalogRepository = {
  /**
   * List every brand.
   */
  listBrands: (): Promise<CatalogBrand[]> => Promise.resolve(BRANDS),
  /**
   * List the models of a brand.
   */
  listModels: (): Promise<CatalogModel[]> => Promise.resolve(MODELS),
  /**
   * List the version descriptions of a model and year.
   */
  listVersionDescriptions: (): Promise<string[]> =>
    Promise.resolve(['2.5L COMFORTLINE AUTOMATICA SEDAN 5 CIL 4 P']),
}

/**
 * Build a decoder that always answers with the given outcome.
 *
 * @param outcome - What every decode resolves to.
 */
function fixedDecoder(outcome: DecodeOutcome): VinDecoder {
  return {
    /**
     * Answer with the fixed outcome.
     */
    decode: (): Promise<DecodeOutcome> => Promise.resolve(outcome),
  }
}

describe('inFormOrder', () => {
  it('puts a field the order does not list at the end', () => {
    const ordered = inFormOrder([
      { confidence: 'exact', label: LABEL, path: 'doors', value: 4 },
      { confidence: 'exact', label: LABEL, path: 'mileage', value: 40000 },
      { confidence: 'exact', label: LABEL, path: 'year', value: 2013 },
    ])

    expect(ordered.map((s) => s.path)).toEqual(['year', 'doors', 'mileage'])
  })
})

describe('decodeVinToSuggestions', () => {
  it('returns the proposals in the order the form asks for them', async () => {
    const decoder = fixedDecoder({
      data: decodedVin({
        bodyClass: 'Sedan/Saloon',
        displacementL: 2.48,
        doors: 4,
        engineCylinders: 5,
        engineHp: 170,
        fuelTypePrimary: 'Gasoline',
        make: 'VOLKSWAGEN',
        model: 'Jetta',
        modelYear: 2013,
        transmissionStyle: 'Automatic',
        trim: 'Comfortline',
        vehicleType: 'PASSENGER CAR',
      }),
      ok: true,
      source: 'network',
    })

    const report = await decodeVinToSuggestions({
      decoder,
      repo,
      vin: VW_JETTA_MX_2013,
    })

    expect(report).toMatchObject({ ok: true, source: 'network' })
    if (!report.ok) return

    expect(report.suggestions.map((s) => s.path)).toEqual([
      'brand',
      'model',
      'year',
      'version',
      'transmission',
      'fuelType',
      'vehicleType',
      'bodyType',
      'engine',
      'horsepower',
      'cylinders',
      'doors',
    ])
  })

  it('normalizes the VIN it reports back', async () => {
    const decoder = fixedDecoder({
      data: decodedVin({ make: 'VOLKSWAGEN' }),
      ok: true,
      source: 'store',
    })

    const report = await decodeVinToSuggestions({
      decoder,
      repo,
      vin: VW_JETTA_MX_2013,
    })

    expect(report).toMatchObject({ vin: '3VWDX7AJ1DM389728' })
  })

  it('still fills the technical fields for a brand the catalogue does not sell', async () => {
    const decoder = fixedDecoder({
      data: decodedVin({ doors: 2, make: 'FERRARI', model: 'Roma' }),
      ok: true,
      source: 'memory',
    })

    const report = await decodeVinToSuggestions({
      decoder,
      repo,
      vin: VW_JETTA_MX_2013,
    })

    expect(report).toMatchObject({ ok: true })
    if (!report.ok) return
    expect(report.suggestions.map((s) => s.path)).toEqual(['doors'])
  })

  it('passes a failed decode straight through', async () => {
    const decoder = fixedDecoder({ ok: false, reason: 'unavailable' })

    const report = await decodeVinToSuggestions({
      decoder,
      repo,
      vin: VW_JETTA_MX_2013,
    })

    expect(report).toEqual({ ok: false, reason: 'unavailable' })
  })
})
