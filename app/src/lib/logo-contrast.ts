import sharp from 'sharp'

/**
 * Server-only logo contrast detection (import from server code only — this
 * pulls in sharp and must never reach the browser bundle).
 *
 * Dealerships upload their own logo from the CMS and a good share of them are
 * white-on-transparent PNGs/SVGs meant for a dark header. Dropped on our white
 * navbar those vanish. Instead of asking every client to re-export their logo,
 * we measure how bright the logo actually is and, when it would disappear, the
 * navbar and footer paint a dark plate behind it.
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
 * Minimum WCAG contrast ratio the logo must reach against the white navbar to
 * be left alone. Text needs 4.5, but a logo is a large shape and many brands
 * legitimately use mid-tone colours, so we only step in when it is close to
 * invisible.
 */
const MIN_CONTRAST_ON_WHITE = 2.2

/** Relative luminance of pure white, per WCAG 2.1. */
const WHITE_LUMINANCE = 1

/** Cache keyed by logo URL — the logo changes about once per deployment. */
const cache = new Map<string, boolean>()

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
 * Whether a decoded logo is too light to read on our white surfaces.
 *
 * Split out from `logoNeedsDarkPlate` so the measurement can be tested without
 * a network round trip.
 *
 * @param bytes - Raw image bytes (PNG, WebP, JPEG or SVG).
 */
export async function needsDarkPlateForBytes(bytes: Buffer): Promise<boolean> {
  const average = await visibleLuminance(bytes)

  return (
    average !== null &&
    contrastRatio(average, WHITE_LUMINANCE) < MIN_CONTRAST_ON_WHITE
  )
}

/**
 * Whether the brand logo needs a dark plate behind it to stay legible on the
 * white navbar and footer.
 *
 * Never throws: a logo we cannot fetch or decode is assumed to be fine, since
 * the plate is the unusual case and a wrong plate is more jarring than a
 * missing one.
 *
 * @param logoUrl - Public URL of the logo, or undefined when none is uploaded.
 */
export async function logoNeedsDarkPlate(logoUrl?: string): Promise<boolean> {
  if (!logoUrl) {
    return false
  }

  const cached = cache.get(logoUrl)
  if (cached !== undefined) {
    return cached
  }

  let needsPlate = false

  try {
    const response = await fetch(logoUrl)
    if (response.ok) {
      needsPlate = await needsDarkPlateForBytes(
        Buffer.from(await response.arrayBuffer())
      )
    }
  } catch {
    needsPlate = false
  }

  cache.set(logoUrl, needsPlate)

  return needsPlate
}
