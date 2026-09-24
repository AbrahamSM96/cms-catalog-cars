import { afterEach, describe, expect, it, vi } from 'vitest'

interface UmamiEnvironment {
  siteUrl?: string
  source?: string
  websiteId?: string
}

async function importProvider(environment: UmamiEnvironment) {
  const { siteUrl, source, websiteId } = environment
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', siteUrl)
  vi.stubEnv('NEXT_PUBLIC_UMAMI_SRC', source)
  vi.stubEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID', websiteId)
  vi.resetModules()

  return (await import('./umami')).umamiProvider
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('umamiProvider', () => {
  it('returns a configured tag with the default source', async () => {
    const provider = await importProvider({
      siteUrl: 'https://cars.example/path/',
      websiteId: 'site-id',
    })

    expect(provider.tags()).toEqual([
      {
        attributes: {
          'data-domains': 'cars.example',
          'data-website-id': 'site-id',
        },
        id: 'umami',
        src: 'https://cloud.umami.is/script.js',
        strategy: 'afterInteractive',
      },
    ])
  })

  it.each(['http://localhost:3000', 'not a url'])(
    'omits tags for site url %s',
    async (siteUrl) => {
      const provider = await importProvider({ siteUrl, websiteId: 'site-id' })

      expect(provider.tags()).toEqual([])
    }
  )

  it('omits tags without a website id', async () => {
    const provider = await importProvider({ siteUrl: 'https://cars.example' })

    expect(provider.tags()).toEqual([])
  })

  it('uses a custom tracker source', async () => {
    const provider = await importProvider({
      siteUrl: 'https://cars.example',
      source: 'https://analytics.example/tracker.js',
      websiteId: 'site-id',
    })

    expect(provider.tags()[0]?.src).toBe('https://analytics.example/tracker.js')
  })

  it('delegates events to Umami when available', async () => {
    const track = vi.fn()
    vi.stubGlobal('window', { umami: { track } })
    const provider = await importProvider({
      siteUrl: 'https://cars.example',
      websiteId: 'site-id',
    })
    const data = { location: 'catalog' }

    provider.track('search', data)

    expect(track).toHaveBeenCalledWith('search', data)
  })

  it('does nothing when Umami is unavailable', async () => {
    vi.stubGlobal('window', {})
    const provider = await importProvider({
      siteUrl: 'https://cars.example',
      websiteId: 'site-id',
    })

    expect(() => provider.track('search')).not.toThrow()
  })
})
