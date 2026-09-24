import { googleAnalyticsProvider } from '@/lib/analytics/google-analytics'
import type {
  AnalyticsEventData,
  AnalyticsProvider,
  AnalyticsTag,
} from '@/lib/analytics/types'
import { umamiProvider } from '@/lib/analytics/umami'

/**
 * Every vendor the site knows how to speak to. Adding one means writing its
 * module and listing it here — nothing else in the app changes.
 */
const PROVIDERS: AnalyticsProvider[] = [googleAnalyticsProvider, umamiProvider]

/**
 * Which of them this deploy uses. Unset means no analytics at all.
 *
 * Read as a module constant rather than inside the function so Next can inline
 * the literal at build time; a computed `process.env[...]` lookup would reach
 * the client bundle as undefined.
 */
const SELECTED = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '')
  .trim()
  .toLowerCase()

/**
 * Analytics runs in production builds only.
 *
 * Without this, working on the site with a real `.env` — the same file that
 * holds the client's site identifier — files every page reload under `bun dev`
 * as a visit, and the client's traffic report becomes the developer's browsing
 * history. Keeping the identifier out of the local `.env` would also work, but
 * relies on remembering; this does not.
 *
 * `next dev` sets NODE_ENV to development, so the check costs nothing at run
 * time: the whole branch is folded away when the production bundle is built.
 *
 * It does not cover a production build run locally, or a preview deploy on a
 * throwaway URL. That is what the domain check in the provider is for.
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * The provider this deploy is configured with, or null when this is not a
 * production build, when none is configured, or when the configured name
 * matches nothing.
 *
 * An unknown name degrades to no analytics rather than throwing: a typo in an
 * environment variable should cost the client its traffic report, not its site.
 */
export function resolveAnalyticsProvider(): AnalyticsProvider | null {
  if (!IS_PRODUCTION || !SELECTED) return null

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
