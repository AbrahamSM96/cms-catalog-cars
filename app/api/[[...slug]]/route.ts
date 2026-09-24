import {
  REST_DELETE,
  REST_GET,
  REST_PATCH,
  REST_POST,
} from '@payloadcms/next/routes'

import {
  clientIp,
  consumeRateLimit,
  RATE_LIMITS,
  resetRateLimit,
  tooManyRequests,
} from '@/lib/rate-limit'
import configPromise from '@payload-config'

const restPost = REST_POST(configPromise)

/**
 * Rutas de la colección `users` que cuestan caro y se contienen por IP.
 *
 * Las tres gastan recursos aunque el intento falle: `login` y `reset-password`
 * corren bcrypt contra Postgres, y `forgot-password` manda un correo por la API
 * de Resend. Todo lo demás de la API REST pasa sin tocar.
 */
const LIMITED_ROUTES: Record<string, keyof typeof RATE_LIMITS> = {
  'users/forgot-password': 'forgotPassword',
  'users/login': 'login',
  'users/reset-password': 'resetPassword',
}

export const GET = REST_GET(configPromise)
export const DELETE = REST_DELETE(configPromise)
export const PATCH = REST_PATCH(configPromise)

/**
 * La API REST de Payload, con un límite por IP delante del login.
 *
 * El bloqueo propio de Payload (`maxLoginAttempts`) protege UNA cuenta; este
 * protege al servidor. Va aquí, envolviendo el handler, y no en `proxy.ts`,
 * porque el proxy de Next está documentado como una capa que puede ejecutarse
 * fuera del runtime de la app — sin garantía de compartir memoria con ella,
 * que es justo de lo que depende el contador.
 *
 * Un login correcto borra el contador de esa IP: así el mostrador de una
 * agencia, donde varias personas comparten la misma salida a internet, nunca
 * acumula intentos hasta toparse con el límite.
 *
 * @param request - Petición entrante.
 * @param args - Parámetros de ruta que Next inyecta.
 * @param args.params - Parámetros de ruta que Next inyecta.
 */
export async function POST(
  request: Request,
  args: { params: Promise<{ slug?: string[] }> }
): Promise<Response> {
  const { slug } = await args.params
  const action = LIMITED_ROUTES[(slug ?? []).join('/')]

  if (!action) return restPost(request, args)

  const key = `${clientIp(request)}:${action}`
  const { ok, retryAfter } = consumeRateLimit(key, RATE_LIMITS[action])

  if (!ok) return tooManyRequests(retryAfter)

  const response = await restPost(request, args)

  if (response.ok) resetRateLimit(key)

  return response
}
