import { describe, expect, it } from 'vitest'

import { parseVersionDescription } from './version-specs'

// Real rows from the catalogue, copied verbatim.
const ACURA_ADX =
  '1.5L A-SPEC AA EE CD BA QC VP AUTOMATICO SUV 4 CIL 5 P 5 OCUP'
const HONDA_SALOON =
  '2.4L 1 MILLION EDITION DCT SALOON AA EE CD BA QC AUTOMATICO SEDAN 4 CIL 4 P 5 OCUP'
const BASE_MANUAL = '2.0L EX AA EE ESTANDAR HATCHBACK 4 CIL 5 P 5 OCUP'

describe('parseVersionDescription', () => {
  it('reads every spec a full description states', () => {
    expect(parseVersionDescription(ACURA_ADX)).toEqual({
      cylinders: 4,
      displacementL: 1.5,
      doors: 5,
      features: [
        'Aire acondicionado',
        'Elevadores eléctricos',
        'Bolsas de aire',
        'Quemacocos',
        'Vestiduras de piel',
      ],
      passengers: 5,
      transmission: 'automatic',
    })
  })

  it('does not invent equipment the description leaves out', () => {
    const specs = parseVersionDescription(HONDA_SALOON)

    expect(specs.features).not.toContain('Vestiduras de piel')
    expect(specs.features).toEqual([
      'Aire acondicionado',
      'Elevadores eléctricos',
      'Bolsas de aire',
      'Quemacocos',
    ])
  })

  it('never claims a CD player, whichever thing CD means', () => {
    const specs = parseVersionDescription(ACURA_ADX)

    expect(specs.features.join(' ')).not.toMatch(/CD/i)
  })

  it('separates doors from occupants even though both are bare numbers', () => {
    const specs = parseVersionDescription(HONDA_SALOON)

    expect(specs.doors).toBe(4)
    expect(specs.passengers).toBe(5)
  })

  it('reads a manual gearbox from the catalogue wording', () => {
    expect(parseVersionDescription(BASE_MANUAL).transmission).toBe('manual')
  })

  it('reads the drivetrain when the version states one', () => {
    const specs = parseVersionDescription(
      '3.0L LIMITED AA EE BA AWD AUTOMATICO SUV 6 CIL 5 P 7 OCUP'
    )

    expect(specs.features).toContain('Tracción en las cuatro ruedas')
  })

  it('reads a 4x4 badge as its own drivetrain', () => {
    const specs = parseVersionDescription(
      '3.5L PICKUP AA EE BA 4X4 AUTOMATICO 6 CIL 4 P 5 OCUP'
    )

    expect(specs.features).toContain('Tracción 4x4')
  })

  it('reports nothing rather than guessing on a description it cannot read', () => {
    expect(parseVersionDescription('EDICION ESPECIAL')).toEqual({
      cylinders: null,
      displacementL: null,
      doors: null,
      features: [],
      passengers: null,
      transmission: null,
    })
  })

  it('reads a displacement the catalogue omits on 45% of its rows as null', () => {
    const specs = parseVersionDescription(
      'GT AA EE BA AUTOMATICO SEDAN 4 CIL 4 P 5 OCUP'
    )

    expect(specs.displacementL).toBeNull()
    expect(specs.cylinders).toBe(4)
  })
})
