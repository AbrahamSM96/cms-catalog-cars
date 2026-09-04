import { describe, expect, it } from 'vitest'

import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Pachuca de Soto')).toBe('pachuca-de-soto')
  })

  it('strips accents so "México" and "Mexico" collide on purpose', () => {
    expect(slugify('México')).toBe('mexico')
    expect(slugify('Mérida')).toBe('merida')
  })

  it('collapses runs of separators into a single hyphen', () => {
    expect(slugify('San  Luis / Potosí')).toBe('san-luis-potosi')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  Pachuca  ')).toBe('pachuca')
    expect(slugify('-Pachuca-')).toBe('pachuca')
  })

  it('normalises the spellings a city name arrives in', () => {
    // The reason the CMS stores a slug at all: these must be one city, not
    // three landing pages.
    expect(slugify('Pachuca')).toBe(slugify('pachuca'))
    expect(slugify('PACHUCA ')).toBe(slugify('Pachuca'))
  })

  it('accepts numbers', () => {
    expect(slugify(2024)).toBe('2024')
  })

  it('returns an empty string for nothing to slug', () => {
    expect(slugify(undefined)).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify('')).toBe('')
    expect(slugify('!!!')).toBe('')
  })
})
