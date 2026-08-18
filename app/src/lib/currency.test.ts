import { describe, expect, it } from 'vitest'

import { formatPriceMXN } from './currency'

describe('formatPriceMXN', () => {
  it('formats an integer price', () => {
    expect(formatPriceMXN(250000)).toBe('$250,000')
  })

  it('formats zero', () => {
    expect(formatPriceMXN(0)).toBe('$0')
  })

  it('formats a negative price', () => {
    expect(formatPriceMXN(-5000)).toBe('-$5,000')
  })

  it('has no decimal places', () => {
    const result = formatPriceMXN(123456.78)
    expect(result).not.toContain('.')
    expect(result).toBe('$123,457')
  })

  it('uses es-MX locale formatting', () => {
    expect(formatPriceMXN(1000000)).toBe('$1,000,000')
  })
})
