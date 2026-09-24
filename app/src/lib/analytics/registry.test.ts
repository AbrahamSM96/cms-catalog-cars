import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AnalyticsProvider, AnalyticsTag } from './types'

const googleTags: AnalyticsTag[] = [
  { id: 'google-tag', strategy: 'afterInteractive' },
]
const umamiTags: AnalyticsTag[] = [
  { id: 'umami-tag', strategy: 'afterInteractive' },
]

const googleProvider: AnalyticsProvider = {
  id: 'google',
  name: 'Google',
  tags: vi.fn(() => googleTags),
  track: vi.fn(),
}
const umamiProvider: AnalyticsProvider = {
  id: 'umami',
  name: 'Umami',
  tags: vi.fn(() => umamiTags),
  track: vi.fn(),
}

vi.mock('./google-analytics', () => ({
  googleAnalyticsProvider: googleProvider,
}))
vi.mock('./umami', () => ({ umamiProvider }))

async function importRegistry(nodeEnvironment: string, selected?: string) {
  vi.stubEnv('NODE_ENV', nodeEnvironment)
  vi.stubEnv('NEXT_PUBLIC_ANALYTICS_PROVIDER', selected)
  vi.resetModules()

  return import('./registry')
}

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('analytics registry', () => {
  it.each([
    ['development', 'umami'],
    ['production', undefined],
    ['production', 'unknown'],
  ])(
    'disables analytics for %s with provider %s',
    async (nodeEnv, selected) => {
      const registry = await importRegistry(nodeEnv, selected)

      expect(registry.resolveAnalyticsProvider()).toBeNull()
      expect(registry.analyticsTags()).toEqual([])
    }
  )

  it.each([
    ['  GOOGLE ', googleProvider, 'google-tag'],
    ['umami', umamiProvider, 'umami-tag'],
  ])(
    'resolves provider %s and returns its tags',
    async (selected, provider, id) => {
      const registry = await importRegistry('production', selected)

      expect(registry.resolveAnalyticsProvider()).toBe(provider)
      expect(registry.analyticsTags()).toEqual([
        { id, strategy: 'afterInteractive' },
      ])
    }
  )

  it('does not track during server rendering', async () => {
    const registry = await importRegistry('production', 'umami')

    registry.trackEvent('search')

    expect(umamiProvider.track).not.toHaveBeenCalled()
  })

  it('delegates browser events to the selected provider', async () => {
    vi.stubGlobal('window', {})
    const registry = await importRegistry('production', 'umami')
    const data = { resultCount: 3 }

    registry.trackEvent('search', data)

    expect(umamiProvider.track).toHaveBeenCalledWith('search', data)
  })

  it('swallows errors from the selected provider', async () => {
    vi.mocked(umamiProvider.track).mockImplementationOnce(() => {
      throw new Error('blocked')
    })
    vi.stubGlobal('window', {})
    const registry = await importRegistry('production', 'umami')

    expect(() => registry.trackEvent('search')).not.toThrow()
  })
})
