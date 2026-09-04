import { describe, expect, it } from 'vitest'

import type { LandingFacets } from './landing-routes'
import {
  canonicalizeSegments,
  landingCrumbs,
  needsCanonicalRedirect,
  resolveLandingPath,
} from './landing-routes'

const facets: LandingFacets = {
  brands: [
    { id: 1, name: 'Mazda', slug: 'mazda' },
    { id: 2, name: 'Nissan', slug: 'nissan' },
  ],
  cities: [
    {
      count: 12,
      dealershipIds: [7, 8],
      id: 1,
      name: 'Pachuca',
      slug: 'pachuca',
      state: 'Hidalgo',
    },
    {
      count: 0,
      dealershipIds: [],
      id: 2,
      name: 'Tulancingo',
      slug: 'tulancingo',
      state: 'Hidalgo',
    },
  ],
}

describe('resolveLandingPath', () => {
  it('resolves a city', () => {
    const page = resolveLandingPath(['pachuca'], facets)
    expect(page?.heading).toBe('Autos seminuevos en Pachuca')
    expect(page?.canonical).toBe('/seminuevos/pachuca')
    expect(page?.brand).toBeNull()
    expect(page?.filters).toEqual({ dealershipIds: [7, 8] })
  })

  it('resolves a city and a brand', () => {
    const page = resolveLandingPath(['pachuca', 'mazda'], facets)
    expect(page?.heading).toBe('Mazda seminuevos en Pachuca')
    expect(page?.canonical).toBe('/seminuevos/pachuca/mazda')
    expect(page?.filters).toEqual({ brand: 'mazda', dealershipIds: [7, 8] })
  })

  it('rejects the inverted order', () => {
    // /seminuevos/mazda/pachuca must not serve the same list as
    // /seminuevos/pachuca/mazda — one page, one URL.
    expect(resolveLandingPath(['mazda', 'pachuca'], facets)).toBeNull()
  })

  it('rejects a brand on its own', () => {
    expect(resolveLandingPath(['mazda'], facets)).toBeNull()
  })

  it('rejects a third segment', () => {
    expect(resolveLandingPath(['pachuca', 'mazda', 'suv'], facets)).toBeNull()
  })

  it('rejects an unknown city or brand', () => {
    expect(resolveLandingPath(['queretaro'], facets)).toBeNull()
    expect(resolveLandingPath(['pachuca', 'audi'], facets)).toBeNull()
  })

  it('rejects a non-canonical spelling', () => {
    expect(resolveLandingPath(['Pachuca'], facets)).toBeNull()
    expect(resolveLandingPath(['pachuca', 'MAZDA'], facets)).toBeNull()
  })

  it('rejects the empty path, which is the hub and not a landing', () => {
    expect(resolveLandingPath([], facets)).toBeNull()
  })

  it('resolves a city with no dealerships to an empty filter', () => {
    // The page still has to resolve: it answers noindex, not a soft 404.
    const page = resolveLandingPath(['tulancingo'], facets)
    expect(page).not.toBeNull()
    expect(page?.filters.dealershipIds).toEqual([])
  })

  it('names the state in the title', () => {
    expect(resolveLandingPath(['pachuca'], facets)?.title).toContain('Hidalgo')
  })
})

describe('canonicalizeSegments', () => {
  it('lowercases a spelling that would otherwise 404', () => {
    expect(canonicalizeSegments(['Pachuca'])).toEqual(['pachuca'])
    expect(canonicalizeSegments(['PACHUCA', 'Mazda'])).toEqual([
      'pachuca',
      'mazda',
    ])
  })

  it('normalises the canonicalised path back into a resolvable one', () => {
    const page = resolveLandingPath(canonicalizeSegments(['Pachuca']), facets)
    expect(page?.canonical).toBe('/seminuevos/pachuca')
  })

  it('flags only the paths that are not already canonical', () => {
    expect(needsCanonicalRedirect(['Pachuca'])).toBe(true)
    expect(needsCanonicalRedirect(['pachuca'])).toBe(false)
    expect(needsCanonicalRedirect(['pachuca', 'mazda'])).toBe(false)
  })
})

describe('landingCrumbs', () => {
  it('stops at the city on a city page', () => {
    const page = resolveLandingPath(['pachuca'], facets)
    expect(page && landingCrumbs(page)).toEqual([
      { name: 'Inicio', path: '/' },
      { name: 'Seminuevos en Pachuca', path: '/seminuevos/pachuca' },
    ])
  })

  it('adds the brand on a city + brand page', () => {
    const page = resolveLandingPath(['pachuca', 'mazda'], facets)
    expect(page && landingCrumbs(page)).toHaveLength(3)
    expect(page && landingCrumbs(page)[2]).toEqual({
      name: 'Mazda en Pachuca',
      path: '/seminuevos/pachuca/mazda',
    })
  })
})
