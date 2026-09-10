import type { FieldSuggestion } from '../types'

import { describe, expect, it } from 'vitest'

import { mapDecodedVin } from './registry'
import { decodedVin } from '../__fixtures__/decoded'

/**
 * Read one proposal out of a mapping run.
 *
 * @param decoded - The decoded VIN to map.
 * @param path - The field path to read.
 */
function suggestionFor(
  decoded: Parameters<typeof mapDecodedVin>[0],
  path: string
): FieldSuggestion | undefined {
  return mapDecodedVin(decoded).find((s) => s.path === path)
}

/**
 * Read the proposed value for one field out of a mapping run.
 *
 * @param decoded - The decoded VIN to map.
 * @param path - The field path to read.
 */
function valueFor(
  decoded: Parameters<typeof mapDecodedVin>[0],
  path: string
): number | string | string[] | undefined {
  return suggestionFor(decoded, path)?.value
}

describe('numeric mappers', () => {
  it('copies the values the VIN states outright', () => {
    const decoded = decodedVin({
      doors: 4,
      engineCylinders: 5,
      engineHp: 170,
      modelYear: 2013,
    })

    expect(mapDecodedVin(decoded)).toEqual([
      { confidence: 'exact', label: expect.anything(), path: 'year', value: 2013 },
      { confidence: 'exact', label: expect.anything(), path: 'doors', value: 4 },
      {
        confidence: 'exact',
        label: expect.anything(),
        path: 'cylinders',
        value: 5,
      },
      {
        confidence: 'exact',
        label: expect.anything(),
        path: 'horsepower',
        value: 170,
      },
    ])
  })

  it('proposes nothing for attributes the VIN does not carry', () => {
    expect(mapDecodedVin(decodedVin())).toEqual([])
  })
})

describe('fuel mapper', () => {
  it('reads the primary fuel', () => {
    expect(valueFor(decodedVin({ fuelTypePrimary: 'Gasoline' }), 'fuelType')).toBe(
      'gasoline'
    )
    expect(valueFor(decodedVin({ fuelTypePrimary: 'Diesel' }), 'fuelType')).toBe(
      'diesel'
    )
    expect(
      valueFor(decodedVin({ fuelTypePrimary: 'Electric' }), 'fuelType')
    ).toBe('electric')
  })

  it('files a hybrid as a hybrid even though its primary fuel is gasoline', () => {
    const decoded = decodedVin({
      electrificationLevel: 'Strong HEV',
      fuelTypePrimary: 'Gasoline',
    })

    expect(valueFor(decoded, 'fuelType')).toBe('hybrid')
  })

  it('separates a plug-in hybrid from a conventional one', () => {
    expect(
      valueFor(decodedVin({ electrificationLevel: 'PHEV' }), 'fuelType')
    ).toBe('plug-in-hybrid')
  })

  it('reads a battery electric vehicle off the electrification level', () => {
    expect(
      valueFor(decodedVin({ electrificationLevel: 'BEV' }), 'fuelType')
    ).toBe('electric')
  })

  it('proposes nothing for a fuel the catalogue has no option for', () => {
    expect(
      valueFor(decodedVin({ fuelTypePrimary: 'Compressed Natural Gas' }), 'fuelType')
    ).toBeUndefined()
  })
})

describe('body mappers', () => {
  it('translates vPIC body classes into the catalogue options', () => {
    expect(valueFor(decodedVin({ bodyClass: 'Sedan/Saloon' }), 'bodyType')).toBe(
      'sedan'
    )
    expect(valueFor(decodedVin({ bodyClass: 'Coupe' }), 'bodyType')).toBe('coupe')
    expect(
      valueFor(
        decodedVin({
          bodyClass: 'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)',
        }),
        'bodyType'
      )
    ).toBe('suv')
    expect(valueFor(decodedVin({ bodyClass: 'Pickup' }), 'bodyType')).toBe('truck')
    expect(
      valueFor(decodedVin({ bodyClass: 'Hatchback/Liftback/Notchback' }), 'bodyType')
    ).toBe('hatchback')
    expect(
      valueFor(decodedVin({ bodyClass: 'Convertible/Cabriolet' }), 'bodyType')
    ).toBe('convertible')
    expect(valueFor(decodedVin({ bodyClass: 'Wagon' }), 'bodyType')).toBe('wagon')
    expect(valueFor(decodedVin({ bodyClass: 'Minivan' }), 'bodyType')).toBe(
      'minivan'
    )
  })

  it('proposes nothing for a body class the catalogue has no option for', () => {
    expect(
      valueFor(decodedVin({ bodyClass: 'Incomplete - Chassis Cab' }), 'bodyType')
    ).toBeUndefined()
  })

  it('reads the vehicle type from vPIC when the body says nothing', () => {
    expect(
      valueFor(decodedVin({ vehicleType: 'PASSENGER CAR' }), 'vehicleType')
    ).toBe('car')
    expect(valueFor(decodedVin({ vehicleType: 'TRUCK' }), 'vehicleType')).toBe(
      'truck'
    )
  })

  it('sells an SUV as a camioneta even when vPIC calls it a passenger car', () => {
    const decoded = decodedVin({
      bodyClass: 'Sport Utility Vehicle (SUV)',
      vehicleType: 'PASSENGER CAR',
    })

    expect(valueFor(decoded, 'vehicleType')).toBe('truck')
  })

  it('proposes no vehicle type when neither attribute is recognizable', () => {
    expect(
      valueFor(decodedVin({ vehicleType: 'INCOMPLETE VEHICLE' }), 'vehicleType')
    ).toBeUndefined()
  })
})

describe('transmission mapper', () => {
  it('collapses every self-shifting box into automatic', () => {
    expect(
      valueFor(decodedVin({ transmissionStyle: 'Automatic' }), 'transmission')
    ).toBe('automatic')
    expect(
      valueFor(
        decodedVin({
          transmissionStyle: 'Continuously Variable Transmission (CVT)',
        }),
        'transmission'
      )
    ).toBe('automatic')
    expect(
      valueFor(
        decodedVin({ transmissionStyle: 'Dual-Clutch Transmission (DCT)' }),
        'transmission'
      )
    ).toBe('automatic')
  })

  it('does not read an automated manual as a stick shift', () => {
    expect(
      valueFor(
        decodedVin({ transmissionStyle: 'Automated Manual Transmission (AMT)' }),
        'transmission'
      )
    ).toBe('automatic')
  })

  it('reads a real manual', () => {
    expect(
      valueFor(decodedVin({ transmissionStyle: 'Manual' }), 'transmission')
    ).toBe('manual')
  })

  it('falls back to the catalogue wording for anything else', () => {
    expect(
      valueFor(decodedVin({ transmissionStyle: 'Tiptronic' }), 'transmission')
    ).toBe('automatic')
  })

  it('proposes nothing when vPIC states no transmission', () => {
    expect(valueFor(decodedVin(), 'transmission')).toBeUndefined()
  })
})

describe('engine mapper', () => {
  it('writes the description the way the catalogue does', () => {
    const decoded = decodedVin({ displacementL: 2.48, engineCylinders: 5 })

    expect(valueFor(decoded, 'engine')).toBe('L5 2.5')
  })

  it('uses the stated cylinder layout', () => {
    const decoded = decodedVin({
      displacementL: 3,
      engineConfiguration: 'V-Shaped',
      engineCylinders: 6,
    })

    expect(valueFor(decoded, 'engine')).toBe('V6 3.0')
  })

  it('keeps the in-line prefix explicit', () => {
    const decoded = decodedVin({
      displacementL: 2,
      engineConfiguration: 'In-Line',
      engineCylinders: 4,
    })

    expect(valueFor(decoded, 'engine')).toBe('L4 2.0')
  })

  it('proposes nothing without both the displacement and the cylinders', () => {
    expect(valueFor(decodedVin({ engineCylinders: 4 }), 'engine')).toBeUndefined()
    expect(valueFor(decodedVin({ displacementL: 2 }), 'engine')).toBeUndefined()
  })
})

describe('features mapper', () => {
  it('proposes equipment the car actually carries', () => {
    const decoded = decodedVin({
      abs: 'Standard',
      rearVisibilitySystem: 'Standard',
    })

    expect(valueFor(decoded, 'features')).toEqual([
      'Cámara de reversa',
      'Frenos ABS',
    ])
  })

  it('refuses to claim equipment that was merely optional', () => {
    const decoded = decodedVin({
      blindSpotMonitor: 'Optional',
      rearVisibilitySystem: 'Optional',
    })

    expect(valueFor(decoded, 'features')).toBeUndefined()
  })

  it('describes the airbags as one line rather than one per position', () => {
    const decoded = decodedVin({
      airBagLocCurtain: '1st and 2nd Rows',
      airBagLocFront: '1st Row (Driver and Passenger)',
      airBagLocSide: '1st Row (Driver and Passenger)',
    })

    expect(valueFor(decoded, 'features')).toEqual([
      'Bolsas de aire frontales, laterales y de cortina',
    ])
  })

  it('writes a single airbag position without a list', () => {
    const decoded = decodedVin({
      airBagLocFront: '1st Row (Driver and Passenger)',
    })

    expect(valueFor(decoded, 'features')).toEqual(['Bolsas de aire frontales'])
  })

  it('names every airbag position it is told about', () => {
    const decoded = decodedVin({
      airBagLocCurtain: '1st and 2nd Rows',
      airBagLocFront: '1st Row (Driver and Passenger)',
      airBagLocKnee: '1st Row (Driver and Passenger)',
      airBagLocSide: '1st Row (Driver and Passenger)',
    })

    expect(valueFor(decoded, 'features')).toEqual([
      'Bolsas de aire frontales, laterales, de cortina y de rodilla',
    ])
  })

  it('lists the equipment before the airbags, ready to read', () => {
    const decoded = decodedVin({
      adaptiveCruiseControl: 'Standard',
      airBagLocFront: '1st Row (Driver and Passenger)',
      esc: 'Standard',
      forwardCollisionWarning: 'Standard',
      keylessIgnition: 'Standard',
      laneDepartureWarning: 'Standard',
      parkAssist: 'Standard',
    })

    const suggestion = suggestionFor(decoded, 'features')

    expect(suggestion?.value).toEqual([
      'Sensores de estacionamiento',
      'Alerta de colisión frontal',
      'Alerta de cambio de carril',
      'Control crucero adaptativo',
      'Encendido sin llave',
      'Control electrónico de estabilidad',
      'Bolsas de aire frontales',
    ])
    expect(suggestion?.display).toBe(
      'Sensores de estacionamiento · Alerta de colisión frontal · Alerta de cambio de carril · Control crucero adaptativo · Encendido sin llave · Control electrónico de estabilidad · Bolsas de aire frontales'
    )
  })

  it('proposes nothing for a VIN that reports no equipment', () => {
    expect(valueFor(decodedVin(), 'features')).toBeUndefined()
  })

  it('proposes nothing for a Mexican-market car with only blank equipment fields', () => {
    // What vPIC actually answers for a Sentra assembled in Aguascalientes:
    // every driver-assist field empty, airbags the only thing populated.
    const decoded = decodedVin({
      blindSpotMonitor: null,
      forwardCollisionWarning: null,
      rearVisibilitySystem: null,
    })

    expect(valueFor(decoded, 'features')).toBeUndefined()
  })
})
