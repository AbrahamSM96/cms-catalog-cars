import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  type Attribution,
  ATTRIBUTION_COOKIE,
  deserializeAttribution,
  hasCampaignParams,
  mergeAttribution,
  parseAttribution,
  serializeAttribution,
} from '@/lib/attribution'
import {
  canonicalizeSegments,
  needsCanonicalRedirect,
} from '@/lib/landing-routes'

/**
 * Construye la atribución a partir de la URL de la solicitud.
 *
 * @param request - Solicitud entrante con la URL de aterrizaje.
 */
function buildAttribution(request: NextRequest): Attribution {
  return parseAttribution({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  })
}

/**
 * Aplica atribución del servidor cuando la URL nombra una campaña.
 *
 * @param response - Respuesta que se devolverá al visitante.
 * @param request - Solicitud entrante con URL y cookies.
 */
function applyAttributionCookie(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  // Evita Set-Cookie en requests sin campaña para no ensuciar su caché.
  if (!hasCampaignParams(request.nextUrl.search)) return response

  const next = buildAttribution(request)
  const stored = deserializeAttribution(
    request.cookies.get(ATTRIBUTION_COOKIE)?.value
  )
  const attribution = mergeAttribution({ next, stored })

  if (!attribution) return response

  // Treinta días es una ventana estándar de atribución.
  // Es httpOnly porque solo el servidor la usa; el cliente conserva
  // sessionStorage. El valor va codificado: el JSON crudo trae comillas y comas
  // que rompen la cabecera `Set-Cookie`.
  response.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attribution), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}

/**
 * Send every spelling of a landing URL to the one it is published at.
 *
 * `/seminuevos/Pachuca` and `/seminuevos/pachuca` are the same page, and only
 * one of them may answer with content — otherwise the same list of cars lives
 * at two URLs and search engines split the authority between them.
 *
 * This runs here, before the route renders, because it is the only place that
 * can answer with a real 308. The same `permanentRedirect` thrown from inside
 * the page degrades into a client-side redirect: Next has already begun
 * streaming the response, so the status line is gone and what arrives is a 200
 * carrying a redirect instruction — which a crawler does not follow the way it
 * follows a 308.
 *
 * Normalising is deliberately all this does. Whether the normalised path exists
 * is the page's business: a path that resolves to nothing already answers
 * `noindex`, so redirecting to it costs nothing and keeps the database out of
 * the request path.
 *
 * Desde que el `matcher` corre en todas las páginas (para leer los UTM), la
 * canonicalización tiene que comprobar el prefijo ella misma: sin esa guarda,
 * `/catalogo/Mazda` entraba aquí, `slice(1)` dejaba `['Mazda']` y la respuesta
 * era un 308 a `/seminuevos/mazda`.
 *
 * @param request - The incoming request.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const isLanding =
    pathname === '/seminuevos' || pathname.startsWith('/seminuevos/')
  const segments = pathname.split('/').filter(Boolean).slice(1)

  if (!isLanding || !needsCanonicalRedirect(segments)) {
    return applyAttributionCookie(NextResponse.next(), request)
  }

  const canonical = canonicalizeSegments(segments).filter(Boolean)
  const url = request.nextUrl.clone()
  url.pathname = ['/seminuevos', ...canonical].join('/')

  return applyAttributionCookie(NextResponse.redirect(url, 308), request)
}

export const config = {
  matcher:
    '/((?!_next(?:/|$)|api(?:/|$)|admin(?:/|$)|media(?:/|$)|maplibre(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|.*\\.[^/]+$).*)',
}
