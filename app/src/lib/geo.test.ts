import { describe, expect, it } from 'vitest'

import { normalizeCoords } from './geo'

describe('normalizeCoords', () => {
  it('returns valid coordinates', () => {
    expect(normalizeCoords(19.4326, -99.1332)).toEqual({
      lat: 19.4326,
      lng: -99.1332,
    })
  })

  it('returns null when latitude is not a number', () => {
    expect(normalizeCoords(null, -99.1332)).toBeNull()
  })

  it('returns null when longitude is not a number', () => {
    expect(normalizeCoords(19.4326, undefined)).toBeNull()
  })

  it('returns null for NaN latitude', () => {
    expect(normalizeCoords(Number.NaN, -99.1332)).toBeNull()
  })

  it('returns null for Infinity longitude', () => {
    expect(normalizeCoords(19.4326, Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('swaps lat/lng when they are inverted', () => {
    // -99.1332 as lat is out of range, but as lng it's valid;
    // 19.4326 as lng is valid, and as lat it's valid.
    expect(normalizeCoords(-99.1332, 19.4326)).toEqual({
      lat: 19.4326,
      lng: -99.1332,
    })
  })

  it('returns null when both are out of range even after swap', () => {
    expect(normalizeCoords(200, 300)).toBeNull()
  })

  it('accepts boundary values', () => {
    expect(normalizeCoords(-90, -180)).toEqual({ lat: -90, lng: -180 })
    expect(normalizeCoords(90, 180)).toEqual({ lat: 90, lng: 180 })
  })

  it('handles undefined arguments', () => {
    expect(normalizeCoords(undefined, undefined)).toBeNull()
  })
})
