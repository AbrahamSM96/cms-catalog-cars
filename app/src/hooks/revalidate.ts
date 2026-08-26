import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import { revalidateTag } from 'next/cache'

/**
 * Purge the cached readers in `lib/payload-client.ts` whenever the CMS changes,
 * so an edit in the admin shows up on the site on the next request instead of
 * waiting out the `cacheLife` window.
 *
 * A collection lists every tag its data reaches, not just its own: cars are read
 * at `depth: 2`, so saving a brand, colour, dealership or image also changes the
 * cached car documents.
 *
 * Set `context.disableRevalidate` on a Payload request to skip the purge — the
 * seed script writes hundreds of documents and has no cache to invalidate.
 */

/**
 * Drop every cache entry carrying the given tags.
 *
 * @param tags - Cache tags to invalidate.
 */
function purge(tags: string[]): void {
  try {
    for (const tag of tags) {
      // `expire: 0` drops the entry instead of marking it stale, so the first
      // visitor after a save reads fresh data rather than the old price. The
      // recommended `'max'` profile would serve the previous version once more
      // — fine for a blog, wrong for a dealership that just corrected a price
      // and is looking at its own site to check.
      revalidateTag(tag, { expire: 0 })
    }
  } catch {
    // `revalidateTag` needs a Next.js request store. Payload also runs from the
    // seed script and from migrations, where there is no store — and no cache
    // to purge either, so there is nothing to do and nothing to report.
  }
}

/**
 * Build an `afterChange` hook that purges the given cache tags.
 *
 * @param tags - Cache tags this collection's data appears in.
 */
export function revalidateAfterChange(
  ...tags: string[]
): CollectionAfterChangeHook {
  return ({ doc, req }) => {
    if (!req.context.disableRevalidate) {
      purge(tags)
    }

    return doc
  }
}

/**
 * Build an `afterDelete` hook that purges the given cache tags.
 *
 * @param tags - Cache tags this collection's data appears in.
 */
export function revalidateAfterDelete(
  ...tags: string[]
): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    if (!req.context.disableRevalidate) {
      purge(tags)
    }

    return doc
  }
}

/**
 * Build an `afterChange` hook for a global that purges the given cache tags.
 *
 * @param tags - Cache tags this global's data appears in.
 */
export function revalidateGlobalAfterChange(
  ...tags: string[]
): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    if (!req.context.disableRevalidate) {
      purge(tags)
    }

    return doc
  }
}
