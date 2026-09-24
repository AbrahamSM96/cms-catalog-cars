import { afterEach, describe, expect, it, vi } from 'vitest'

async function importProvider(measurementId?: string) {
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', measurementId)
  vi.resetModules()

  return (await import('./google-analytics')).googleAnalyticsProvider
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('googleAnalyticsProvider', () => {
  it.each([undefined, '', 'UA-123', "G-BAD'ID", 'g-lowercase'])(
    'omits tags for invalid measurement id %s',
    async (measurementId) => {
      const provider = await importProvider(measurementId)

      expect(provider.tags()).toEqual([])
    }
  )

  it('returns loader and bootstrap tags for a valid measurement id', async () => {
    const provider = await importProvider('G-ABC123')

    expect(provider.tags()).toEqual([
      {
        id: 'ga4-loader',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-ABC123',
        strategy: 'afterInteractive',
      },
      {
        id: 'ga4-config',
        inline:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-ABC123');",
        strategy: 'afterInteractive',
      },
    ])
  })

  it('delegates events to gtag when available', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    const provider = await importProvider('G-ABC123')
    const data = { location: 'catalog', value: 2 }

    provider.track('search', data)

    expect(gtag).toHaveBeenCalledWith('event', 'search', data)
  })

  it('does nothing when gtag is unavailable', async () => {
    vi.stubGlobal('window', {})
    const provider = await importProvider('G-ABC123')

    expect(() => provider.track('search')).not.toThrow()
  })
})
