import { describe, expect, it } from 'vitest'

import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows calls up to the limit', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 1000 })

    expect(limiter.allow('user-1', 0)).toBe(true)
    expect(limiter.allow('user-1', 100)).toBe(true)
    expect(limiter.allow('user-1', 200)).toBe(false)
  })

  it('opens a fresh window once the old one has passed', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 1000 })

    expect(limiter.allow('user-1', 0)).toBe(true)
    expect(limiter.allow('user-1', 500)).toBe(false)
    expect(limiter.allow('user-1', 1000)).toBe(true)
  })

  it('counts each caller separately', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 1000 })

    expect(limiter.allow('user-1', 0)).toBe(true)
    expect(limiter.allow('user-2', 0)).toBe(true)
  })
})
