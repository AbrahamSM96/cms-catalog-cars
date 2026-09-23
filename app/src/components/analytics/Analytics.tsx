import Script from 'next/script'

import { analyticsTags } from '@/lib/analytics/registry'

/**
 * Analytics
 *
 * Renders the scripts of whichever vendor this deploy is configured with, and
 * nothing at all when there is none. Which vendor that is lives in
 * `lib/analytics/registry.ts`; this component never names one.
 *
 * A server component, so the tag list is resolved while the HTML is built and
 * no provider code ships to the browser beyond the vendor's own script.
 *
 * What this costs the page:
 *
 * - **CLS: zero by construction.** It renders no visible DOM, so there is
 *   nothing that can move once the script arrives.
 * - **LCP: untouched.** `afterInteractive` injects the script client-side after
 *   hydration begins. It is never in the head, never blocks the parser, and
 *   never competes with the hero image for the first connections.
 * - **INP: one script, deliberately.** Only the selected provider loads, so the
 *   main thread is never shared between two vendors. No `preconnect` either —
 *   warming a connection for a script this late in the page would take a slot
 *   away from the images that decide the LCP.
 *
 * Mounted in the `(frontend)` layout only: `/admin` has its own root layout, so
 * the agency browsing its own dashboard never counts as a visit.
 */
export function Analytics(): React.JSX.Element | null {
  const tags = analyticsTags()

  if (tags.length === 0) return null

  return (
    <>
      {tags.map((tag) =>
        tag.inline ? (
          <Script
            dangerouslySetInnerHTML={{ __html: tag.inline }}
            id={tag.id}
            key={tag.id}
            strategy={tag.strategy}
          />
        ) : (
          <Script
            {...tag.attributes}
            id={tag.id}
            key={tag.id}
            src={tag.src}
            strategy={tag.strategy}
          />
        )
      )}
    </>
  )
}
