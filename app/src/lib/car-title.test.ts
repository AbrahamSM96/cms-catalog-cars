import { describe, expect, it, vi } from 'vitest'

import { buildCarTitle, resolveBrandName, toTitleCase } from './car-title'

// ---------------------------------------------------------------------------
// toTitleCase
// ---------------------------------------------------------------------------

describe('toTitleCase', () => {
  it('capitalizes each word', () => {
    expect(toTitleCase('versa advance')).toBe('Versa Advance')
  })

  it('handles single word', () => {
    expect(toTitleCase('versa')).toBe('Versa')
  })

  it('handles already capitalized', () => {
    expect(toTitleCase('Versa Advance')).toBe('Versa Advance')
  })

  it('lowercases the rest of each word', () => {
    expect(toTitleCase('vERSA aDVANCE')).toBe('Versa Advance')
  })

  it('returns undefined for undefined input', () => {
    expect(toTitleCase(undefined)).toBeUndefined()
  })

  it('returns empty string for empty string', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('handles multiple spaces between words', () => {
    expect(toTitleCase('versa  advance')).toBe('Versa  Advance')
  })
})

// ---------------------------------------------------------------------------
// resolveBrandName
// ---------------------------------------------------------------------------

describe('resolveBrandName', () => {
  it('returns name when brandRef is an object with name', async () => {
    const result = await resolveBrandName({ name: 'Nissan' }, {} as never)
    expect(result).toBe('Nissan')
  })

  it('calls findByID when brandRef is a string id', async () => {
    const findByID = vi.fn().mockResolvedValue({ name: 'Toyota' })
    const result = await resolveBrandName('abc123', { findByID } as never)
    expect(result).toBe('Toyota')
    expect(findByID).toHaveBeenCalledWith({
      collection: 'brands',
      depth: 0,
      id: 'abc123',
    })
  })

  it('returns empty string when findByID rejects', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'))
    const result = await resolveBrandName('bad-id', { findByID } as never)
    expect(result).toBe('')
  })

  it('returns empty string when brandRef is null', async () => {
    const result = await resolveBrandName(null, {} as never)
    expect(result).toBe('')
  })

  it('returns empty string when brandRef is undefined', async () => {
    const result = await resolveBrandName(undefined, {} as never)
    expect(result).toBe('')
  })

  it('returns empty string when brandRef is an object without name', async () => {
    const result = await resolveBrandName({ id: 1 }, {} as never)
    expect(result).toBe('')
  })

  it('returns empty string when brand object has a null name', async () => {
    const result = await resolveBrandName({ name: null }, {} as never)
    expect(result).toBe('')
  })

  it('returns empty string when findByID resolves without a name', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 7 })
    const result = await resolveBrandName(7, { findByID } as never)
    expect(result).toBe('')
  })

  it('calls findByID when brandRef is a numeric id', async () => {
    const findByID = vi.fn().mockResolvedValue({ name: 'Honda' })
    const result = await resolveBrandName(42, { findByID } as never)
    expect(result).toBe('Honda')
    expect(findByID).toHaveBeenCalledWith({
      collection: 'brands',
      depth: 0,
      id: 42,
    })
  })
})

// ---------------------------------------------------------------------------
// buildCarTitle
// ---------------------------------------------------------------------------

describe('buildCarTitle', () => {
  it('builds title from brand object', async () => {
    const result = await buildCarTitle({
      brand: { name: 'Nissan' },
      model: 'Versa',
      payload: {} as never,
      year: 2021,
    })
    expect(result).toBe('Nissan Versa 2021')
  })

  it('builds title from brand id via findByID', async () => {
    const findByID = vi.fn().mockResolvedValue({ name: 'Toyota' })
    const result = await buildCarTitle({
      brand: 'abc',
      model: 'Corolla',
      payload: { findByID } as never,
      year: 2022,
    })
    expect(result).toBe('Toyota Corolla 2022')
  })

  it('omits missing parts', async () => {
    const result = await buildCarTitle({
      brand: { name: 'Nissan' },
      model: undefined,
      payload: {} as never,
      year: undefined,
    })
    expect(result).toBe('Nissan')
  })

  it('returns empty string when everything is missing', async () => {
    const result = await buildCarTitle({
      payload: {} as never,
    })
    expect(result).toBe('')
  })

  it('handles brand resolution failure gracefully', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('fail'))
    const result = await buildCarTitle({
      brand: 'missing',
      model: 'X',
      payload: { findByID } as never,
      year: 2020,
    })
    expect(result).toBe('X 2020')
  })
})
