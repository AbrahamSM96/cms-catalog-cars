// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  captureAttribution,
  parseAttribution,
  readAttribution,
} from '@/lib/attribution'

const KEY = 'attribution'

const FROM_AD =
  '?utm_source=facebook&utm_medium=cpc&utm_campaign=seminuevos-octubre' +
  '&utm_content=carrusel-a&fbclid=IwAR2xExample'

beforeEach(() => {
  window.sessionStorage.clear()
})

// ---------------------------------------------------------------------------
// parseAttribution
// ---------------------------------------------------------------------------

describe('parseAttribution', () => {
  it('reads every campaign tag from the landing URL', () => {
    expect(
      parseAttribution({ pathname: '/catalogo/mazda-cx-5', search: FROM_AD })
    ).toEqual({
      fbclid: 'IwAR2xExample',
      landingPath: '/catalogo/mazda-cx-5',
      utmCampaign: 'seminuevos-octubre',
      utmContent: 'carrusel-a',
      utmMedium: 'cpc',
      utmSource: 'facebook',
    })
  })

  it('accepts a query string without the leading question mark', () => {
    expect(
      parseAttribution({ pathname: '/', search: 'utm_source=instagram' })
        .utmSource
    ).toBe('instagram')
  })

  it('leaves missing tags undefined', () => {
    expect(parseAttribution({ pathname: '/', search: '' })).toEqual({
      fbclid: undefined,
      landingPath: '/',
      utmCampaign: undefined,
      utmContent: undefined,
      utmMedium: undefined,
      utmSource: undefined,
    })
  })

  it('treats a whitespace-only tag as missing', () => {
    expect(
      parseAttribution({ pathname: '/', search: '?utm_source=%20%20' })
        .utmSource
    ).toBeUndefined()
  })

  it('trims surrounding whitespace', () => {
    expect(
      parseAttribution({ pathname: '/', search: '?utm_source=%20facebook%20' })
        .utmSource
    ).toBe('facebook')
  })

  it('caps an oversized tag at 512 characters', () => {
    const long = 'a'.repeat(900)
    const parsed = parseAttribution({
      pathname: `/${long}`,
      search: `?utm_campaign=${long}`,
    })

    expect(parsed.utmCampaign).toHaveLength(512)
    expect(parsed.landingPath).toHaveLength(512)
  })
})

// ---------------------------------------------------------------------------
// readAttribution
// ---------------------------------------------------------------------------

describe('readAttribution', () => {
  it('returns null when nothing was captured', () => {
    expect(readAttribution()).toBeNull()
  })

  it('returns the stored record', () => {
    captureAttribution({ pathname: '/', search: '?utm_source=facebook' })

    expect(readAttribution()?.utmSource).toBe('facebook')
  })

  it('returns null on corrupt JSON', () => {
    window.sessionStorage.setItem(KEY, '{not json')

    expect(readAttribution()).toBeNull()
  })

  it('returns null when the stored value is not an object', () => {
    window.sessionStorage.setItem(KEY, '"facebook"')

    expect(readAttribution()).toBeNull()
  })

  it('returns null when the stored value is literal null', () => {
    window.sessionStorage.setItem(KEY, 'null')

    expect(readAttribution()).toBeNull()
  })

  it('returns null when reading storage throws', () => {
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage denied')
    })

    expect(readAttribution()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// captureAttribution
// ---------------------------------------------------------------------------

describe('captureAttribution', () => {
  it('stores the first landing of the session', () => {
    captureAttribution({ pathname: '/catalogo', search: FROM_AD })

    expect(readAttribution()).toMatchObject({
      landingPath: '/catalogo',
      utmCampaign: 'seminuevos-octubre',
    })
  })

  it('keeps the first landing when a later one also names a campaign', () => {
    captureAttribution({ pathname: '/catalogo', search: FROM_AD })
    captureAttribution({ pathname: '/contacto', search: '?utm_source=tiktok' })

    expect(readAttribution()?.utmSource).toBe('facebook')
  })

  it('keeps the first landing when a later one names no campaign', () => {
    captureAttribution({ pathname: '/catalogo', search: FROM_AD })
    captureAttribution({ pathname: '/contacto', search: '' })

    expect(readAttribution()).toMatchObject({
      landingPath: '/catalogo',
      utmSource: 'facebook',
    })
  })

  it('keeps the first landing when neither names a campaign', () => {
    captureAttribution({ pathname: '/', search: '' })
    captureAttribution({ pathname: '/contacto', search: '' })

    expect(readAttribution()?.landingPath).toBe('/')
  })

  // The case the "first touch wins" rule has to bend for: the visit starts
  // organically, so the stored record says "direct", and the ad click that
  // follows is the one that actually produced the lead.
  it('upgrades a direct visit to the campaign that follows it', () => {
    captureAttribution({ pathname: '/', search: '' })
    captureAttribution({ pathname: '/catalogo', search: FROM_AD })

    expect(readAttribution()).toMatchObject({
      landingPath: '/catalogo',
      utmSource: 'facebook',
    })
  })

  it('upgrades a direct visit on an fbclid alone', () => {
    captureAttribution({ pathname: '/', search: '' })
    captureAttribution({ pathname: '/catalogo', search: '?fbclid=IwAR2x' })

    expect(readAttribution()?.fbclid).toBe('IwAR2x')
  })

  it('does not throw when writing to storage is denied', () => {
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage denied')
    })

    expect(() =>
      captureAttribution({ pathname: '/', search: FROM_AD })
    ).not.toThrow()
  })
})
