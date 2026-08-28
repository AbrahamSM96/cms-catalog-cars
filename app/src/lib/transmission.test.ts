import { describe, expect, it } from 'vitest'

import { detectTransmission } from './transmission'

describe('detectTransmission', () => {
  it('detects AUTOMATICO', () => {
    expect(
      detectTransmission('3.6L RUBICON 4WD AA EE VP AUTOMATICO SUV 6 CIL 3 P')
    ).toBe('automatic')
  })

  it('detects ESTANDAR as manual', () => {
    expect(
      detectTransmission('2.0L EX AA EE CD BA ESTANDAR HATCHBACK 4 CIL 5 P')
    ).toBe('manual')
  })

  it('detects brand-specific automatic gearboxes', () => {
    expect(detectTransmission('S AA EE CD BA QC VP TIPTRONIC SUV 6 CIL')).toBe(
      'automatic'
    )
    expect(detectTransmission('1.4 XCELLENCE AA EE CD BA VP DSG SEDAN')).toBe(
      'automatic'
    )
    expect(detectTransmission('2.5 PRIVILEGE AA EE CD BA QC VP CVT SUV')).toBe(
      'automatic'
    )
    expect(
      detectTransmission('1.4L TFSI 35 DYNAMIC AA EE CD BA S TRONIC')
    ).toBe('automatic')
    expect(
      detectTransmission('200 CGI SPORT 2.0 AA EE VP G-TRONIC SEDAN')
    ).toBe('automatic')
    expect(detectTransmission('LIMITED AA EE CD BA VP AUTOSTICK SUV')).toBe(
      'automatic'
    )
    expect(detectTransmission('5.3L A MP3 AA EE CD BA HYDRAMATIC SUV')).toBe(
      'automatic'
    )
  })

  it('detects short abbreviations as whole words', () => {
    expect(detectTransmission('CARRERA 3.4L AA EE CD STD COUPE')).toBe('manual')
    expect(detectTransmission('BASE AA EE CD AT SEDAN')).toBe('automatic')
  })

  it('does not match abbreviations inside unrelated words', () => {
    expect(
      detectTransmission('5.7 SUMMIT PLATINUM AA EE CD BA QC VP SUV 8 CIL')
    ).toBeNull()
  })

  it('prefers manual when both hints appear', () => {
    expect(detectTransmission('SPORT MANUAL AUTOMATICO')).toBe('manual')
  })

  it('returns null when no transmission is present', () => {
    expect(
      detectTransmission('2.0L TFSI DYNAMIC AA EE CD BA QC VP  SEDAN 4 CIL')
    ).toBeNull()
  })

  it('returns null for empty or undefined input', () => {
    expect(detectTransmission('')).toBeNull()
    expect(detectTransmission(undefined)).toBeNull()
  })
})
