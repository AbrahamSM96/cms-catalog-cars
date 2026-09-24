import { describe, expect, it } from 'vitest'

import { buildLeadData } from '@/lib/leads'

describe('buildLeadData', () => {
  it('carries the car and the whole attribution through', () => {
    expect(
      buildLeadData({
        attribution: {
          fbclid: 'IwAR2x',
          landingPath: '/catalogo',
          utmCampaign: 'seminuevos-octubre',
          utmContent: 'carrusel-a',
          utmMedium: 'cpc',
          utmSource: 'facebook',
        },
        carId: 42,
        placement: 'car-detail',
        source: 'whatsapp',
      })
    ).toEqual({
      car: 42,
      fbclid: 'IwAR2x',
      landingPath: '/catalogo',
      placement: 'car-detail',
      source: 'whatsapp',
      status: 'new',
      utmCampaign: 'seminuevos-octubre',
      utmContent: 'carrusel-a',
      utmMedium: 'cpc',
      utmSource: 'facebook',
    })
  })

  it('nulls every unknown when there is no attribution and no car', () => {
    expect(buildLeadData({ placement: 'footer', source: 'phone' })).toEqual({
      car: null,
      fbclid: null,
      landingPath: null,
      placement: 'footer',
      source: 'phone',
      status: 'new',
      utmCampaign: null,
      utmContent: null,
      utmMedium: null,
      utmSource: null,
    })
  })

  it('nulls the campaign tags of a visit that carried none', () => {
    const data = buildLeadData({
      attribution: { landingPath: '/' },
      placement: 'navbar',
      source: 'whatsapp',
    })

    expect(data.landingPath).toBe('/')
    expect(data.utmSource).toBeNull()
    expect(data.fbclid).toBeNull()
  })

  it('coerces a string car id to the number the relationship expects', () => {
    expect(
      buildLeadData({
        carId: '42',
        placement: 'car-detail',
        source: 'whatsapp',
      }).car
    ).toBe(42)
  })

  it('drops a car id that is not a number', () => {
    expect(
      buildLeadData({
        carId: 'abc',
        placement: 'car-detail',
        source: 'whatsapp',
      }).car
    ).toBeNull()
  })
})
