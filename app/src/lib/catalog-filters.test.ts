import { describe, expect, it } from 'vitest'

import { applyFilter, hasActiveFilters, yearOptions } from './catalog-filters'

describe('applyFilter', () => {
  it('sets a new filter value', () => {
    const params = new URLSearchParams()
    const result = applyFilter(params, 'brand', 'nissan')
    expect(result).toBe('brand=nissan')
  })

  it('deletes filter when value is empty string', () => {
    const params = new URLSearchParams('brand=nissan&status=available')
    const result = applyFilter(params, 'brand', '')
    expect(result).toBe('status=available')
  })

  it('deletes filter when value is "all"', () => {
    const params = new URLSearchParams('brand=nissan')
    const result = applyFilter(params, 'brand', 'all')
    expect(result).toBe('')
  })

  it('replaces existing filter value', () => {
    const params = new URLSearchParams('brand=nissan')
    const result = applyFilter(params, 'brand', 'toyota')
    expect(result).toBe('brand=toyota')
  })

  it('preserves other filters', () => {
    const params = new URLSearchParams('brand=nissan&status=available')
    const result = applyFilter(params, 'transmission', 'automatic')
    expect(result).toContain('brand=nissan')
    expect(result).toContain('status=available')
    expect(result).toContain('transmission=automatic')
  })
})

describe('hasActiveFilters', () => {
  it('returns false for empty params', () => {
    expect(hasActiveFilters(new URLSearchParams())).toBe(false)
  })

  it('returns true when brand is set', () => {
    expect(hasActiveFilters(new URLSearchParams('brand=nissan'))).toBe(true)
  })

  it('returns true when status is set', () => {
    expect(hasActiveFilters(new URLSearchParams('status=available'))).toBe(true)
  })

  it('returns true when transmission is set', () => {
    expect(
      hasActiveFilters(new URLSearchParams('transmission=automatic'))
    ).toBe(true)
  })

  it('returns true when minYear is set', () => {
    expect(hasActiveFilters(new URLSearchParams('minYear=2020'))).toBe(true)
  })

  it('returns true when search is set', () => {
    expect(hasActiveFilters(new URLSearchParams('search=versa'))).toBe(true)
  })

  it('ignores unknown params', () => {
    expect(hasActiveFilters(new URLSearchParams('foo=bar'))).toBe(false)
  })
})

describe('yearOptions', () => {
  it('generates descending years from currentYear to 2016', () => {
    const years = yearOptions(2024)
    expect(years[0]).toBe(2024)
    expect(years[years.length - 1]).toBe(2016)
    expect(years).toHaveLength(9)
  })

  it('returns a single year when currentYear is 2016', () => {
    expect(yearOptions(2016)).toEqual([2016])
  })

  it('generates correct length for 2025', () => {
    expect(yearOptions(2025)).toHaveLength(10)
  })
})
