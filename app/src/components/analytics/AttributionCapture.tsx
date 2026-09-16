'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { captureAttribution } from '@/lib/attribution'

/**
 * AttributionCapture
 *
 * Stashes the campaign tags of the landing URL so the lead sent at the end of
 * the visit can say which ad produced it. See `lib/attribution.ts` for why this
 * has to happen on arrival rather than at the moment the lead is sent.
 *
 * Renders nothing and runs after paint, so it cannot slow the page down or
 * shift anything on it. Mounted in the frontend layout inside `<Suspense>`,
 * which `useSearchParams` requires.
 */
export function AttributionCapture(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    captureAttribution({ pathname, search: searchParams.toString() })
  }, [pathname, searchParams])

  return null
}
