import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

/**
 * Server-only R2 helpers (import from server code only — this pulls in the AWS
 * SDK and must never reach the browser bundle). Uses the same R2 credentials as
 * the storage plugin. Kept separate from lib/r2.ts, which stays pure so it can
 * be imported from Client Components.
 */
const bucket = process.env.R2_BUCKET ?? ''

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  region: 'auto',
})

/**
 * Rename an object within the bucket by copying to the new key and deleting the
 * old one (S3/R2 have no native rename).
 *
 * @param fromKey - Current object key (including prefix).
 * @param toKey - Destination object key (including prefix).
 */
export async function moveObject(
  fromKey: string,
  toKey: string
): Promise<void> {
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      // encodeURI keeps the "/" separators but escapes spaces/accents that may
      // exist in the original (pre-rename) filename.
      CopySource: encodeURI(`${bucket}/${fromKey}`),
      Key: toKey,
    })
  )
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: fromKey })
  )
}
