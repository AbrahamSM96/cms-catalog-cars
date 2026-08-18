import { describe, expect, it } from 'vitest'

import type { Car } from '../types/car'

import { buildCarImageAlt, getImageUrl } from './images'

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

  it('builds Cloudinary URL from filename', () => {
    const result = getImageUrl('photo.jpg')
    expect(result).toContain('res.cloudinary.com')
    expect(result).toContain('cms-cars/photo')
    expect(result).toMatch(
      /^https:\/\/res\.cloudinary\.com\/.+\/image\/upload\/cms-cars\/photo$/
    )
  })

  it('uses NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME when set', () => {
    const original = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'mycloud'
    try {
      expect(getImageUrl('test.png')).toContain('res.cloudinary.com/mycloud/')
    } finally {
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = original
    }
  })

  it('falls back to default cloud name when env is empty', () => {
    const original = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = ''
    try {
      expect(getImageUrl('test.png')).toContain('res.cloudinary.com/dchfrwaei/')
    } finally {
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = original
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
      location: { city: 'Guadalajara' },
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
      location: { city: '  ' },
    })
    expect(buildCarImageAlt(car)).toBe('Nissan Versa Advance 2021')
  })
})
