import { describe, expect, it } from 'vitest'

import { buildVersionOptions } from './car-versions'

const GT = '2.0L GT AA EE CD BA AUTOMATICA SEDAN 4 CIL 4 P'
const BASE = '2.0L I AA EE CD BA ESTANDAR SEDAN 4 CIL 4 P'

describe('buildVersionOptions', () => {
  it('offers the versions of the exact year, unlabelled', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2018, 2019] },
        { description: BASE, years: [2019] },
      ],
      year: 2019,
    })

    expect(options).toEqual([
      { label: GT, value: GT },
      { label: BASE, value: BASE },
    ])
  })

  it('collapses a version the catalogue repeats across years', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2019] },
        { description: GT, years: [2019, 2020] },
      ],
      year: 2019,
    })

    expect(options).toEqual([{ label: GT, value: GT }])
  })

  it('borrows the nearest years when the exact one has nothing, and says so', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2018] },
        { description: BASE, years: [2015] },
      ],
      year: 2019,
    })

    expect(options).toEqual([
      { label: `2018 · ${GT}`, value: GT },
      { label: `2015 · ${BASE}`, value: BASE },
    ])
  })

  it('keeps the closest year when a borrowed version spans several', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2012, 2013] },
        { description: GT, years: [2017] },
      ],
      year: 2019,
    })

    expect(options).toEqual([{ label: `2017 · ${GT}`, value: GT }])
  })

  // The catalogue is scraped, so a row's years arrive in whatever order the
  // source listed them — the nearest one is not always the last.
  it('keeps the closest year when one row lists its years descending', () => {
    const options = buildVersionOptions({
      docs: [{ description: GT, years: [2017, 2012] }],
      year: 2019,
    })

    expect(options).toEqual([{ label: `2017 · ${GT}`, value: GT }])
  })

  it('keeps the closest year regardless of the order rows arrive in', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2017] },
        { description: GT, years: [2012] },
      ],
      year: 2019,
    })

    expect(options).toEqual([{ label: `2017 · ${GT}`, value: GT }])
  })

  it('breaks a tie between equally distant years by description', () => {
    const options = buildVersionOptions({
      docs: [
        { description: GT, years: [2021] },
        { description: BASE, years: [2017] },
      ],
      year: 2019,
    })

    // Both sit two years away, so the description decides: the GT trim's
    // description starts "2.0L G", the base one "2.0L I".
    expect(options.map((option) => option.value)).toEqual([GT, BASE])
  })

  it('ignores rows with no description', () => {
    const options = buildVersionOptions({
      docs: [{ years: [2019] }, { description: '', years: [2019] }],
      year: 2019,
    })

    expect(options).toEqual([])
  })

  it('ignores a borrowable row that carries no years', () => {
    const options = buildVersionOptions({
      docs: [{ description: GT }, { description: BASE, years: [] }],
      year: 2019,
    })

    expect(options).toEqual([])
  })

  it('returns nothing when the model has no versions at all', () => {
    expect(buildVersionOptions({ docs: [], year: 2019 })).toEqual([])
  })
})
