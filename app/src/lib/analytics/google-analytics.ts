import type { AnalyticsProvider, AnalyticsTag } from '@/lib/analytics/types'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** GA4 measurement id, e.g. `G-XXXXXXXXXX`. */
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

/**
 * Shape a GA4 measurement id has to match before it is interpolated into the
 * inline bootstrap below.
 *
 * The value is operator-controlled, not visitor-controlled, so this is not a
 * defence against an attacker — it is a defence against a typo or a stray
 * quote turning the whole inline script into a syntax error that silently
 * takes analytics down on every page.
 */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/

/**
 * Google Analytics 4.
 *
 * Two tags, because gtag.js cannot configure itself: the loader, and an inline
 * bootstrap that creates the `dataLayer` queue and names the property. Both run
 * `afterInteractive`, so neither is in the head and neither blocks the render.
 *
 * Worth knowing before switching a client to this: gtag.js is roughly fifty
 * times the size of Umami's tracker and does use cookies, which means the site
 * then needs a consent banner and a matching privacy notice.
 */
export const googleAnalyticsProvider: AnalyticsProvider = {
  id: 'google',
  name: 'Google Analytics 4',
  /**
   * Analytics tags for Google Analytics 4.
   */
  tags: (): AnalyticsTag[] => {
    if (!MEASUREMENT_ID_PATTERN.test(MEASUREMENT_ID)) return []

    return [
      {
        id: 'ga4-loader',
        src: `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`,
        strategy: 'afterInteractive',
      },
      {
        id: 'ga4-config',
        inline: [
          'window.dataLayer=window.dataLayer||[];',
          'function gtag(){dataLayer.push(arguments)}',
          "gtag('js',new Date());",
          `gtag('config','${MEASUREMENT_ID}');`,
        ].join(''),
        strategy: 'afterInteractive',
      },
    ]
  },
  /**
   * Track an event with Google Analytics 4.
   *
   * @param event - The name of the event to track.
   * @param data - Additional data associated with the event.
   */
  track: (event, data): void => {
    window.gtag?.('event', event, data)
  },
}
