/**
 * Map a Payload media `filename` to its Cloudinary `public_id`, deterministically.
 *
 * This is the single source of truth used in THREE places so the upload
 * location and every generated URL always agree:
 *   1. the storage adapter (where the file is uploaded)
 *   2. Payload's generateFileURL (media.url)
 *   3. the frontend getImageUrl helper
 *
 * All car media lives in the "cms-cars/" Cloudinary folder. The extension is
 * dropped (Cloudinary public_ids don't include it) and unsafe characters are
 * replaced. If the value already looks like a cms-cars public_id it is returned
 * unchanged (covers legacy docs whose filename was stored as the public_id).
 */
export function filenameToPublicId(filename?: string | null): string {
  if (!filename) return "";
  const noExt = filename.replace(/\.[^/.]+$/, "");
  if (noExt.startsWith("cms-cars/")) return noExt;
  const clean = noExt.replace(/[^a-zA-Z0-9-]/g, "_");
  return `cms-cars/${clean}`;
}
