import { describe, expect, it } from 'vitest'

import type { Car } from '../types/car'

import { buildCarImageSlug, buildCarSlug, parseCarSlug } from './car-slug'

/**
 * Minimal car fixture.
 *
 * @param overrides - partial overrides merged into defaults.
 */
function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    brand: { id: 1, name: 'Nissan', slug: 'nissan' },
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

describe('buildCarSlug', () => {
  it('builds a slug from object brand', () => {
    const car = makeCar()
    expect(buildCarSlug(car)).toBe('nissan-versa-advance-2021-42')
  })

  it('builds a slug when brand is string (brandName becomes empty)', () => {
    const car = makeCar({ brand: 'Nissan' })
    expect(buildCarSlug(car)).toBe('versa-advance-2021-42')
  })

  it('strips accents (á → a)', () => {
    const car = makeCar({ model: 'March', version: 'Año Nuevo' })
    expect(buildCarSlug(car)).toBe('nissan-march-ano-nuevo-2021-42')
  })

  it('replaces symbols and spaces with hyphens', () => {
    const car = makeCar({ model: 'Sentra', version: 'SR (Special Edition)' })
    expect(buildCarSlug(car)).toBe('nissan-sentra-sr-special-edition-2021-42')
  })

  it('trims leading and trailing hyphens', () => {
    const car = makeCar({ model: ' Versa ' })
    expect(buildCarSlug(car)).toBe('nissan-versa-advance-2021-42')
  })

  it('handles numeric year and id', () => {
    const car = makeCar({ id: 99, year: 2020 })
    expect(buildCarSlug(car)).toBe('nissan-versa-advance-2020-99')
  })

  it('filters out empty slugified segments (version empty)', () => {
    const car = makeCar({ version: '' })
    expect(buildCarSlug(car)).toBe('nissan-versa-2021-42')
  })

  it('filters when brand name is empty and brand is string', () => {
    const car = makeCar({ brand: '' })
    expect(buildCarSlug(car)).toBe('versa-advance-2021-42')
  })

  it('round-trips: parseCarSlug(buildCarSlug(car)) === String(car.id)', () => {
    const car = makeCar()
    const slug = buildCarSlug(car)
    expect(parseCarSlug(slug)).toBe(String(car.id))
  })

  it('handles undefined version in slugify', () => {
    const car = makeCar({ version: undefined as unknown as string })
    expect(buildCarSlug(car)).toBe('nissan-versa-2021-42')
  })
})

describe('buildCarImageSlug', () => {
  it('omits the version so filenames stay short', () => {
    const car = makeCar()
    expect(buildCarImageSlug(car)).toBe('nissan-versa-2021-42')
  })

  it('builds a slug when brand is a string (brandName becomes empty)', () => {
    const car = makeCar({ brand: 'Nissan' })
    expect(buildCarImageSlug(car)).toBe('versa-2021-42')
  })

  it('strips accents and symbols from the model', () => {
    const car = makeCar({ model: 'Márch (GT)' })
    expect(buildCarImageSlug(car)).toBe('nissan-march-gt-2021-42')
  })

  it('filters out empty slugified segments (model empty)', () => {
    const car = makeCar({ model: '' })
    expect(buildCarImageSlug(car)).toBe('nissan-2021-42')
  })

  it('keeps two otherwise identical cars apart through the id', () => {
    expect(buildCarImageSlug(makeCar({ id: 7 }))).not.toBe(
      buildCarImageSlug(makeCar({ id: 8 }))
    )
  })
})

describe('parseCarSlug', () => {
  it('extracts the last segment from a normal slug', () => {
    expect(parseCarSlug('nissan-versa-advance-2021-42')).toBe('42')
  })

  it('returns null for empty string', () => {
    expect(parseCarSlug('')).toBeNull()
  })

  it('returns null when last segment is empty (trailing hyphen)', () => {
    expect(parseCarSlug('nissan-versa-')).toBeNull()
  })

  it('returns the single segment when no hyphens', () => {
    expect(parseCarSlug('42')).toBe('42')
  })
})
