/**
 * Cloudflare R2 storage helpers.
 *
 * All media lives in a single R2 bucket, under the MEDIA_PREFIX folder, and is
 * served from a public bucket URL (an r2.dev domain or a custom domain) set in
 * NEXT_PUBLIC_R2_PUBLIC_URL. These helpers are the single source of truth for
 * the object key and the public URL, shared by the storage plugin (upload +
 * generateFileURL) and the frontend getImageUrl helper, so where a file lives
 * and the URL that points to it always agree.
 */

/** Folder prefix for every uploaded media object inside the R2 bucket. */
export const MEDIA_PREFIX = 'cms-cars'

/**
 * Build the R2 object key for a media filename (prefix + filename, extension
 * kept — R2 keys are exact, unlike Cloudinary public_ids).
 *
 * @param filename - The Payload media filename.
 */
export function filenameToKey(filename: string): string {
  return `${MEDIA_PREFIX}/${filename}`
}

/**
 * Build the public URL for a media filename served from the R2 bucket.
 *
 * @param filename - The Payload media filename.
 */
export function r2PublicUrl(filename: string): string {
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/+$/, '')
  return `${base}/${filenameToKey(filename)}`
}
