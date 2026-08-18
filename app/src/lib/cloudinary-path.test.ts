import { describe, expect, it } from 'vitest'

import { filenameToPublicId } from './cloudinary-path'

describe('filenameToPublicId', () => {
  it('removes extension and prepends cms-cars/', () => {
    expect(filenameToPublicId('photo.jpg')).toBe('cms-cars/photo')
  })

  it('removes only the last extension (dot in remaining becomes _)', () => {
    expect(filenameToPublicId('image.tar.gz')).toBe('cms-cars/image_tar')
  })

  it('is idempotent when already prefixed', () => {
    expect(filenameToPublicId('cms-cars/photo')).toBe('cms-cars/photo')
  })

  it('sanitizes unsafe characters to underscores', () => {
    expect(filenameToPublicId('my photo (1).png')).toBe('cms-cars/my_photo__1_')
  })

  it('returns empty string for null', () => {
    expect(filenameToPublicId(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(filenameToPublicId(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(filenameToPublicId('')).toBe('')
  })

  it('preserves safe alphanumeric and hyphens', () => {
    expect(filenameToPublicId('nissan-versa-2021.webp')).toBe(
      'cms-cars/nissan-versa-2021'
    )
  })
})
