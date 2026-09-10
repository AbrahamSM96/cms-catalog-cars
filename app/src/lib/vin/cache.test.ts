import type {
  DecodedVin,
  DecodeOutcome,
  VinCacheStore,
  VinDecoder,
} from './types'

import { describe, expect, it, vi } from 'vitest'

import { MEMORY_CACHE_MAX, withMemoryCache, withStoreCache } from './cache'

// Same model, year and plant; different serial number. They share a squish VIN
// and therefore decode identically.
const JETTA_UNIT_A = '3VWDX7AJ1DM389728'
const JETTA_UNIT_B = '3VWDX7AJ3DM389729'
const ACCORD = '1HGCM82633A004352'
const MISTYPED_JETTA = '3VWDX7AJ2DM389728'

const JETTA: DecodedVin = {
  abs: null,
  adaptiveCruiseControl: null,
  airBagLocCurtain: null,
  airBagLocFront: null,
  airBagLocKnee: null,
  airBagLocSide: null,
  blindSpotMonitor: null,
  bodyClass: 'Sedan/Saloon',
  displacementL: 2.48,
  doors: 4,
  driveType: null,
  electrificationLevel: null,
  engineConfiguration: null,
  engineCylinders: 5,
  engineHp: 170,
  esc: null,
  forwardCollisionWarning: null,
  fuelTypePrimary: 'Gasoline',
  keylessIgnition: null,
  laneDepartureWarning: null,
  make: 'VOLKSWAGEN',
  manufacturer: 'VOLKSWAGEN DE MEXICO SA DE CV',
  model: 'Jetta',
  modelYear: 2013,
  parkAssist: null,
  plantCountry: 'MEXICO',
  rearVisibilitySystem: null,
  series: null,
  transmissionSpeeds: null,
  transmissionStyle: 'Automatic',
  trim: 'Comfortline, Sportline',
  vehicleType: null
}

/**
 * Build a decoder that always succeeds, counting how often it was consulted.
 *
 * @param data - The vehicle every call resolves to.
 */
function countingDecoder(data: DecodedVin): {
  calls: () => number
  decoder: VinDecoder
} {
  const decode = vi.fn(
    (): Promise<DecodeOutcome> =>
      Promise.resolve({ data, ok: true, raw: { Make: data.make }, source: 'network' })
  )
  return { calls: (): number => decode.mock.calls.length, decoder: { decode } }
}

/**
 * Build an in-memory stand-in for the durable store.
 */
function fakeStore(): { entries: Map<string, DecodedVin>; store: VinCacheStore } {
  const entries = new Map<string, DecodedVin>()
  return {
    entries,
    store: {
      /**
       * Read one entry.
       *
       * @param squish - The squish VIN key.
       */
      read: (squish: string): Promise<DecodedVin | null> =>
        Promise.resolve(entries.get(squish) ?? null),
      /**
       * Write one entry.
       *
       * @param props - The entry to store.
       * @param props.decoded - The decoded attributes.
       * @param props.squish - The squish VIN key.
       */
      write: (props: { decoded: DecodedVin; squish: string }): Promise<void> => {
        entries.set(props.squish, props.decoded)
        return Promise.resolve()
      },
    },
  }
}

describe('withMemoryCache', () => {
  it('answers a second unit of the same model, year and plant without a call', async () => {
    const { calls, decoder } = countingDecoder(JETTA)
    const cached = withMemoryCache(decoder, MEMORY_CACHE_MAX)

    const first = await cached.decode(JETTA_UNIT_A)
    const second = await cached.decode(JETTA_UNIT_B)

    expect(first).toMatchObject({ ok: true, source: 'network' })
    expect(second).toMatchObject({ data: JETTA, ok: true, source: 'memory' })
    expect(calls()).toBe(1)
  })

  it('does not let a mistyped VIN ride on the cached entry of the correct one', async () => {
    const { decoder } = countingDecoder(JETTA)
    const cached = withMemoryCache(decoder, MEMORY_CACHE_MAX)

    await cached.decode(JETTA_UNIT_A)

    expect(await cached.decode(MISTYPED_JETTA)).toEqual({
      ok: false,
      reason: 'invalid-vin',
    })
  })

  it('does not cache a failed decode', async () => {
    const decode = vi.fn(
      (): Promise<DecodeOutcome> =>
        Promise.resolve({ ok: false, reason: 'unavailable' })
    )
    const cached = withMemoryCache({ decode }, MEMORY_CACHE_MAX)

    await cached.decode(JETTA_UNIT_A)
    await cached.decode(JETTA_UNIT_B)

    expect(decode).toHaveBeenCalledTimes(2)
  })

  it('evicts the oldest entry once the bound is reached', async () => {
    const { calls, decoder } = countingDecoder(JETTA)
    const cached = withMemoryCache(decoder, 1)

    await cached.decode(JETTA_UNIT_A)
    await cached.decode(ACCORD)
    await cached.decode(JETTA_UNIT_A)

    expect(calls()).toBe(3)
  })
})

describe('withStoreCache', () => {
  it('serves a known squish VIN from the store', async () => {
    const { calls, decoder } = countingDecoder(JETTA)
    const { entries, store } = fakeStore()
    const cached = withStoreCache(decoder, store)

    await cached.decode(JETTA_UNIT_A)
    const second = await cached.decode(JETTA_UNIT_B)

    expect(second).toMatchObject({ data: JETTA, ok: true, source: 'store' })
    expect(calls()).toBe(1)
    expect([...entries.keys()]).toEqual(['3VWDX7AJDM'])
  })

  it('rejects an invalid VIN before touching the store', async () => {
    const { decoder } = countingDecoder(JETTA)
    const { store } = fakeStore()
    const read = vi.spyOn(store, 'read')

    const result = await withStoreCache(decoder, store).decode(MISTYPED_JETTA)

    expect(result).toEqual({ ok: false, reason: 'invalid-vin' })
    expect(read).not.toHaveBeenCalled()
  })

  it('falls through to the decoder when the store cannot be read', async () => {
    const { decoder } = countingDecoder(JETTA)
    const { store } = fakeStore()
    vi.spyOn(store, 'read').mockRejectedValue(new Error('db down'))

    const result = await withStoreCache(decoder, store).decode(JETTA_UNIT_A)

    expect(result).toMatchObject({ ok: true, source: 'network' })
  })

  it('still returns the decode when the store cannot be written', async () => {
    const { decoder } = countingDecoder(JETTA)
    const { store } = fakeStore()
    vi.spyOn(store, 'write').mockRejectedValue(new Error('db down'))

    const result = await withStoreCache(decoder, store).decode(JETTA_UNIT_A)

    expect(result).toMatchObject({ ok: true, source: 'network' })
  })

  it('does not persist a failed decode', async () => {
    const decode = vi.fn(
      (): Promise<DecodeOutcome> =>
        Promise.resolve({ ok: false, reason: 'not-found' })
    )
    const { entries, store } = fakeStore()

    await withStoreCache({ decode }, store).decode(JETTA_UNIT_A)

    expect(entries.size).toBe(0)
  })
})
