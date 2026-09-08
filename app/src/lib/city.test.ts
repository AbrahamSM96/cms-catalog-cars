import { describe, expect, it } from 'vitest'

import type { Car, City, Dealership } from '../types/car'

import { carCity, dealershipCity, formatCity } from './city'

const CITY: City = {
  id: 1,
  name: 'Pachuca',
  slug: 'pachuca',
  state: 'Hidalgo',
}

/**
 * Build a dealership, overriding only what a test cares about.
 *
 * @param overrides - Fields to replace on the default document.
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

/**
 * Build a car, overriding only what a test cares about.
 *
 * @param overrides - Fields to replace on the default document.
 */
function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    brand: 'nissan',
    createdAt: '',
    id: 1,
    model: 'Versa',
    price: 250000,
    status: 'available',
    transmission: 'automatic',
    updatedAt: '',
    version: 'Sense',
    year: 2020,
    ...overrides,
  }
}

describe('dealershipCity', () => {
  it('returns the city when the relation was populated', () => {
    const dealer = makeDealer({ address: { city: CITY } })
    expect(dealershipCity(dealer)).toEqual(CITY)
  })

  it('returns null for an unpopulated relation (a bare id)', () => {
    const dealer = makeDealer({ address: { city: 7 } })
    expect(dealershipCity(dealer)).toBeNull()
  })

  it('returns null when the dealership has no address', () => {
    expect(dealershipCity(makeDealer())).toBeNull()
  })

  it('returns null when the address carries no city', () => {
    const dealer = makeDealer({ address: { line1: 'Av. Juárez 100' } })
    expect(dealershipCity(dealer)).toBeNull()
  })

  it('returns null when the dealership itself is an id', () => {
    expect(dealershipCity(3)).toBeNull()
    expect(dealershipCity('3')).toBeNull()
  })

  it('returns null for a missing dealership', () => {
    expect(dealershipCity(null)).toBeNull()
    expect(dealershipCity(undefined)).toBeNull()
  })
})

describe('carCity', () => {
  it('reads the city off the car dealership', () => {
    const car = makeCar({ dealership: makeDealer({ address: { city: CITY } }) })
    expect(carCity(car)).toEqual(CITY)
  })

  it('returns null when the car has no dealership', () => {
    expect(carCity(makeCar())).toBeNull()
  })
})

describe('formatCity', () => {
  it('joins name and state', () => {
    expect(formatCity(CITY)).toBe('Pachuca, Hidalgo')
  })

  it('returns an empty string for an unresolved city', () => {
    expect(formatCity(null)).toBe('')
  })

  it('drops the empty half instead of leaving a dangling comma', () => {
    expect(formatCity({ ...CITY, state: '' })).toBe('Pachuca')
  })
})
