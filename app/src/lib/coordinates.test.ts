import { describe, expect, it } from 'vitest'

import { validateLatitude, validateLongitude } from './coordinates'

const LAT_ERROR =
  'Latitude must be between -90 and 90 in decimal degrees (e.g. 20.6597).'
const LNG_ERROR =
  'Longitude must be between -180 and 180 in decimal degrees (e.g. -103.3496).'

// ---------------------------------------------------------------------------
// validateLatitude
// ---------------------------------------------------------------------------

describe('validateLatitude', () => {
  it('returns true for null', () => {
    expect(validateLatitude(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(validateLatitude(undefined)).toBe(true)
  })

  it('returns true for zero', () => {
    expect(validateLatitude(0)).toBe(true)
  })

  it('returns true for positive in-range', () => {
    expect(validateLatitude(20.6597)).toBe(true)
  })

  it('returns true for max boundary (90)', () => {
    expect(validateLatitude(90)).toBe(true)
  })

  it('returns true for min boundary (-90)', () => {
    expect(validateLatitude(-90)).toBe(true)
  })

  it('returns error for value above 90', () => {
    expect(validateLatitude(91)).toBe(LAT_ERROR)
  })

  it('returns error for value below -90', () => {
    expect(validateLatitude(-91)).toBe(LAT_ERROR)
  })

  it('returns error for very large value', () => {
    expect(validateLatitude(999)).toBe(LAT_ERROR)
  })
})

// ---------------------------------------------------------------------------
// validateLongitude
// ---------------------------------------------------------------------------

describe('validateLongitude', () => {
  it('returns true for null', () => {
    expect(validateLongitude(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(validateLongitude(undefined)).toBe(true)
  })

  it('returns true for zero', () => {
    expect(validateLongitude(0)).toBe(true)
  })

  it('returns true for negative in-range', () => {
    expect(validateLongitude(-103.3496)).toBe(true)
  })

  it('returns true for max boundary (180)', () => {
    expect(validateLongitude(180)).toBe(true)
  })

  it('returns true for min boundary (-180)', () => {
    expect(validateLongitude(-180)).toBe(true)
  })

  it('returns error for value above 180', () => {
    expect(validateLongitude(181)).toBe(LNG_ERROR)
  })

  it('returns error for value below -180', () => {
    expect(validateLongitude(-181)).toBe(LNG_ERROR)
  })

  it('returns error for very large value', () => {
    expect(validateLongitude(999)).toBe(LNG_ERROR)
  })
})
