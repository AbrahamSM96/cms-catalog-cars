import { describe, expect, it } from 'vitest'

import { isValidVin, modelYearFromVin, normalizeVin, squishVin } from './vin'

// Real, checksum-valid VINs used across the suite.
const HONDA_ACCORD_2003 = '1HGCM82633A004352'
const ACURA_2012 = 'JH4TB2H26CC000000'
const VW_JETTA_MX_2013 = '3VWDX7AJ1DM389728'

describe('normalizeVin', () => {
  it('upper-cases and strips the separators people paste along with the VIN', () => {
    expect(normalizeVin(' 1hgcm8263-3a004352 ')).toBe(HONDA_ACCORD_2003)
  })
})

describe('isValidVin', () => {
  it('accepts VINs whose check digit matches', () => {
    expect(isValidVin(HONDA_ACCORD_2003)).toBe(true)
    expect(isValidVin(ACURA_2012)).toBe(true)
    expect(isValidVin(VW_JETTA_MX_2013)).toBe(true)
  })

  it('normalizes before validating', () => {
    expect(isValidVin('1hgcm82633a004352')).toBe(true)
  })

  it('rejects a wrong length', () => {
    expect(isValidVin('1HGCM82633A00435')).toBe(false)
  })

  it('rejects I, O and Q, which are not part of the VIN alphabet', () => {
    expect(isValidVin('1HGCM8263IA004352')).toBe(false)
  })

  it('rejects a single mistyped character', () => {
    expect(isValidVin('1HGCM82633A004353')).toBe(false)
  })

  it('accepts X as the check digit when the remainder is 10', () => {
    expect(isValidVin('1HGCM826X0A004313')).toBe(true)
  })
})

describe('squishVin', () => {
  it('keeps positions 1-8, 10 and 11 — the ones that decode', () => {
    expect(squishVin(VW_JETTA_MX_2013)).toBe('3VWDX7AJDM')
  })

  it('collapses two units of the same model, year and plant onto one key', () => {
    expect(squishVin('3VWDX7AJ3DM389729')).toBe(squishVin(VW_JETTA_MX_2013))
  })

  it('normalizes before slicing', () => {
    expect(squishVin('3vwdx7aj1dm389728')).toBe('3VWDX7AJDM')
  })
})

describe('modelYearFromVin', () => {
  it('reads the current 30-year cycle when position 7 holds a letter', () => {
    expect(modelYearFromVin(ACURA_2012)).toBe(2012)
    expect(modelYearFromVin(VW_JETTA_MX_2013)).toBe(2013)
  })

  it('reads the previous cycle when position 7 holds a digit', () => {
    expect(modelYearFromVin(HONDA_ACCORD_2003)).toBe(2003)
  })

  it('returns null for a character that is not a year code', () => {
    expect(modelYearFromVin('1HGCM82630A004352')).toBeNull()
  })

  it('returns null when the string is too short to reach position 10', () => {
    expect(modelYearFromVin('1HGCM8263')).toBeNull()
  })
})
