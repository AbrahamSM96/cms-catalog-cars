import { describe, expect, it } from 'vitest'

import { isBrandColor, safeBrandColor, validateBrandColor } from './brand-color'

const COLOR_ERROR = 'Use a hex color, e.g. #dc2626.'
const COLOR_ERROR_ES = 'Usa un color hexadecimal, ej. #dc2626.'
const ES = { req: { i18n: { language: 'es' } } }
const FALLBACK = '#276CF5'

/** The payload that made this module necessary: it closes the `<style>` tag. */
const BREAKOUT = '#dc2626}</style><script>alert(1)</script><style>{'

// ---------------------------------------------------------------------------
// isBrandColor
// ---------------------------------------------------------------------------

describe('isBrandColor', () => {
  it('accepts six-digit hex', () => {
    expect(isBrandColor('#dc2626')).toBe(true)
  })

  it('accepts shorthand hex', () => {
    expect(isBrandColor('#fff')).toBe(true)
  })

  it('accepts hex with alpha', () => {
    expect(isBrandColor('#dc262680')).toBe(true)
  })

  it('accepts uppercase hex', () => {
    expect(isBrandColor('#DC2626')).toBe(true)
  })

  it('ignores surrounding whitespace', () => {
    expect(isBrandColor('  #dc2626  ')).toBe(true)
  })

  it('rejects a value that closes the style tag', () => {
    expect(isBrandColor(BREAKOUT)).toBe(false)
  })

  it('rejects a CSS declaration smuggled after the colour', () => {
    expect(isBrandColor('#dc2626;background:url(https://evil.tld/x)')).toBe(
      false
    )
  })

  it('rejects functional colour notation', () => {
    expect(isBrandColor('rgb(220, 38, 38)')).toBe(false)
  })

  it('rejects a named colour', () => {
    expect(isBrandColor('red')).toBe(false)
  })

  it('rejects hex without the hash', () => {
    expect(isBrandColor('dc2626')).toBe(false)
  })

  it('rejects a hex of the wrong length', () => {
    expect(isBrandColor('#dc262')).toBe(false)
  })

  it('rejects non-hex characters', () => {
    expect(isBrandColor('#gggggg')).toBe(false)
  })

  it('rejects the empty string', () => {
    expect(isBrandColor('')).toBe(false)
  })

  it('rejects null', () => {
    expect(isBrandColor(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isBrandColor(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// safeBrandColor
// ---------------------------------------------------------------------------

describe('safeBrandColor', () => {
  it('returns a valid colour', () => {
    expect(safeBrandColor('#dc2626', FALLBACK)).toBe('#dc2626')
  })

  it('trims a valid colour', () => {
    expect(safeBrandColor(' #dc2626 ', FALLBACK)).toBe('#dc2626')
  })

  it('falls back on a breakout payload', () => {
    expect(safeBrandColor(BREAKOUT, FALLBACK)).toBe(FALLBACK)
  })

  it('falls back on an empty value', () => {
    expect(safeBrandColor('', FALLBACK)).toBe(FALLBACK)
  })

  it('falls back on null', () => {
    expect(safeBrandColor(null, FALLBACK)).toBe(FALLBACK)
  })

  it('falls back on undefined', () => {
    expect(safeBrandColor(undefined, FALLBACK)).toBe(FALLBACK)
  })
})

// ---------------------------------------------------------------------------
// validateBrandColor
// ---------------------------------------------------------------------------

describe('validateBrandColor', () => {
  it('returns true for a valid colour', () => {
    expect(validateBrandColor('#dc2626')).toBe(true)
  })

  it('returns true for an empty value, since the field is optional', () => {
    expect(validateBrandColor('')).toBe(true)
  })

  it('returns true for null', () => {
    expect(validateBrandColor(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(validateBrandColor(undefined)).toBe(true)
  })

  it('returns the error message for a breakout payload', () => {
    expect(validateBrandColor(BREAKOUT)).toBe(COLOR_ERROR)
  })

  it('returns the error message for a named colour', () => {
    expect(validateBrandColor('red')).toBe(COLOR_ERROR)
  })

  it('returns the Spanish error message', () => {
    expect(validateBrandColor('red', ES)).toBe(COLOR_ERROR_ES)
  })
})
