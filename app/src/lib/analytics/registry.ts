import type {
  AnalyticsEventData,
  AnalyticsProvider,
  AnalyticsTag,
} from '@/lib/analytics/types'
import { googleAnalyticsProvider } from '@/lib/analytics/google-analytics'
import { umamiProvider } from '@/lib/analytics/umami'

/**
 * Every vendor the site knows how to speak to. Adding one means writing its
 * module and listing it here — nothing else in the app changes.
 */
const PROVIDERS: AnalyticsProvider[] = [googleAnalyticsProvider, umamiProvider]

/**
 * Which of them this deploy uses. Unset means no analytics at all, which is
 * the right default for local development.
 *
 * Read as a module constant rather than inside the function so Next can inline
 * the literal at build time; a computed `process.env[...]` lookup would reach
 * the client bundle as undefined.
 */
const SELECTED = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '')
  .trim()
  .toLowerCase()

/**
 * The provider this deploy is configured with, or null when there is none or
 * the configured name matches nothing.
 *
 * An unknown name degrades to no analytics rather than throwing: a typo in an
 * environment variable should cost the client its traffic report, not its site.
 */
export function resolveAnalyticsProvider(): AnalyticsProvider | null {
  if (!SELECTED) return null

  return PROVIDERS.find((provider) => provider.id === SELECTED) ?? null
}

/**
 * Scripts to put on the page, empty when analytics is off or unconfigured.
 */
export function analyticsTags(): AnalyticsTag[] {
  return resolveAnalyticsProvider()?.tags() ?? []
}

/**
 * Report a custom event to whichever vendor is configured.
 *
 * Never throws and never awaits. Analytics is the least important thing
 * happening on the page: a vendor script that failed to load, or a browser
 * extension that removed it, must not break the interaction the visitor is in
 * the middle of.
 *
 * @param event - Event name, as it should read in the vendor's dashboard.
 * @param data - Optional flat properties to attach.
 */
export function trackEvent(event: string, data?: AnalyticsEventData): void {
  if (typeof window === 'undefined') return

  try {
    resolveAnalyticsProvider()?.track(event, data)
  } catch {
    // Blocked, half-loaded or replaced by an extension. Nothing to do.
  }
}
