import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

// The commands and the client are all called with `new`, so the fakes must be
// constructible — arrow functions are not.
vi.mock('@aws-sdk/client-s3', () => ({
  CopyObjectCommand: function (input: unknown) {
    return { input, type: 'copy' }
  },
  DeleteObjectCommand: function (input: unknown) {
    return { input, type: 'delete' }
  },
  S3Client: function () {
    return { send }
  },
}))

/**
 * Import `moveObject` with the R2 env in place — the module reads the bucket
 * name and builds its S3 client at import time.
 */
async function importMoveObject(): Promise<
  (fromKey: string, toKey: string) => Promise<void>
> {
  vi.stubEnv('R2_ACCESS_KEY_ID', 'key')
  vi.stubEnv('R2_BUCKET', 'test-bucket')
  vi.stubEnv('R2_ENDPOINT', 'https://account.r2.cloudflarestorage.com')
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret')

  const { moveObject } = await import('@/lib/r2-server')

  return moveObject
}

describe('moveObject', () => {
  beforeEach(() => {
    vi.resetModules()
    send.mockReset()
    send.mockResolvedValue(undefined)
  })

  it('copies to the new key and then deletes the old one', async () => {
    const moveObject = await importMoveObject()

    await moveObject('cms-cars/old.webp', 'cms-cars/new.webp')

    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[0][0]).toEqual({
      input: {
        Bucket: 'test-bucket',
        CopySource: 'test-bucket/cms-cars/old.webp',
        Key: 'cms-cars/new.webp',
      },
      type: 'copy',
    })
    expect(send.mock.calls[1][0]).toEqual({
      input: { Bucket: 'test-bucket', Key: 'cms-cars/old.webp' },
      type: 'delete',
    })
  })

  it('escapes spaces and accents but keeps the separators', async () => {
    const moveObject = await importMoveObject()

    await moveObject('cms-cars/Nissan Márch.webp', 'cms-cars/nissan-march.webp')

    expect(send.mock.calls[0][0].input.CopySource).toBe(
      'test-bucket/cms-cars/Nissan%20M%C3%A1rch.webp'
    )
  })

  it('deletes only after the copy resolves', async () => {
    const moveObject = await importMoveObject()
    const order: string[] = []
    send.mockImplementation((command: { type: string }) => {
      order.push(command.type)

      return Promise.resolve(undefined)
    })

    await moveObject('cms-cars/a.webp', 'cms-cars/b.webp')

    expect(order).toEqual(['copy', 'delete'])
  })
})
