import { describe, expect, it } from 'vitest'

import { pickAttribution } from '@/lib/attribution'

describe('pickAttribution', () => {
  it('prefers an attributed cookie over an attributed client record', () => {
    expect(
      pickAttribution({
        client: { landingPath: '/cliente', utmSource: 'facebook' },
        cookie: { landingPath: '/servidor', utmSource: 'tiktok' },
      })
    ).toEqual({ landingPath: '/servidor', utmSource: 'tiktok' })
  })

  it('prefers an attributed client record over a direct cookie', () => {
    expect(
      pickAttribution({
        client: { landingPath: '/cliente', utmSource: 'facebook' },
        cookie: { landingPath: '/servidor' },
      })
    ).toEqual({ landingPath: '/cliente', utmSource: 'facebook' })
  })

  it('inherits a landing path from the other record', () => {
    expect(
      pickAttribution({
        client: { landingPath: '/cliente' },
        cookie: { landingPath: '', utmSource: 'tiktok' },
      })
    ).toEqual({ landingPath: '/cliente', utmSource: 'tiktok' })
  })

  it('returns null when both records are null', () => {
    expect(pickAttribution({ client: null, cookie: null })).toBeNull()
  })
})
