import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

import { needsDarkPlateForBytes } from '@/lib/logo-contrast'

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
