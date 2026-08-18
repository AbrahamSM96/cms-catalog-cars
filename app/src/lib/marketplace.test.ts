import { describe, expect, it } from 'vitest'

import {
  BODY_TYPE_OPTIONS,
  buildMarketplaceDescription,
  buildMarketplaceFields,
  CONDITION_OPTIONS,
  formatKm,
  formatPrice,
  FUEL_TYPE_OPTIONS,
  labelFor,
  TRANSMISSION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from './marketplace'
import type { MarketplaceValues } from './marketplace'

/**
 * Minimal marketplace values fixture.
 *
 * @param overrides - partial overrides merged into defaults.
 */
function makeValues(
  overrides: Partial<MarketplaceValues> = {}
): MarketplaceValues {
  return {
    brandName: 'Nissan',
    city: 'Guadalajara',
    condition: 'good',
    exteriorColor: 'Blanco',
    fuelType: 'gasoline',
    interiorColor: 'Negro',
    mileage: 45000,
    model: 'Versa',
    price: 250000,
    state: 'Jalisco',
    transmission: 'automatic',
    vehicleType: 'car',
    year: 2021,
    ...overrides,
  }
}

describe('labelFor', () => {
  it('returns label for matching value', () => {
    expect(labelFor(VEHICLE_TYPE_OPTIONS, 'car')).toBe('Auto')
  })

  it('returns String(value) for non-matching value', () => {
    expect(labelFor(VEHICLE_TYPE_OPTIONS, 'unknown')).toBe('unknown')
  })

  it('returns empty string for undefined', () => {
    expect(labelFor(VEHICLE_TYPE_OPTIONS, undefined)).toBe('')
  })

  it('returns empty string for null', () => {
    expect(labelFor(VEHICLE_TYPE_OPTIONS, null)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(labelFor(VEHICLE_TYPE_OPTIONS, '')).toBe('')
  })
})

describe('formatKm', () => {
  it('formats numeric mileage', () => {
    expect(formatKm(45000)).toBe('45,000 km')
  })

  it('returns empty string for 0', () => {
    expect(formatKm(0)).toBe('')
  })

  it('returns empty string for NaN', () => {
    expect(formatKm(Number.NaN)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatKm(undefined)).toBe('')
  })

  it('formats string mileage', () => {
    expect(formatKm('12000')).toBe('12,000 km')
  })
})

describe('formatPrice', () => {
  it('formats numeric price', () => {
    expect(formatPrice(250000)).toBe('$250,000')
  })

  it('returns empty string for 0', () => {
    expect(formatPrice(0)).toBe('')
  })

  it('returns empty string for NaN', () => {
    expect(formatPrice(Number.NaN)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatPrice(undefined)).toBe('')
  })

  it('formats string price', () => {
    expect(formatPrice('99000')).toBe('$99,000')
  })
})

describe('buildMarketplaceFields', () => {
  it('builds all fields with complete values', () => {
    const fields = buildMarketplaceFields(makeValues())
    expect(fields).toHaveLength(13)
    expect(fields.find((f) => f.key === 'vehicleType')?.value).toBe('Auto')
    expect(fields.find((f) => f.key === 'year')?.value).toBe('2021')
    expect(fields.find((f) => f.key === 'brand')?.value).toBe('Nissan')
    expect(fields.find((f) => f.key === 'model')?.value).toBe('Versa')
    expect(fields.find((f) => f.key === 'mileage')?.value).toBe('45,000 km')
    expect(fields.find((f) => f.key === 'price')?.value).toBe('$250,000')
    expect(fields.find((f) => f.key === 'bodyType')?.value).toBe('')
    expect(fields.find((f) => f.key === 'exteriorColor')?.value).toBe('Blanco')
    expect(fields.find((f) => f.key === 'interiorColor')?.value).toBe('Negro')
    expect(fields.find((f) => f.key === 'condition')?.value).toBe('Bueno')
    expect(fields.find((f) => f.key === 'fuelType')?.value).toBe('Gasolina')
    expect(fields.find((f) => f.key === 'transmission')?.value).toBe(
      'Automática'
    )
    expect(fields.find((f) => f.key === 'location')?.value).toBe(
      'Guadalajara, Jalisco'
    )
  })

  it('handles missing optional values', () => {
    const fields = buildMarketplaceFields({})
    expect(fields.find((f) => f.key === 'vehicleType')?.value).toBe('')
    expect(fields.find((f) => f.key === 'year')?.value).toBe('')
    expect(fields.find((f) => f.key === 'brand')?.value).toBe('')
    expect(fields.find((f) => f.key === 'model')?.value).toBe('')
    expect(fields.find((f) => f.key === 'mileage')?.value).toBe('')
    expect(fields.find((f) => f.key === 'price')?.value).toBe('')
    expect(fields.find((f) => f.key === 'location')?.value).toBe('')
  })

  it('verifies option values match Cars.ts schema options', async () => {
    const { Cars } = await import('@/collections/Cars')

    /**
     * Recursively find all select fields in a Payload field array.
     *
     * @param fields - Payload fields array.
     * @returns map of fieldName → option values.
     */
    function findSelects(
      fields: Array<Record<string, unknown>>
    ): Record<string, string[]> {
      const result: Record<string, string[]> = {}
      for (const field of fields) {
        if (field.type === 'select' && field.options) {
          result[field.name as string] = (
            field.options as Array<{ value: string }>
          ).map((o) => o.value)
        }
        for (const key of ['fields', 'blocks']) {
          if (Array.isArray(field[key])) {
            Object.assign(result, findSelects(field[key]))
          }
        }
      }
      return result
    }

    /**
     * Recursively find selects inside tabs.
     *
     * @param tabs - Payload tabs array.
     * @returns map of fieldName → option values.
     */
    function findSelectsInTabs(
      tabs: Array<Record<string, unknown>>
    ): Record<string, string[]> {
      const result: Record<string, string[]> = {}
      for (const tab of tabs) {
        if (Array.isArray(tab.fields)) {
          Object.assign(result, findSelects(tab.fields))
        }
      }
      return result
    }

    const fields = Cars.fields as Array<Record<string, unknown>>
    const selectFields: Record<string, string[]> = {}

    for (const field of fields) {
      if (field.type === 'tabs' && Array.isArray(field.tabs)) {
        Object.assign(selectFields, findSelectsInTabs(field.tabs))
      } else if (Array.isArray(field.fields)) {
        Object.assign(selectFields, findSelects(field.fields))
      }
    }

    expect(selectFields['vehicleType']).toEqual(
      VEHICLE_TYPE_OPTIONS.map((o) => o.value)
    )
    expect(selectFields['bodyType']).toEqual(
      BODY_TYPE_OPTIONS.map((o) => o.value)
    )
    expect(selectFields['condition']).toEqual(
      CONDITION_OPTIONS.map((o) => o.value)
    )
    expect(selectFields['fuelType']).toEqual(
      FUEL_TYPE_OPTIONS.map((o) => o.value)
    )
    expect(selectFields['transmission']).toEqual(
      TRANSMISSION_OPTIONS.map((o) => o.value)
    )
  })
})

describe('buildMarketplaceDescription', () => {
  it('builds full description with all specs', () => {
    const desc = buildMarketplaceDescription(makeValues())
    expect(desc).toContain('🚗 Nissan Versa 2021')
    expect(desc).toContain('• Kilometraje: 45,000 km')
    expect(desc).toContain('• Transmisión: Automática')
    expect(desc).toContain('• Combustible: Gasolina')
    expect(desc).toContain('• Color exterior: Blanco')
    expect(desc).toContain('• Color interior: Negro')
    expect(desc).toContain('• Estado: Bueno')
    expect(desc).toContain('• Ubicación: Guadalajara, Jalisco')
    expect(desc).toContain('💲 Precio: $250,000')
  })

  it('handles missing specs (skips them)', () => {
    const desc = buildMarketplaceDescription({
      brandName: 'Nissan',
      model: 'Versa',
    })
    expect(desc).toContain('🚗 Nissan Versa')
    expect(desc).not.toContain('• Kilometraje')
    expect(desc).not.toContain('• Transmisión')
  })

  it('includes features when present', () => {
    const values = makeValues({ features: ['A/C', 'Direccion asistida'] })
    const desc = buildMarketplaceDescription(values)
    expect(desc).toContain('✨ Equipamiento:')
    expect(desc).toContain('  - A/C')
    expect(desc).toContain('  - Direccion asistida')
  })

  it('omits features section when empty array', () => {
    const desc = buildMarketplaceDescription(makeValues({ features: [] }))
    expect(desc).not.toContain('✨ Equipamiento:')
  })

  it('omits features section when undefined', () => {
    const desc = buildMarketplaceDescription(
      makeValues({ features: undefined })
    )
    expect(desc).not.toContain('✨ Equipamiento:')
  })

  it('omits price section when no price', () => {
    const desc = buildMarketplaceDescription(makeValues({ price: undefined }))
    expect(desc).not.toContain('💲 Precio:')
  })

  it('includes contact message at the end', () => {
    const desc = buildMarketplaceDescription(makeValues())
    expect(desc).toContain('📩 Escríbenos para más información')
  })

  it('skips title line when all title parts are empty', () => {
    const desc = buildMarketplaceDescription({
      brandName: '',
      model: '',
      year: undefined,
    })
    expect(desc).not.toContain('🚗')
    expect(desc).toContain('📩 Escríbenos')
  })

  it('filters empty strings from features', () => {
    const values = makeValues({ features: ['', 'A/C', ''] })
    const desc = buildMarketplaceDescription(values)
    expect(desc).toContain('  - A/C')
    const featureLines = desc.split('\n').filter((l) => l.startsWith('  -'))
    expect(featureLines).toHaveLength(1)
  })
})
