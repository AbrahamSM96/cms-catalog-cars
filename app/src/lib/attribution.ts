/**
 * Where a visit came from, captured once per browsing session and attached to
 * every lead that session produces (`lib/lead-actions.ts`).
 *
 * The campaign tags only exist on the URL the visitor first landed on. By the
 * time they tap WhatsApp they have usually moved on to two or three other
 * pages, so reading the tags at that moment returns nothing and every lead ends
 * up labelled "direct". Stashing them on arrival is what keeps the answer to
 * "which ad paid for this lead" available at the end of the visit.
 *
 * `sessionStorage` rather than `localStorage` on purpose: attribution belongs to
 * one visit. Someone who clicked an ad in March should not have a lead sent in
 * June credited to that ad.
 */

/** Llave de la cookie que guarda el `Attribution` serializado. */
export const ATTRIBUTION_COOKIE = 'attribution'

/** Session storage key holding the serialised `Attribution`. */
const STORAGE_KEY = ATTRIBUTION_COOKIE

/**
 * Longest value kept from a query parameter.
 *
 * Nothing legitimate comes close — `fbclid` is the longest real value at around
 * 100 characters. The cap is here because the URL is attacker-controlled and
 * these strings end up in the client's database.
 */
const MAX_LENGTH = 512

export interface Attribution {
  /** Facebook's click identifier, present only on visits from Meta ads. */
  fbclid?: string
  /** Path of the first page of the visit. */
  landingPath: string
  utmCampaign?: string
  utmContent?: string
  utmMedium?: string
  utmSource?: string
}

/**
 * Read one query parameter, trimmed and capped, treating empty as absent.
 *
 * @param params - Parsed query string of the landing URL.
 * @param name - Parameter to read.
 */
function param(params: URLSearchParams, name: string): string | undefined {
  const raw = params.get(name)?.trim()
  if (!raw) return undefined

  return raw.slice(0, MAX_LENGTH)
}

/**
 * Whether this record names a campaign at all, as opposed to a plain visit.
 *
 * @param attribution - The record to inspect.
 */
export function hasOrigin(attribution: Attribution): boolean {
  return Boolean(attribution.fbclid ?? attribution.utmSource)
}

/**
 * Indica si el query string contiene al menos un parámetro de campaña.
 *
 * @param search - Query string, con o sin el `?` inicial.
 */
export function hasCampaignParams(search: string): boolean {
  const params = new URLSearchParams(search)

  return [
    'fbclid',
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
  ].some((name): boolean => params.has(name))
}

/**
 * Serializa la atribución para guardarla en una cookie o en `sessionStorage`.
 *
 * Deliberadamente JSON pelón, sin `encodeURIComponent`: el escape de la cookie
 * lo hace Next al armar `Set-Cookie`, y codificar aquí encima dejaba el valor
 * doble-codificado (`%257B`), que `deserializeAttribution` ya no puede leer.
 *
 * @param attribution - Registro de atribución que se serializará.
 */
export function serializeAttribution(attribution: Attribution): string {
  return JSON.stringify(attribution)
}

/**
 * Lee atribución desde JSON codificado o crudo sin lanzar errores.
 *
 * @param raw - Valor de atribución almacenado.
 */
export function deserializeAttribution(
  raw: string | null | undefined
): Attribution | null {
  if (!raw) return null

  try {
    let decoded = raw

    try {
      decoded = decodeURIComponent(raw)
    } catch {
      decoded = raw
    }

    const parsed: unknown = JSON.parse(decoded)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('landingPath' in parsed) ||
      typeof parsed.landingPath !== 'string'
    ) {
      return null
    }

    return parsed as Attribution
  } catch {
    return null
  }
}

/**
 * Elige el registro de atribución que debe permanecer almacenado.
 *
 * @param props - Registros de atribución existente y entrante.
 * @param props.next - Atribución de la URL de entrada actual.
 * @param props.stored - Atribución ya almacenada para la visita.
 */
export function mergeAttribution(props: {
  next: Attribution
  stored: Attribution | null
}): Attribution | null {
  const { next, stored } = props

  if (stored && (hasOrigin(stored) || !hasOrigin(next))) return null

  return next
}

/**
 * Elige la atribución entre la cookie del servidor y el respaldo del cliente.
 *
 * @param props - Candidatos de atribución del servidor y cliente.
 * @param props.client - Atribución leída del almacenamiento de sesión.
 * @param props.cookie - Atribución leída de la cookie del servidor.
 */
export function pickAttribution(props: {
  client: Attribution | null | undefined
  cookie: Attribution | null
}): Attribution | null {
  const { client, cookie } = props

  // La cookie gana cuando nombra una campaña: la escribió el servidor, así que
  // existe aunque el visitante venga en un webview sin `sessionStorage`.
  let chosen: Attribution | null | undefined = null
  if (cookie && hasOrigin(cookie)) chosen = cookie
  else if (client && hasOrigin(client)) chosen = client
  else chosen = cookie ?? client ?? null

  const other = chosen === cookie ? client : cookie

  if (!chosen) return null
  if (chosen.landingPath || !other?.landingPath) return chosen

  return { ...chosen, landingPath: other.landingPath }
}

/**
 * Build an attribution record from a landing URL.
 *
 * @param props - The landing URL, split.
 * @param props.pathname - Path of the page being visited.
 * @param props.search - Query string, with or without the leading `?`.
 */
export function parseAttribution(props: {
  pathname: string
  search: string
}): Attribution {
  const { pathname, search } = props
  const params = new URLSearchParams(search)

  return {
    fbclid: param(params, 'fbclid'),
    landingPath: pathname.slice(0, MAX_LENGTH),
    utmCampaign: param(params, 'utm_campaign'),
    utmContent: param(params, 'utm_content'),
    utmMedium: param(params, 'utm_medium'),
    utmSource: param(params, 'utm_source'),
  }
}

/**
 * Return the attribution stored for this session, or null when there is none.
 *
 * Returns null rather than throwing on anything unexpected — an unreadable
 * record costs one lead its origin, which is not worth breaking the page the
 * visitor is standing on.
 */
export function readAttribution(): Attribution | null {
  try {
    return deserializeAttribution(window.sessionStorage.getItem(STORAGE_KEY))
  } catch {
    // Corrupt JSON, or a browser that denies storage access outright.
    return null
  }
}

/**
 * Record where this visit came from, keeping the first attributed landing.
 *
 * First touch wins, with one exception: a stored record that names no campaign
 * is replaced by one that does. Without that exception a visitor who opens the
 * homepage and then clicks an ad in the same session stays labelled "direct",
 * and the ad that actually produced the lead goes uncredited.
 *
 * @param props - The landing URL, split.
 * @param props.pathname - Path of the page being visited.
 * @param props.search - Query string, with or without the leading `?`.
 */
export function captureAttribution(props: {
  pathname: string
  search: string
}): void {
  const { pathname, search } = props
  const next = parseAttribution({ pathname, search })
  const stored = readAttribution()
  const merged = mergeAttribution({ next, stored })

  if (!merged) return

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // Private windows and hardened browser settings make writes throw. A lead
    // without an origin is worth less; a crash on page load is worth nothing.
  }
}
