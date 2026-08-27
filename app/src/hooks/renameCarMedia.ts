import type { CollectionAfterChangeHook } from 'payload'

import { MEDIA_PREFIX, r2PublicUrl } from '../lib/r2'
import { buildCarImageSlug } from '../lib/car-slug'
import type { Car } from '../types/car'
import { moveObject } from '../lib/r2-server'
import { resolveBrandName } from '../lib/car-title'

interface CarMediaDoc {
  brand: unknown
  exteriorImages?: unknown[]
  featuredImage?: unknown
  id: number | string
  interiorImages?: unknown[]
  model?: string
  year?: number
}

/**
 * Extract a media id from an upload-field value (an id or a populated doc).
 *
 * @param value - The relationship value.
 */
function toId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value !== null && typeof value === 'object' && 'id' in value) {
    return (value as { id: number | string }).id
  }
  return null
}

/**
 * Lowercase file extension for a filename (defaults to "jpg").
 *
 * @param filename - The current filename.
 */
function fileExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? 'jpg' : filename.slice(dot + 1).toLowerCase()
}

/**
 * Rename a car's linked media to SEO-friendly, collision-proof filenames.
 *
 * Format: `<car-slug>-<field>[-NN].<ext>` — e.g.
 * `toyota-corolla-le-2020-42-featured.jpg`, `...-exterior-01.jpg`,
 * `...-interior-02.jpg`. The car slug already ends in the car id, so two
 * otherwise identical cars never collide, and the field name records where each
 * photo was attached. Files are moved in R2 and the media docs updated. It never
 * throws: a rename hiccup must not block saving a car.
 *
 * @param props - Payload afterChange hook arguments.
 * @param props.doc - The saved car document.
 * @param props.req - The Payload request.
 */
export const renameCarMedia: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  const car = doc as CarMediaDoc
  const { payload } = req

  try {
    const brandName = await resolveBrandName(car.brand, payload)
    const slugBase = buildCarImageSlug({
      brand: { name: brandName },
      id: car.id,
      model: car.model,
      year: car.year,
    } as unknown as Car)
    if (!slugBase) return doc

    const groups: { field: string; values: unknown[] }[] = [
      { field: 'featured', values: [car.featuredImage] },
      { field: 'exterior', values: car.exteriorImages ?? [] },
      { field: 'interior', values: car.interiorImages ?? [] },
    ]

    // A media file attached in more than one field is renamed once, by the
    // first field that references it (featured wins over exterior/interior).
    const processed = new Set<number | string>()

    for (const group of groups) {
      let seq = 0
      for (const value of group.values) {
        const id = toId(value)
        if (id === null || processed.has(id)) continue
        processed.add(id)
        seq += 1

        const media = await payload.findByID({
          collection: 'media',
          depth: 0,
          id,
          req,
        })
        const current = media.filename
        if (typeof current !== 'string' || !current) continue

        // featured is single (no number); galleries are numbered per field.
        const suffix =
          group.field === 'featured'
            ? group.field
            : `${group.field}-${String(seq).padStart(2, '0')}`
        const desired = `${slugBase}-${suffix}.${fileExt(current)}`
        if (current === desired) continue

        await moveObject(
          `${MEDIA_PREFIX}/${current}`,
          `${MEDIA_PREFIX}/${desired}`
        )
        await payload.update({
          collection: 'media',
          data: { filename: desired, url: r2PublicUrl(desired) },
          id,
          overrideAccess: true,
          req,
        })
      }
    }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'renameCarMedia failed' })
  }

  return doc
}
