import { afterEach, describe, expect, it, vi } from 'vitest'

import { absoluteUrl, SITE_URL } from './seo'

/**
 * Re-import the seo module with NEXT_PUBLIC_SITE_URL set to the given value so
 * the module-level SITE_URL is recomputed. `undefined` removes the variable.
 *
 * @param value - the env value to apply before re-importing, or undefined.
 */
async function importSeoWithEnv(
  value: string | undefined
): Promise<typeof import('./seo')> {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', value)
  vi.resetModules()
  return import('./seo')
}

describe('SITE_URL', () => {
  afterEach(() => {
    // Undo stubEnv + module cache so the statically imported SITE_URL and
    // absoluteUrl used by the block below keep their original values.
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('falls back to localhost when env is not set', async () => {
    const mod = await importSeoWithEnv(undefined)
    expect(mod.SITE_URL).toBe('http://localhost:3000')
  })

  it('uses env value when set', async () => {
    const mod = await importSeoWithEnv('https://example.com')
    expect(mod.SITE_URL).toBe('https://example.com')
  })

  it('strips trailing slashes', async () => {
    const mod = await importSeoWithEnv('https://example.com///')
    expect(mod.SITE_URL).toBe('https://example.com')
  })
})

describe('absoluteUrl', () => {
  it('prepends SITE_URL to path with leading slash', () => {
    expect(absoluteUrl('/catalogo')).toBe(`${SITE_URL}/catalogo`)
  })

  it('prepends SITE_URL and adds leading slash when missing', () => {
    expect(absoluteUrl('catalogo')).toBe(`${SITE_URL}/catalogo`)
  })

  it('handles root path', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
  })
})
