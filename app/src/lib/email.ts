import type { EmailAdapter, PayloadRequest } from 'payload'

import { formatAdminURL } from 'payload/shared'
import { resendAdapter } from '@payloadcms/email-resend'

/**
 * Outgoing email for the admin panel (Resend HTTP API).
 *
 * Payload only sends transactional mail — the "forgot password" reset link and
 * the verification email — and it needs an email adapter to do it. Without one
 * it silently falls back to its console adapter, which logs the attempt and
 * drops the message, so the reset link never reaches the user.
 *
 * Delivery goes over Resend's REST API on port 443, not SMTP. That is not a
 * preference: Render blocks outbound traffic to ports 25, 465 and 587 on free
 * web services (25 stays blocked on every plan, since they run on EC2), so an
 * SMTP transport dies with ETIMEDOUT on CONN before the handshake and the
 * forgot-password request answers "Something went wrong". HTTPS is never
 * blocked, so this works on any plan.
 *
 * IMPORTANT: the sender address has to belong to a domain verified with Resend
 * (SPF/DKIM records), otherwise the API rejects the message.
 */

/**
 * How long a password-reset token stays valid, in milliseconds. Shared by the
 * Users collection (which enforces it) and the email body (which states it),
 * so the two can never drift apart.
 */
export const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000

/**
 * Build the Resend email adapter, or undefined when it is not configured.
 *
 * Both the API key and the sender address are required: Resend has no default
 * for the `from` field, so an adapter built without one would only fail later,
 * inside the request that tries to send. Undefined leaves Payload on its
 * console adapter, which is the right behaviour for local development.
 */
export function emailAdapter(): EmailAdapter | undefined {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM_ADDRESS

  if (!apiKey || !from) return undefined

  return resendAdapter({
    apiKey,
    defaultFromAddress: from,
    defaultFromName: senderName(),
  })
}

/** Name the transactional emails sign off with. */
const senderName = (): string =>
  process.env.EMAIL_FROM_NAME || 'Admin panel'

/**
 * Build the admin password-reset URL for a token.
 *
 * Mirrors what Payload builds by default: the configured serverURL when there
 * is one, the request origin otherwise.
 *
 * @param req - The Payload request handling the forgot-password operation.
 * @param token - The reset token stored on the user.
 */
function resetURL(req: PayloadRequest, token: string): string {
  const { config } = req.payload
  let origin = config.serverURL
  if (origin === '' && req.url !== undefined) origin = new URL(req.url).origin

  return formatAdminURL({
    adminRoute: config.routes.admin,
    path: `${config.admin.routes.reset}/${token}`,
    serverURL: origin,
  })
}

/**
 * Subject line of the password-reset email.
 */
export function forgotPasswordSubject(): string {
  return `Reset your password — ${senderName()}`
}

/**
 * Body of the password-reset email, with the reset link.
 *
 * Payload types every argument as optional because the same signature is
 * reused across operations, so a missing req or token degrades to a message
 * without a link rather than throwing inside the email send.
 *
 * @param args - Payload's generateEmailHTML arguments.
 * @param args.req - The request handling the forgot-password operation.
 * @param args.token - The reset token stored on the user.
 */
export function forgotPasswordHTML(args?: {
  req?: PayloadRequest
  token?: string
}): string {
  const { req, token } = args ?? {}
  const url = req && token ? resetURL(req, token) : undefined
  const expiration = Math.round(RESET_TOKEN_EXPIRATION / 60_000)

  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
  <p>You received this email because a password reset was requested for your account on ${senderName()}.</p>
  ${url
      ? `<p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Reset password</a></p>
  <p style="font-size:13px;color:#555">If the button does not work, copy and paste this address into your browser:<br /><a href="${url}">${url}</a></p>`
      : '<p>Request the reset again from the panel to get a valid link.</p>'
    }
  <p style="font-size:13px;color:#555">The link expires in ${expiration} minutes and can only be used once.</p>
  <p style="font-size:13px;color:#555">If you did not request this change, ignore this email: your password stays the same.</p>
</div>`
}
