import type { EmailAdapter, PayloadRequest } from 'payload'

import { formatAdminURL } from 'payload/shared'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Outgoing email for the admin panel (SMTP).
 *
 * Payload only sends transactional mail — the "forgot password" reset link and
 * the verification email — and it needs an email adapter to do it. Without one
 * it silently falls back to its console adapter, which logs the attempt and
 * drops the message, so the reset link never reaches the user.
 *
 * The transport is plain SMTP so every deploy can point at whatever provider
 * the dealership already pays for (Resend, Brevo, Mailgun, its own host). All
 * of it comes from the environment: see the SMTP_* block in `.env.example`.
 *
 * IMPORTANT: the sender address has to belong to a domain verified with the
 * provider, otherwise the message is rejected or lands in spam.
 */

/**
 * How long a password-reset token stays valid, in milliseconds. Shared by the
 * Users collection (which enforces it) and the email body (which states it),
 * so the two can never drift apart.
 */
export const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000

/**
 * Build the SMTP email adapter, or undefined when SMTP is not configured.
 *
 * Returning undefined (instead of calling the adapter with no transport) is
 * deliberate: with no arguments nodemailer creates an Ethereal test account on
 * boot, which needs network access and delivers nowhere. Undefined leaves
 * Payload on its console adapter, which is the right behaviour for local
 * development.
 */
export function emailAdapter(): Promise<EmailAdapter> | undefined {
  const host = process.env.SMTP_HOST
  const pass = process.env.SMTP_PASS
  const user = process.env.SMTP_USER

  if (!host || !pass || !user) return undefined

  const port = Number(process.env.SMTP_PORT || 587)

  return nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || user,
    defaultFromName: senderName(),
    transportOptions: {
      auth: { pass, user },
      host,
      port,
      secure: port === 465,
    },
  })
}

/** Name the transactional emails sign off with. */
const senderName = (): string =>
  process.env.SMTP_FROM_NAME || 'Panel de administración'

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
  return `Restablece tu contraseña — ${senderName()}`
}

/**
 * Body of the password-reset email, in Spanish and with the reset link.
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
  <p>Recibiste este correo porque se solicitó restablecer la contraseña de tu cuenta en ${senderName()}.</p>
  ${url
      ? `<p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Restablecer contraseña</a></p>
  <p style="font-size:13px;color:#555">Si el botón no funciona, copia y pega esta dirección en tu navegador:<br /><a href="${url}">${url}</a></p>`
      : '<p>Vuelve a solicitar el restablecimiento desde el panel para obtener un enlace válido.</p>'
    }
  <p style="font-size:13px;color:#555">El enlace caduca en ${expiration} minutos y solo puede usarse una vez.</p>
  <p style="font-size:13px;color:#555">Si no solicitaste este cambio, ignora este correo: tu contraseña seguirá siendo la misma.</p>
</div>`
}
