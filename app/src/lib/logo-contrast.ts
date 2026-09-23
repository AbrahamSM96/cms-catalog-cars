import sharp from 'sharp'

/**
 * Server-only logo contrast detection (import from server code only — this
 * pulls in sharp and must never reach the browser bundle).
 *
 * Dealerships upload their own logo from the CMS and we have no say in it: some
 * are white-on-transparent PNGs/SVGs meant for a dark header, others are
 * near-black marks meant for a light one. Either way one of our two themes
 * makes it disappear. Instead of asking every client to re-export their logo,
 * we measure how bright the logo actually is and report a *tone*; the navbar
 * and footer turn that into a contrasting plate for whichever theme needs it.
 *
 * The measurement is theme-blind on purpose. The server cannot know the
 * visitor's colour scheme — it is a client media query — so the verdict
 * describes the logo, never the surface, and the plate switches in CSS.
 */

/** Downscale target before sampling — plenty for an average, cheap to decode. */
const SAMPLE_SIZE = 48

/**
 * Alpha below this counts as transparent and is skipped. Logos are mostly
 * transparent padding; averaging those pixels in would drag every logo towards
 * "dark" and defeat the whole check.
 */
const MIN_ALPHA = 32

/**
 * Minimum WCAG contrast ratio the logo must reach against a surface to be left
 * alone there. Text needs 4.5, but a logo is a large shape and many brands
 * legitimately use mid-tone colours, so we only step in when it is close to
 * invisible.
 */
const MIN_CONTRAST = 2.2

/** Relative luminance of pure white, per WCAG 2.1. */
const WHITE_LUMINANCE = 1

/**
 * Relative luminance of `--color-white` in the dark theme (`#111a2b`) — the
 * panel colour the navbar and footer paint in dark mode. Keep it in step with
 * `globals.css`; a few points either way only shifts the threshold slightly.
 */
const DARK_SURFACE_LUMINANCE = 0.0109

/**
 * How the logo reads on its own: `light` marks are washed out on our light
 * surfaces, `dark` ones vanish on the dark ones, and `neutral` covers the
 * mid-tone brand colours that hold up against both.
 */
type LogoTone = 'dark' | 'light' | 'neutral'

/** Cache keyed by logo URL — the logo changes about once per deployment. */
const cache = new Map<string, LogoTone>()

/**
 * Convert one 0-255 sRGB channel to its linear-light value, per the WCAG 2.1
 * relative luminance definition.
 *
 * @param channel - Channel value in the 0-255 range.
 */
function linearize(channel: number): number {
  const value = channel / 255

  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4)
}

/**
 * WCAG 2.1 relative luminance of an sRGB pixel.
 *
 * @param red - Red channel, 0-255.
 * @param green - Green channel, 0-255.
 * @param blue - Blue channel, 0-255.
 */
function luminance(red: number, green: number, blue: number): number {
  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  )
}

/**
 * WCAG contrast ratio between two relative luminances.
 *
 * @param a - First relative luminance.
 * @param b - Second relative luminance.
 */
function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Average relative luminance of a logo's *visible* pixels, or `null` when the
 * image cannot be read or is fully transparent.
 *
 * Each pixel is weighted by its alpha so anti-aliased edges count less than
 * solid strokes — otherwise a thin white wordmark surrounded by soft edges
 * reads much darker than it looks.
 *
 * @param bytes - Raw image bytes (PNG, WebP, JPEG or SVG).
 */
async function visibleLuminance(bytes: Buffer): Promise<null | number> {
  const { data } = await sharp(bytes)
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // `ensureAlpha()` guarantees RGBA, so the stride is always 4.
  let total = 0
  let weight = 0

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < MIN_ALPHA) {
      continue
    }

    const pixel = luminance(data[i], data[i + 1], data[i + 2])
    total += pixel * alpha
    weight += alpha
  }

  return weight === 0 ? null : total / weight
}

/**
 * Tone of a decoded logo.
 *
 * The two tests are mutually exclusive by construction: a mark bright enough to
 * fail against white sits far above the luminance that fails against our dark
 * panel, so the mid-tone band between them falls through to `neutral`.
 *
 * Split out from `logoTone` so the measurement can be tested without a network
 * round trip.
 *
 * @param bytes - Raw image bytes (PNG, WebP, JPEG or SVG).
 */
export async function logoToneForBytes(bytes: Buffer): Promise<LogoTone> {
  const average = await visibleLuminance(bytes)

  if (average === null) {
    return 'neutral'
  }

  if (contrastRatio(average, WHITE_LUMINANCE) < MIN_CONTRAST) {
    return 'light'
  }

  if (contrastRatio(average, DARK_SURFACE_LUMINANCE) < MIN_CONTRAST) {
    return 'dark'
  }

  return 'neutral'
}

/**
 * Tone of the brand logo, so the navbar and footer can plate it in whichever
 * theme would swallow it.
 *
 * Never throws: a logo we cannot fetch or decode is reported as `neutral`,
 * since the plate is the unusual case and a wrong plate is more jarring than a
 * missing one.
 *
 * @param logoUrl - Public URL of the logo, or undefined when none is uploaded.
 */
export async function logoTone(logoUrl?: string): Promise<LogoTone> {
  if (!logoUrl) {
    return 'neutral'
  }

  const cached = cache.get(logoUrl)
  if (cached !== undefined) {
    return cached
  }

  let tone: LogoTone = 'neutral'

  try {
    const response = await fetch(logoUrl)
    if (response.ok) {
      tone = await logoToneForBytes(Buffer.from(await response.arrayBuffer()))
    }
  } catch {
    tone = 'neutral'
  }

  cache.set(logoUrl, tone)

  return tone
}

export type { LogoTone }
