import { beforeEach, describe, expect, it, vi } from 'vitest'

import { nhtsaVinDecoder } from './nhtsa'

import hondaAccord from './__fixtures__/honda-accord-2003.json'
import nissanSentra from './__fixtures__/nissan-sentra-mx-2019.json'
import vwJetta from './__fixtures__/vw-jetta-mx-2013.json'

const VW_JETTA_MX_2013 = '3VWDX7AJ1DM389728'
const HONDA_ACCORD_2003 = '1HGCM82633A004352'
const NISSAN_SENTRA_MX_2019 = '3N1AB7AP2KY000001'

/** Checksum-valid, but position 10 holds `0`, which is not a year code. */
const NO_YEAR_CODE = '1HGCM826X0A004313'

/**
 * Build a `fetch` stand-in that answers with the given JSON body.
 *
 * @param body - The payload the fake response resolves to.
 */
function jsonResponse(body: unknown): Response {
  return { json: (): Promise<unknown> => Promise.resolve(body), ok: true } as Response
}

describe('nhtsaVinDecoder', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('rejects an invalid VIN without spending a network call', async () => {
    const result = await nhtsaVinDecoder().decode('1HGCM82633A004353')

    expect(result).toEqual({ ok: false, reason: 'invalid-vin' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('translates a decoded row into our own vocabulary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(vwJetta))

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toMatchObject({
      data: {
        bodyClass: 'Sedan/Saloon',
        displacementL: 2.48,
        doors: 4,
        engineCylinders: 5,
        engineHp: 170,
        fuelTypePrimary: 'Gasoline',
        make: 'VOLKSWAGEN',
        model: 'Jetta',
        modelYear: 2013,
        plantCountry: 'MEXICO',
        transmissionStyle: 'Automatic',
        trim: 'Comfortline, Sportline',
      },
      ok: true,
      source: 'network',
    })
  })

  it('reports attributes vPIC leaves blank as null instead of empty strings', async () => {
    fetchMock.mockResolvedValue(jsonResponse(nissanSentra))

    const result = await nhtsaVinDecoder().decode(NISSAN_SENTRA_MX_2019)

    expect(result).toMatchObject({
      data: { make: 'NISSAN', model: 'Sentra', trim: null },
      ok: true,
    })
  })

  it('keeps the untranslated payload so a new mapper can reuse it later', async () => {
    fetchMock.mockResolvedValue(jsonResponse(hondaAccord))

    const result = await nhtsaVinDecoder().decode(HONDA_ACCORD_2003)

    expect(result).toMatchObject({ ok: true })
    if (!result.ok) return
    expect(result.raw).toMatchObject({ Trim: 'EX-V6' })
  })

  it('passes the model year encoded in the VIN', async () => {
    fetchMock.mockResolvedValue(jsonResponse(vwJetta))

    await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(fetchMock.mock.calls[0][0]).toContain('&modelyear=2013')
  })

  it('omits the model year when the VIN does not encode one', async () => {
    fetchMock.mockResolvedValue(jsonResponse(vwJetta))

    await nhtsaVinDecoder().decode(NO_YEAR_CODE)

    expect(fetchMock.mock.calls[0][0]).not.toContain('modelyear')
  })

  it('treats unparseable numbers as unknown', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        Results: [
          {
            DisplacementL: 'n/a',
            Doors: 'Not Applicable',
            EngineHP: '170.60',
            Make: 'NISSAN',
            Model: 'Versa',
          },
        ],
      })
    )

    const result = await nhtsaVinDecoder().decode(NISSAN_SENTRA_MX_2019)

    expect(result).toMatchObject({
      data: { displacementL: null, doors: null, engineHp: 171 },
      ok: true,
    })
  })

  it('retries once after a failed attempt', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(jsonResponse(vwJetta))

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toMatchObject({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries a server error before giving up', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toEqual({ ok: false, reason: 'unavailable' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reports the service as unavailable when every attempt fails', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'))

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('reports an empty result set as unavailable', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ Results: [] }))

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('reports a row that describes no vehicle as not found', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ Results: [{ ErrorCode: '11', Make: '', Model: '' }] })
    )

    const result = await nhtsaVinDecoder().decode(VW_JETTA_MX_2013)

    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })
})
