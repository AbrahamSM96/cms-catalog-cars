import { describe, expect, it } from 'vitest'

import type { Car, Dealership } from '../types/car'

import { buildAutoDealerLd, buildItemListLd } from './json-ld'

/**
 * Minimal car fixture.
 *
 * @param overrides - partial overrides merged into defaults.
 */
function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    brand: 'Nissan',
    createdAt: '',
    id: 42,
    model: 'Versa',
    price: 250000,
    status: 'available',
    transmission: 'automatic',
    updatedAt: '',
    version: 'Advance',
    year: 2021,
    ...overrides,
  }
}

/**
 * Minimal dealership fixture.
 *
 * @param overrides - partial overrides merged into defaults.
 */
function makeDealer(overrides: Partial<Dealership> = {}): Dealership {
  return {
    createdAt: '',
    id: 1,
    name: 'AutoGDL',
    updatedAt: '',
    ...overrides,
  }
}

describe('buildItemListLd', () => {
  it('builds list items with positions', () => {
    const cars = [makeCar(), makeCar({ id: 99, model: 'Sentra' })]
    const items = buildItemListLd(cars)
    expect(items).toHaveLength(2)
    expect(items[0]['@type']).toBe('ListItem')
    expect(items[0]['position']).toBe(1)
    expect(items[1]['position']).toBe(2)
  })

  it('includes brand name from object', () => {
    const car = makeCar({
      brand: { id: 1, name: 'Nissan', slug: 'nissan' },
    })
    const items = buildItemListLd([car])
    expect(items[0]['name']).toBe('Nissan Versa Advance 2021')
  })

  it('uses empty string when brand is not object', () => {
    const car = makeCar({ brand: 'Nissan' })
    const items = buildItemListLd([car])
    expect(items[0]['name']).toBe('Versa Advance 2021')
  })

  it('builds correct url', () => {
    const items = buildItemListLd([makeCar()])
    expect(items[0]['url']).toContain('/catalogo/')
  })

  it('handles empty array', () => {
    expect(buildItemListLd([])).toEqual([])
  })
})

describe('buildAutoDealerLd', () => {
  it('builds basic dealer with name', () => {
    const dealers = buildAutoDealerLd([makeDealer()])
    expect(dealers).toHaveLength(1)
    expect(dealers[0]['@type']).toBe('AutoDealer')
    expect(dealers[0]['name']).toBe('AutoGDL')
  })

  it('includes address when present', () => {
    const dealer = makeDealer({
      address: {
        city: 'Guadalajara',
        country: 'MX',
        line1: 'Av. Vallarta 1000',
        postalCode: '44100',
        state: 'Jalisco',
      },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const addr = result['address'] as Record<string, unknown>
    expect(addr['@type']).toBe('PostalAddress')
    expect(addr['addressLocality']).toBe('Guadalajara')
    expect(addr['addressRegion']).toBe('Jalisco')
    expect(addr['streetAddress']).toBe('Av. Vallarta 1000')
    expect(addr['postalCode']).toBe('44100')
  })

  it('uses fallback country MX when not provided', () => {
    const dealer = makeDealer({
      address: { city: 'CDMX', line1: 'Calle 1' },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const addr = result['address'] as Record<string, unknown>
    expect(addr['addressCountry']).toBe('MX')
  })

  it('omits address when not present', () => {
    const result = buildAutoDealerLd([makeDealer()])[0]
    expect(result['address']).toBeUndefined()
  })

  it('includes geo when coordinates present', () => {
    const dealer = makeDealer({
      coordinates: { latitude: 19.43, longitude: -99.13 },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const geo = result['geo'] as Record<string, unknown>
    expect(geo['@type']).toBe('GeoCoordinates')
    expect(geo['latitude']).toBe(19.43)
    expect(geo['longitude']).toBe(-99.13)
  })

  it('omits geo when coordinates missing', () => {
    const result = buildAutoDealerLd([makeDealer()])[0]
    expect(result['geo']).toBeUndefined()
  })

  it('omits geo when latitude is missing', () => {
    const dealer = makeDealer({ coordinates: { longitude: -99.13 } })
    const result = buildAutoDealerLd([dealer])[0]
    expect(result['geo']).toBeUndefined()
  })

  it('omits geo when longitude is missing', () => {
    const dealer = makeDealer({ coordinates: { latitude: 19.43 } })
    const result = buildAutoDealerLd([dealer])[0]
    expect(result['geo']).toBeUndefined()
  })

  it('includes telephone when phone present', () => {
    const dealer = makeDealer({ phone: '+523312345678' })
    const result = buildAutoDealerLd([dealer])[0]
    expect(result['telephone']).toBe('+523312345678')
  })

  it('omits telephone when phone missing', () => {
    const result = buildAutoDealerLd([makeDealer()])[0]
    expect(result['telephone']).toBeUndefined()
  })

  it('includes openingHoursSpecification for valid days', () => {
    const dealer = makeDealer({
      hours: {
        friday: { close: '18:00', open: '09:00' },
        monday: { close: '19:00', open: '08:00' },
      },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const specs = result['openingHoursSpecification'] as Array<
      Record<string, unknown>
    >
    expect(specs).toHaveLength(2)
    const dayOfWeeks = specs.map((s) => s['dayOfWeek'])
    expect(dayOfWeeks).toContain('Monday')
    expect(dayOfWeeks).toContain('Friday')
    const mondaySpec = specs.find((s) => s['dayOfWeek'] === 'Monday')
    expect(mondaySpec?.['opens']).toBe('08:00')
    expect(mondaySpec?.['closes']).toBe('19:00')
  })

  it('filters out closed days', () => {
    const dealer = makeDealer({
      hours: {
        monday: { closed: true },
        tuesday: { close: '19:00', open: '09:00' },
      },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const specs = result['openingHoursSpecification'] as Array<
      Record<string, unknown>
    >
    expect(specs).toHaveLength(1)
    expect(specs[0]['dayOfWeek']).toBe('Tuesday')
  })

  it('filters out days with missing open or close', () => {
    const dealer = makeDealer({
      hours: {
        monday: { open: '09:00' },
        tuesday: { close: '19:00' },
        wednesday: {},
      },
    })
    const result = buildAutoDealerLd([dealer])[0]
    const specs = result['openingHoursSpecification'] as Array<
      Record<string, unknown>
    >
    expect(specs).toHaveLength(0)
  })

  it('omits hours when dealer has no hours', () => {
    const result = buildAutoDealerLd([makeDealer()])[0]
    expect(result['openingHoursSpecification']).toBeUndefined()
  })

  it('sets url to /ubicaciones', () => {
    const result = buildAutoDealerLd([makeDealer()])[0]
    expect(result['url']).toContain('/ubicaciones')
  })
})
