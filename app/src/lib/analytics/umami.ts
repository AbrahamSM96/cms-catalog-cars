import type {
  AnalyticsEventData,
  AnalyticsProvider,
  AnalyticsTag,
} from '@/lib/analytics/types'
import { SITE_URL } from '@/lib/seo'

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: AnalyticsEventData) => void
    }
  }
}

/**
 * Identifier of the Umami site this deploy reports to — one per client, since
 * every agency gets its own deploy and nobody should see another's traffic.
 *
 * Read with `||` rather than `??` on purpose: the value is baked in at build
 * time through a Docker ARG, and an ARG the host never supplies arrives as an
 * empty string rather than undefined, which would leave a tracker on the page
 * pointing at no site at all.
 */
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || ''

/** Where the tracker is served from. Only overridden when self-hosting. */
const SRC =
  process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js'

/**
 * The only hostname allowed to report to this site's Umami account.
 *
 * Umami's own `data-domains` check: the script loads everywhere but sends
 * nothing unless `location.hostname` matches. It is the backstop for the cases
 * the NODE_ENV gate in the registry cannot see — a production build run on
 * localhost, a preview deploy on a throwaway URL, or someone serving a copy of
 * the client's site from their own domain.
 *
 * Derived from `NEXT_PUBLIC_SITE_URL` rather than given its own variable: that
 * is already the one value every deploy has to set correctly, and a second
 * variable saying the same thing is a second variable to get wrong.
 *
 * Localhost is excluded outright — nothing served from a developer's machine
 * should ever reach the client's numbers, even in a production build.
 */
const DOMAIN = ((): string => {
  try {
    const { hostname } = new URL(SITE_URL)

    return hostname === 'localhost' ? '' : hostname
  } catch {
    return ''
  }
})()

/**
 * Umami — cookieless, ~2 KB, no consent banner required.
 *
 * It reads the `utm_*` parameters off the landing URL by itself, so the
 * campaign tags `lib/attribution.ts` already stashes for leads double as the
 * traffic source here with no extra tagging.
 */
export const umamiProvider: AnalyticsProvider = {
  id: 'umami',
  name: 'Umami',
  /**
   * AnalyticsTag
   */
  tags: (): AnalyticsTag[] =>
    WEBSITE_ID && DOMAIN
      ? [
        {
          attributes: {
            'data-domains': DOMAIN,
            'data-website-id': WEBSITE_ID,
          },
          id: 'umami',
          src: SRC,
          strategy: 'afterInteractive',
        },
      ]
      : [],
  /**
   * track
   *
   * @param event - The name of the event to track.
   * @param data - Additional data associated with the event.
   */
  track: (event, data): void => {
    window.umami?.track(event, data)
  },
}
