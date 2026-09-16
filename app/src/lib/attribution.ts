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

/** Session storage key holding the serialised `Attribution`. */
const STORAGE_KEY = 'attribution'

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
function hasOrigin(attribution: Attribution): boolean {
  return Boolean(attribution.fbclid ?? attribution.utmSource)
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
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    return parsed as Attribution
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

  if (stored && (hasOrigin(stored) || !hasOrigin(next))) return

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private windows and hardened browser settings make writes throw. A lead
    // without an origin is worth less; a crash on page load is worth nothing.
  }
}
