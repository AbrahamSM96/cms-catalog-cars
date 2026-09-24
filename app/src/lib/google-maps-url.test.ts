import { describe, expect, it, vi } from 'vitest'

import {
  isShortMapsUrl,
  parseCoordinatesFromMapsUrl,
  resolveCoordinatesFromMapsUrl,
} from './google-maps-url'

const LONG_URL =
  'https://www.google.com/maps/place/Seminuevos/@20.6597,-103.3496,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d20.6601!4d-103.3502'

/**
 * Build a fetch stub that answers each call with the next redirect in the
 * chain, then with a plain `200`.
 *
 * @param locations - `Location` headers to hand out, in order.
 */
function fetchStub(...locations: string[]): typeof fetch {
  const chain = [...locations]

  return (async () => {
    const location = chain.shift()

    return location
      ? new Response('', { headers: { location }, status: 302 })
      : new Response('')
  }) as typeof fetch
}

// ---------------------------------------------------------------------------
// parseCoordinatesFromMapsUrl
// ---------------------------------------------------------------------------

describe('parseCoordinatesFromMapsUrl', () => {
  it('prefers the place pin over the map centre', () => {
    expect(parseCoordinatesFromMapsUrl(LONG_URL)).toEqual({
      latitude: 20.6601,
      longitude: -103.3502,
    })
  })

  it('falls back to the map centre', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/@20.6597,-103.3496,17z'
      )
    ).toEqual({ latitude: 20.6597, longitude: -103.3496 })
  })

  it('reads the q parameter', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://maps.google.com/?q=20.6597,-103.3496'
      )
    ).toEqual({ latitude: 20.6597, longitude: -103.3496 })
  })

  it('reads the query parameter of the search API', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/search/?api=1&query=20.6597%2C-103.3496'
      )
    ).toEqual({ latitude: 20.6597, longitude: -103.3496 })
  })

  it('reads a pair written into the path', () => {
    // What a short link resolves to when the place was shared as a plain
    // coordinate: the pair sits in the path and the space is escaped as `+`.
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/search/20.115238,+-98.747789?entry=tts'
      )
    ).toEqual({ latitude: 20.115238, longitude: -98.747789 })
  })

  it('reads a path pair escaped as %20', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/place/20.115238,%20-98.747789'
      )
    ).toEqual({ latitude: 20.115238, longitude: -98.747789 })
  })

  it('returns null for a link without coordinates', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/search/seminuevos+guadalajara'
      )
    ).toBeNull()
  })

  it('skips a coordinate parameter that is not a pair', () => {
    // `center` is read before `q`, and Google fills it with a place name on a
    // shared link — the scan has to keep going instead of giving up there.
    expect(
      parseCoordinatesFromMapsUrl(
        'https://maps.google.com/?center=Guadalajara&q=20.6597,-103.3496'
      )
    ).toEqual({ latitude: 20.6597, longitude: -103.3496 })
  })

  it('falls back to the map centre when the pin is out of range', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/place/Seminuevos/@20.6597,-103.3496,17z/data=!8m2!3d999!4d-103.3502'
      )
    ).toEqual({ latitude: 20.6597, longitude: -103.3496 })
  })

  it('returns null for out-of-range values', () => {
    expect(
      parseCoordinatesFromMapsUrl('https://www.google.com/maps/@200,-103.3496')
    ).toBeNull()
  })

  it('returns null for a short link', () => {
    expect(
      parseCoordinatesFromMapsUrl('https://maps.app.goo.gl/abc123')
    ).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isShortMapsUrl
// ---------------------------------------------------------------------------

describe('isShortMapsUrl', () => {
  it('detects maps.app.goo.gl links', () => {
    expect(isShortMapsUrl('https://maps.app.goo.gl/abc123')).toBe(true)
  })

  it('rejects long links', () => {
    expect(isShortMapsUrl(LONG_URL)).toBe(false)
  })

  it('rejects garbage', () => {
    expect(isShortMapsUrl('not a url')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// resolveCoordinatesFromMapsUrl
// ---------------------------------------------------------------------------

describe('resolveCoordinatesFromMapsUrl', () => {
  it('parses a long link without hitting the network', async () => {
    const fetchImpl = vi.fn()

    await expect(
      resolveCoordinatesFromMapsUrl(
        LONG_URL,
        fetchImpl as unknown as typeof fetch
      )
    ).resolves.toEqual({ latitude: 20.6601, longitude: -103.3502 })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('follows a short link and parses the destination', async () => {
    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://maps.app.goo.gl/abc123',
        fetchStub(LONG_URL)
      )
    ).resolves.toEqual({ latitude: 20.6601, longitude: -103.3502 })
  })

  it('follows more than one hop', async () => {
    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://goo.gl/maps/abc123',
        fetchStub('https://maps.app.goo.gl/abc123', LONG_URL)
      )
    ).resolves.toEqual({ latitude: 20.6601, longitude: -103.3502 })
  })

  it('returns null when the chain never reaches a place', async () => {
    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://maps.app.goo.gl/abc123',
        fetchStub('https://www.google.com/maps/search/seminuevos')
      )
    ).resolves.toBeNull()
  })

  it('returns null when the short link does not redirect', async () => {
    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://maps.app.goo.gl/abc123',
        fetchStub()
      )
    ).resolves.toBeNull()
  })

  it('returns null when the request fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline')
    })

    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://maps.app.goo.gl/abc123',
        fetchImpl as unknown as typeof fetch
      )
    ).resolves.toBeNull()
  })

  it('returns null for an empty link', async () => {
    await expect(resolveCoordinatesFromMapsUrl('   ')).resolves.toBeNull()
  })

  it('never calls out for a long link with no coordinates', async () => {
    const fetchImpl = vi.fn()

    await expect(
      resolveCoordinatesFromMapsUrl(
        'https://www.google.com/maps/search/seminuevos+guadalajara',
        fetchImpl as unknown as typeof fetch
      )
    ).resolves.toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
