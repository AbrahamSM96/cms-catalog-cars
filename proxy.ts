import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  canonicalizeSegments,
  needsCanonicalRedirect,
} from '@/lib/landing-routes'

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
 * @param request - The incoming request.
 */
export function proxy(request: NextRequest): NextResponse {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean).slice(1)

  if (!needsCanonicalRedirect(segments)) return NextResponse.next()

  const canonical = canonicalizeSegments(segments).filter(Boolean)
  const url = request.nextUrl.clone()
  url.pathname = ['/seminuevos', ...canonical].join('/')

  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: '/seminuevos/:path*',
}
