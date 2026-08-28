import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import {
  emailAdapter,
  forgotPasswordHTML,
  forgotPasswordSubject,
} from '@/lib/email'

/**
 * Minimal stand-in for the request Payload hands to generateEmailHTML — only
 * the config bits the reset URL is built from.
 *
 * @param serverURL - Configured serverURL ('' means "use the request origin").
 */
function fakeRequest(serverURL: string): PayloadRequest {
  return {
    payload: {
      config: {
        admin: { routes: { reset: '/reset' } },
        routes: { admin: '/admin' },
        serverURL,
      },
    },
    url: 'https://agencia.test/api/users/forgot-password',
  } as unknown as PayloadRequest
}

describe('emailAdapter', () => {
  it('stays undefined when Resend is not configured, so Payload keeps its console adapter', () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('EMAIL_FROM_ADDRESS', '')

    expect(emailAdapter()).toBeUndefined()
  })

  it('stays undefined without a sender address, which Resend has no default for', () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('EMAIL_FROM_ADDRESS', '')

    expect(emailAdapter()).toBeUndefined()
  })

  it('builds the adapter once key and sender are both present', () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('EMAIL_FROM_ADDRESS', 'no-reply@agencia.test')

    expect(emailAdapter()).toBeDefined()
  })
})

describe('forgotPasswordSubject', () => {
  it('names the sender', () => {
    vi.stubEnv('EMAIL_FROM_NAME', 'Autos del Valle')

    expect(forgotPasswordSubject()).toContain('Autos del Valle')
  })
})

describe('forgotPasswordHTML', () => {
  it('links to the admin reset route on the configured serverURL', () => {
    const html = forgotPasswordHTML({
      req: fakeRequest('https://midominio.com'),
      token: 'abc123',
    })

    expect(html).toContain('https://midominio.com/admin/reset/abc123')
  })

  it('falls back to the request origin when serverURL is empty', () => {
    const html = forgotPasswordHTML({
      req: fakeRequest(''),
      token: 'abc123',
    })

    expect(html).toContain('https://agencia.test/admin/reset/abc123')
  })

  it('degrades to a linkless message instead of throwing without a token', () => {
    const html = forgotPasswordHTML({ req: fakeRequest('https://x.test') })

    expect(html).not.toContain('/reset/')
    expect(html).toContain('Request the reset again')
  })

  it('survives being called with no arguments at all', () => {
    expect(() => forgotPasswordHTML()).not.toThrow()
  })
})
