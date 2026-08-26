import { describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'

import { logoNeedsDarkPlate, needsDarkPlateForBytes } from '@/lib/logo-contrast'

/**
 * Render a solid mark of the given colour on a transparent canvas — the shape
 * of a typical uploaded logo.
 *
 * @param fill - CSS colour of the mark.
 */
async function logo(fill: string): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><rect x="20" y="20" width="200" height="60" fill="${fill}"/></svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

describe('needsDarkPlateForBytes', () => {
  it('asks for a plate for a white-on-transparent logo', async () => {
    expect(await needsDarkPlateForBytes(await logo('#ffffff'))).toBe(true)
  })

  it('asks for a plate for a very light grey logo', async () => {
    expect(await needsDarkPlateForBytes(await logo('#e5e5e5'))).toBe(true)
  })

  it('leaves a mid-grey logo alone', async () => {
    expect(await needsDarkPlateForBytes(await logo('#808080'))).toBe(false)
  })

  it('leaves a saturated brand colour alone', async () => {
    expect(await needsDarkPlateForBytes(await logo('#276CF5'))).toBe(false)
  })

  it('leaves a dark logo alone', async () => {
    expect(await needsDarkPlateForBytes(await logo('#0f172a'))).toBe(false)
  })

  // Channels at or below 0.04045 of full scale take the linear branch of the
  // WCAG luminance formula instead of the gamma one.
  it('leaves a pure black logo alone', async () => {
    expect(await needsDarkPlateForBytes(await logo('#000000'))).toBe(false)
  })

  it('ignores transparent padding instead of reading it as dark', async () => {
    const padded = await sharp({
      create: {
        background: { alpha: 0, b: 0, g: 0, r: 0 },
        channels: 4,
        height: 400,
        width: 400,
      },
    })
      .composite([{ input: await logo('#ffffff'), left: 0, top: 170 }])
      .png()
      .toBuffer()

    expect(await needsDarkPlateForBytes(padded)).toBe(true)
  })

  it('leaves a fully transparent image alone', async () => {
    const blank = await sharp({
      create: {
        background: { alpha: 0, b: 0, g: 0, r: 0 },
        channels: 4,
        height: 100,
        width: 100,
      },
    })
      .png()
      .toBuffer()

    expect(await needsDarkPlateForBytes(blank)).toBe(false)
  })
})

/**
 * Stub `fetch` with a canned response and hand back the mock so a test can
 * assert how many times the logo was actually downloaded.
 *
 * @param response - value the stubbed fetch resolves to.
 */
function stubFetch(response: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

/**
 * Build an ok Response-alike carrying the given image bytes.
 *
 * @param bytes - raw image bytes the response should expose.
 */
function okResponse(bytes: Buffer): unknown {
  return { arrayBuffer: () => Promise.resolve(bytes), ok: true }
}

describe('logoNeedsDarkPlate', () => {
  it('returns false when no logo is uploaded', async () => {
    const fetchMock = stubFetch(okResponse(await logo('#ffffff')))

    expect(await logoNeedsDarkPlate(undefined)).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('asks for a plate when the fetched logo is too light', async () => {
    stubFetch(okResponse(await logo('#ffffff')))

    expect(await logoNeedsDarkPlate('https://cdn.test/white.png')).toBe(true)
  })

  it('leaves a dark fetched logo alone', async () => {
    stubFetch(okResponse(await logo('#0f172a')))

    expect(await logoNeedsDarkPlate('https://cdn.test/dark.png')).toBe(false)
  })

  it('caches the verdict per URL instead of refetching', async () => {
    const fetchMock = stubFetch(okResponse(await logo('#ffffff')))
    const url = 'https://cdn.test/cached.png'

    expect(await logoNeedsDarkPlate(url)).toBe(true)
    expect(await logoNeedsDarkPlate(url)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('assumes no plate when the logo cannot be downloaded', async () => {
    stubFetch({ ok: false })

    expect(await logoNeedsDarkPlate('https://cdn.test/404.png')).toBe(false)
  })

  it('assumes no plate when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    expect(await logoNeedsDarkPlate('https://cdn.test/offline.png')).toBe(false)
  })
})
