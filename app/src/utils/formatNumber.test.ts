import { describe, expect, it } from 'vitest'

import { formatMileage, formatNumber, formatPrice } from './formatNumber'

describe('formatNumber', () => {
  it('formats a number with separators', () => {
    expect(formatNumber(25000)).toBe('25,000')
  })

  it('returns "0" for undefined', () => {
    expect(formatNumber(undefined)).toBe('0')
  })

  it('returns "0" for null', () => {
    expect(formatNumber(null)).toBe('0')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatPrice', () => {
  it('formats with default currency symbol', () => {
    expect(formatPrice(25000)).toBe('$25,000')
  })

  it('returns "$0" for undefined', () => {
    expect(formatPrice(undefined)).toBe('$0')
  })

  it('returns "$0" for null', () => {
    expect(formatPrice(null)).toBe('$0')
  })

  it('uses custom currency symbol', () => {
    expect(formatPrice(25000, 'MX$')).toBe('MX$25,000')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })
})

describe('formatMileage', () => {
  it('formats with default unit', () => {
    expect(formatMileage(150000)).toBe('150,000 km')
  })

  it('returns "0 km" for undefined', () => {
    expect(formatMileage(undefined)).toBe('0 km')
  })

  it('returns "0 km" for null', () => {
    expect(formatMileage(null)).toBe('0 km')
  })

  it('uses custom unit', () => {
    expect(formatMileage(150000, 'mi')).toBe('150,000 mi')
  })

  it('formats zero', () => {
    expect(formatMileage(0)).toBe('0 km')
  })
})
