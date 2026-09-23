/**
 * The contract every analytics vendor is adapted to.
 *
 * The site never talks to a vendor directly. It asks the registry for whatever
 * provider this deploy is configured with, renders the tags it describes, and
 * sends events through `trackEvent`. Swapping Umami for Google Analytics is
 * then one environment variable, not a change to the layout or to any page.
 *
 * Providers are plain modules with no server-only imports, so the same file
 * serves the server component that renders the tags and the client code that
 * fires events.
 */

/**
 * Payload of a custom event.
 *
 * Flat on purpose: every vendor here accepts a single level of key/value pairs
 * and silently drops or stringifies anything nested.
 */
export type AnalyticsEventData = Record<string, boolean | number | string>

/**
 * When the vendor script is allowed to run.
 *
 * `afterInteractive` injects the script client-side once hydration has begun:
 * it is never in the document head, never blocks parsing, and never competes
 * with the LCP image for bandwidth. This is the right default for analytics.
 *
 * `lazyOnload` waits for browser idle. It protects INP on heavy pages at the
 * cost of losing the pageview of a visitor who leaves within a second or two.
 */
export type AnalyticsStrategy = 'afterInteractive' | 'lazyOnload'

/** One `<script>` a provider needs on the page. */
export interface AnalyticsTag {
  /** Extra HTML attributes for the external script, such as `data-*`. */
  attributes?: Record<string, string>
  /** Stable key, used for both React reconciliation and next/script dedupe. */
  id: string
  /** Inline bootstrap source, for vendors that need one (GA4). */
  inline?: string
  /** External script URL. Absent on a pure inline tag. */
  src?: string
  strategy: AnalyticsStrategy
}

/** A vendor adapted to the contract above. */
export interface AnalyticsProvider {
  /** Value of `NEXT_PUBLIC_ANALYTICS_PROVIDER` that selects this provider. */
  id: string
  /** Vendor name, for documentation and error messages. */
  name: string
  /**
   * The tags to render, or an empty array when this deploy has not been given
   * the vendor's site identifier — which is what keeps local development and
   * preview builds out of the client's numbers.
   */
  tags: () => AnalyticsTag[]
  /** Report a custom event. Runs in the browser only. */
  track: (event: string, data?: AnalyticsEventData) => void
}
