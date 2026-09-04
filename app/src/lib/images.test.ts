import { describe, expect, it } from 'vitest'

import type { Car, Dealership } from '../types/car'

import { buildCarImageAlt, getImageUrl } from './images'

/**
 * Dealership fixture holding a city, which is where a car's city comes from.
 *
 * @param cityName - name of the city the dealership sits in.
 */
function makeDealership(cityName: string): Dealership {
  return {
    address: {
      city: { id: 1, name: cityName, slug: 'ciudad', state: 'Jalisco' },
    },
    createdAt: '',
    id: 1,
    name: 'AutoGDL',
    updatedAt: '',
  }
}

/**
 * Minimal car fixture.
 *
 * @param overrides - partial overrides merged into defaults.
 */
function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    brand: 'Nissan',
    createdAt: '',
    id: 1,
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

describe('getImageUrl', () => {
  it('returns placeholder when filename is undefined', () => {
    expect(getImageUrl(undefined)).toBe('/placeholder-car.svg')
  })

  it('returns placeholder when filename is empty', () => {
    expect(getImageUrl('')).toBe('/placeholder-car.svg')
  })

  it('passes through http URLs unchanged', () => {
    const url = 'https://example.com/image.jpg'
    expect(getImageUrl(url)).toBe(url)
  })

  it('builds R2 public URL from filename (prefixed, extension kept)', () => {
    const original = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://cdn.example.com'
    try {
      expect(getImageUrl('photo.jpg')).toBe(
        'https://cdn.example.com/cms-cars/photo.jpg'
      )
    } finally {
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL = original
    }
  })

  it('trims a trailing slash from the public base URL', () => {
    const original = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://cdn.example.com/'
    try {
      expect(getImageUrl('test.png')).toBe(
        'https://cdn.example.com/cms-cars/test.png'
      )
    } finally {
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL = original
    }
  })
})

describe('buildCarImageAlt', () => {
  it('builds alt with brand object', () => {
    const car = makeCar({
      brand: { id: 1, name: 'Nissan', slug: 'nissan' },
    })
    expect(buildCarImageAlt(car)).toBe('Nissan Versa Advance 2021')
  })

  it('builds alt with brand as string', () => {
    const car = makeCar({ brand: 'Nissan' })
    expect(buildCarImageAlt(car)).toBe('Versa Advance 2021')
  })

  it('includes city when present', () => {
    const car = makeCar({
      brand: { id: 1, name: 'Nissan', slug: 'nissan' },
      dealership: makeDealership('Guadalajara'),
    })
    expect(buildCarImageAlt(car)).toBe(
      'Nissan Versa Advance 2021 en Guadalajara'
    )
  })

  it('skips missing parts', () => {
    const car = makeCar({
      brand: { id: 1, name: 'Nissan', slug: 'nissan' },
      version: '',
    })
    expect(buildCarImageAlt(car)).toBe('Nissan Versa 2021')
  })

  it('handles brand as empty string', () => {
    const car = makeCar({ brand: '' })
    expect(buildCarImageAlt(car)).toBe('Versa Advance 2021')
  })

  it('trims whitespace from city', () => {
    const car = makeCar({
      brand: { id: 1, name: 'Nissan', slug: 'nissan' },
      dealership: makeDealership('  '),
    })
    expect(buildCarImageAlt(car)).toBe('Nissan Versa Advance 2021')
  })
})
