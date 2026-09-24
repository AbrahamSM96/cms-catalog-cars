import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clearRateLimits,
  clientIp,
  consumeRateLimit,
  MAX_TRACKED_KEYS,
  RATE_LIMITS,
  resetRateLimit,
  tooManyRequests,
} from './rate-limit'

const RULE = { limit: 3, windowMs: 1000 }

/**
 * Build a request carrying only the headers a test cares about.
 *
 * @param headers - Headers to send.
 */
function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/users/login', {
    headers,
    method: 'POST',
  })
}

afterEach(() => {
  clearRateLimits()
  vi.useRealTimers()
})

describe('consumeRateLimit', () => {
  it('allows exactly `limit` attempts, then blocks', () => {
    for (let attempt = 0; attempt < RULE.limit; attempt++) {
      expect(consumeRateLimit('ip:login', RULE).ok).toBe(true)
    }

    expect(consumeRateLimit('ip:login', RULE).ok).toBe(false)
  })

  it('reports the seconds left in the window', () => {
    vi.useFakeTimers()

    for (let attempt = 0; attempt < RULE.limit; attempt++) {
      consumeRateLimit('ip:login', RULE)
    }

    vi.advanceTimersByTime(400)

    expect(consumeRateLimit('ip:login', RULE).retryAfter).toBe(1)
  })

  it('opens a fresh window once the old one closes', () => {
    vi.useFakeTimers()

    for (let attempt = 0; attempt < RULE.limit + 1; attempt++) {
      consumeRateLimit('ip:login', RULE)
    }

    vi.advanceTimersByTime(RULE.windowMs + 1)

    expect(consumeRateLimit('ip:login', RULE).ok).toBe(true)
  })

  it('counts each key separately', () => {
    for (let attempt = 0; attempt < RULE.limit + 1; attempt++) {
      consumeRateLimit('a:login', RULE)
    }

    expect(consumeRateLimit('b:login', RULE).ok).toBe(true)
  })

  // Una agencia entera sale a internet por la misma IP. Sin este reset, el
  // primer usuario que se equivoca consume la cuota de todo el mostrador.
  it('forgets the attempts of a key that is reset', () => {
    for (let attempt = 0; attempt < RULE.limit; attempt++) {
      consumeRateLimit('ip:login', RULE)
    }

    resetRateLimit('ip:login')

    expect(consumeRateLimit('ip:login', RULE).ok).toBe(true)
  })
})

// El pruning solo corre al tocar el techo de llaves, que es justo el escenario
// de un flood de IPs distintas: si se llevara por delante las ventanas vivas,
// el atacante se limpiaría su propio contador llenando el Map.
describe('pruning at MAX_TRACKED_KEYS', () => {
  it('drops expired keys but keeps the ones still inside their window', () => {
    vi.useFakeTimers()

    const survivor = { limit: 1, windowMs: 60 * 60 * 1000 }

    expect(consumeRateLimit('survivor', survivor).ok).toBe(true)

    for (let index = 0; index < MAX_TRACKED_KEYS - 1; index++) {
      consumeRateLimit(`flood-${index}`, RULE)
    }

    vi.advanceTimersByTime(RULE.windowMs + 1)

    // Esta llamada encuentra el Map lleno y dispara el prune.
    expect(consumeRateLimit('trigger', RULE).ok).toBe(true)

    // 'survivor' conservó su intento: un segundo consumo excede su límite de 1.
    // Si el prune lo hubiera borrado, esto abriría ventana nueva y daría `true`.
    expect(consumeRateLimit('survivor', survivor).ok).toBe(false)

    // Y una llave vencida sí desapareció: vuelve a entrar con ventana limpia.
    expect(consumeRateLimit('flood-0', RULE).ok).toBe(true)
  })
})

describe('clientIp', () => {
  it('takes the client entry of a proxy chain', () => {
    const request = makeRequest({
      'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2',
    })

    expect(clientIp(request)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip', () => {
    expect(clientIp(makeRequest({ 'x-real-ip': '203.0.113.9' }))).toBe(
      '203.0.113.9'
    )
  })

  // Un encabezado vacío no debe producir la llave '', que agruparía a todo el
  // tráfico anónimo en un solo cubo compartido con las peticiones sin proxy.
  it('falls back when the forwarded header is blank', () => {
    expect(clientIp(makeRequest({ 'x-forwarded-for': '' }))).toBe('unknown')
    expect(clientIp(makeRequest({ 'x-forwarded-for': ' , 10.0.0.1' }))).toBe(
      'unknown'
    )
  })

  it('falls back when no proxy header arrives', () => {
    expect(clientIp(makeRequest())).toBe('unknown')
  })
})

describe('tooManyRequests', () => {
  it('answers 429 with Retry-After and a Payload-shaped body', async () => {
    const response = tooManyRequests(42)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('42')

    const body = (await response.json()) as { errors: { message: string }[] }

    expect(body.errors[0]?.message).toContain('Too many attempts')
  })
})

describe('RATE_LIMITS', () => {
  // El login del admin es el que un ataque golpea; si alguien lo afloja hasta
  // volverlo decorativo, esta prueba lo dice.
  it('keeps the login limit tight enough to matter', () => {
    expect(RATE_LIMITS.login.limit).toBeLessThanOrEqual(10)
    expect(RATE_LIMITS.login.windowMs).toBeGreaterThanOrEqual(5 * 60 * 1000)
  })
})
