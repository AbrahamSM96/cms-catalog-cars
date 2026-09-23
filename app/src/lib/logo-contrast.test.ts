import { describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'

import { logoTone, logoToneForBytes } from '@/lib/logo-contrast'

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

describe('logoToneForBytes', () => {
  it('reads a white-on-transparent logo as light', async () => {
    expect(await logoToneForBytes(await logo('#ffffff'))).toBe('light')
  })

  it('reads a very light grey logo as light', async () => {
    expect(await logoToneForBytes(await logo('#e5e5e5'))).toBe('light')
  })

  it('reads a mid-grey logo as neutral', async () => {
    expect(await logoToneForBytes(await logo('#808080'))).toBe('neutral')
  })

  it('reads a saturated brand colour as neutral', async () => {
    expect(await logoToneForBytes(await logo('#276CF5'))).toBe('neutral')
  })

  it('reads a near-black logo as dark', async () => {
    expect(await logoToneForBytes(await logo('#0f172a'))).toBe('dark')
  })

  // Channels at or below 0.04045 of full scale take the linear branch of the
  // WCAG luminance formula instead of the gamma one.
  it('reads a pure black logo as dark', async () => {
    expect(await logoToneForBytes(await logo('#000000'))).toBe('dark')
  })

  // The band between the two thresholds is what keeps a plate off the logos
  // that read on both themes; without it every mark would get one.
  it('reads a dark-but-not-black grey as neutral', async () => {
    expect(await logoToneForBytes(await logo('#5a5a5a'))).toBe('neutral')
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

    expect(await logoToneForBytes(padded)).toBe('light')
  })

  it('reads a fully transparent image as neutral', async () => {
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

    expect(await logoToneForBytes(blank)).toBe('neutral')
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

describe('logoTone', () => {
  it('returns neutral when no logo is uploaded', async () => {
    const fetchMock = stubFetch(okResponse(await logo('#ffffff')))

    expect(await logoTone(undefined)).toBe('neutral')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports a light fetched logo', async () => {
    stubFetch(okResponse(await logo('#ffffff')))

    expect(await logoTone('https://cdn.test/white.png')).toBe('light')
  })

  it('reports a dark fetched logo', async () => {
    stubFetch(okResponse(await logo('#0f172a')))

    expect(await logoTone('https://cdn.test/dark.png')).toBe('dark')
  })

  it('caches the verdict per URL instead of refetching', async () => {
    const fetchMock = stubFetch(okResponse(await logo('#ffffff')))
    const url = 'https://cdn.test/cached.png'

    expect(await logoTone(url)).toBe('light')
    expect(await logoTone(url)).toBe('light')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('assumes neutral when the logo cannot be downloaded', async () => {
    stubFetch({ ok: false })

    expect(await logoTone('https://cdn.test/404.png')).toBe('neutral')
  })

  it('assumes neutral when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    expect(await logoTone('https://cdn.test/offline.png')).toBe('neutral')
  })
})
