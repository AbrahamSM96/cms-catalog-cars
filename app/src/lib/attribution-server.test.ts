import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { serializeAttribution } from '@/lib/attribution'
import { readAttributionCookie } from '@/lib/attribution-server'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

const mockedCookies = vi.mocked(cookies)

describe('readAttributionCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads and deserialises the attribution cookie', async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn(() => ({
        name: 'attribution',
        value: serializeAttribution({
          landingPath: '/',
          utmSource: 'tiktok',
        }),
      })),
    } as unknown as Awaited<ReturnType<typeof cookies>>)

    await expect(readAttributionCookie()).resolves.toEqual({
      landingPath: '/',
      utmSource: 'tiktok',
    })
  })

  it('returns null when cookie access fails', async () => {
    mockedCookies.mockRejectedValue(new Error('cookies unavailable'))

    await expect(readAttributionCookie()).resolves.toBeNull()
  })
})
