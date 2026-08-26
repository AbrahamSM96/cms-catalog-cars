import { describe, expect, it, vi } from 'vitest'

import { filenameToKey, MEDIA_PREFIX, r2PublicUrl } from '@/lib/r2'

describe('filenameToKey', () => {
  it('puts the file under the media prefix', () => {
    expect(filenameToKey('nissan-versa-2021-42.webp')).toBe(
      `${MEDIA_PREFIX}/nissan-versa-2021-42.webp`
    )
  })

  it('keeps the extension, unlike a Cloudinary public_id', () => {
    expect(filenameToKey('logo.png').endsWith('.png')).toBe(true)
  })
})

describe('r2PublicUrl', () => {
  it('joins the public bucket URL with the object key', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_URL', 'https://cdn.test')

    expect(r2PublicUrl('logo.png')).toBe(
      `https://cdn.test/${MEDIA_PREFIX}/logo.png`
    )
  })

  it('drops trailing slashes so the URL never doubles up', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_URL', 'https://cdn.test///')

    expect(r2PublicUrl('logo.png')).toBe(
      `https://cdn.test/${MEDIA_PREFIX}/logo.png`
    )
  })

  it('falls back to a root-relative URL when the env var is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_URL', undefined)

    expect(r2PublicUrl('logo.png')).toBe(`/${MEDIA_PREFIX}/logo.png`)
  })
})
