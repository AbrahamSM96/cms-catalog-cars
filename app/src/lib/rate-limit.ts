/**
 * Límite de peticiones por IP, en memoria del proceso.
 *
 * Existe para proteger el login del admin. El bloqueo que trae Payload
 * (`maxLoginAttempts` en la colección `users`) cuenta intentos POR CUENTA: un
 * atacante que rota correos inventados nunca lo dispara, y aun así el servidor
 * paga un bcrypt y un round-trip a Postgres por cada intento. Contar por IP es
 * lo que corta ese gasto antes de que llegue a Payload.
 *
 * El contador vive en memoria a propósito: no hay Redis en el stack y cada
 * cliente es un servicio de Render distinto, con su propio dominio y su propia
 * base de datos, corriendo un solo proceso. Una IP que golpea el login de un
 * cliente cae siempre en el mismo proceso, así que el Map es la cuenta
 * completa. Deja de serlo el día que un MISMO servicio corra varias instancias
 * (`plan: starter` + `numInstances` > 1): ahí cada una llevaría su propio
 * contador y el límite efectivo se multiplicaría. Esta es la pieza que habría
 * que mover a un almacén compartido; nada más.
 *
 * La ventana es fija, no deslizante: al primer intento se abre una ventana de
 * `windowMs` y todo lo que caiga dentro suma. Más barato y, para frenar fuerza
 * bruta, igual de efectivo.
 */

/** Techo de llaves vivas; evita que un flood de IPs distintas coma memoria. */
export const MAX_TRACKED_KEYS = 10_000

interface RateLimitResult {
  /** `false` cuando la petición excede el límite y debe responder 429. */
  ok: boolean
  /** Segundos que faltan para que la ventana cierre. `0` cuando `ok`. */
  retryAfter: number
}

interface RateLimitRule {
  /** Peticiones permitidas dentro de la ventana. */
  limit: number
  /** Duración de la ventana, en milisegundos. */
  windowMs: number
}

const hits = new Map<string, { count: number; expiresAt: number }>()

/**
 * Reglas por acción. Los números están calibrados para que una persona real
 * nunca los toque: quien se equivoca de contraseña lo hace tres o cuatro veces,
 * no veinte, y el contador se borra al primer login bueno.
 */
export const RATE_LIMITS = {
  /** Correos de recuperación: cada uno gasta cuota de Resend. */
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Login del admin. */
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  /** Canje del token de reseteo. */
  resetPassword: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>

/**
 * Borra las entradas cuya ventana ya cerró.
 *
 * @param now - Marca de tiempo actual, en milisegundos.
 */
function prune(now: number): void {
  for (const [key, entry] of hits) {
    if (entry.expiresAt <= now) hits.delete(key)
  }
}

/**
 * Suma un intento a la llave y dice si todavía cabe dentro del límite.
 *
 * @param key - Identificador del cubo, normalmente `ip:acción`.
 * @param rule - Límite y ventana a aplicar.
 */
export function consumeRateLimit(
  key: string,
  rule: RateLimitRule
): RateLimitResult {
  const now = Date.now()

  if (hits.size >= MAX_TRACKED_KEYS) prune(now)

  const entry = hits.get(key)

  if (!entry || entry.expiresAt <= now) {
    hits.set(key, { count: 1, expiresAt: now + rule.windowMs })
    return { ok: true, retryAfter: 0 }
  }

  entry.count += 1

  if (entry.count > rule.limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
    }
  }

  return { ok: true, retryAfter: 0 }
}

/**
 * Olvida los intentos de una llave. Se llama cuando la acción salió bien, para
 * que una sesión legítima no arrastre el costo de sus propios tropiezos.
 *
 * @param key - La misma llave que se pasó a `consumeRateLimit`.
 */
export function resetRateLimit(key: string): void {
  hits.delete(key)
}

/**
 * Vacía el contador entero. Solo para las pruebas, que comparten el módulo.
 */
export function clearRateLimits(): void {
  hits.clear()
}

/**
 * IP del cliente según los encabezados que pone el proxy de Render.
 *
 * `x-forwarded-for` llega como una lista `cliente, proxy1, proxy2`; el primero
 * es el que interesa. Detrás de un proxy el encabezado es confiable porque lo
 * reescribe él; servido directo sin proxy sería falsificable, y por eso este
 * límite es una barrera de costo, no un control de seguridad — el control es
 * `maxLoginAttempts` de Payload, que sigue intacto.
 *
 * @param request - Petición entrante.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')

  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Respuesta 429 con el `Retry-After` que espera cualquier cliente HTTP.
 *
 * El cuerpo imita la forma `{ errors: [{ message }] }` de Payload para que el
 * admin lo muestre como cualquier otro error de login en vez de reventar.
 *
 * @param retryAfter - Segundos que el cliente debe esperar.
 */
export function tooManyRequests(retryAfter: number): Response {
  return Response.json(
    {
      errors: [
        { message: 'Too many attempts. Please wait and try again later.' },
      ],
    },
    {
      headers: { 'Retry-After': String(retryAfter) },
      status: 429,
    }
  )
}
