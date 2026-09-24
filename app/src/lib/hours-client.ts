'use client'

import { useMemo, useSyncExternalStore } from 'react'

import { getOpenStatus, type OpenStatus } from '@/lib/hours'
import type { Dealership, WeeklyHours } from '@/types/car'

// Stable server snapshots: a fresh object per call would break the identity
// check `useSyncExternalStore` runs on every render.
const NO_STATUS = null
const NO_STATUSES: Record<string, OpenStatus | null> = {}

/**
 * The status is read once per mount, so there is nothing to subscribe to.
 *
 * @param _onStoreChange - React's change callback, unused.
 */
function subscribe(_onStoreChange: () => void): () => void {
  return (): void => {}
}

/**
 * `useSyncExternalStore` compares snapshots with `Object.is`, so a fresh object
 * on every call would loop forever. This wraps a compute function so it keeps
 * returning the same reference until the computed value actually changes.
 *
 * @param compute - Produces the value; must be deterministic for a given time.
 */
function cachedSnapshot<T>(compute: () => T): () => T {
  let cached: T
  let cachedKey: string | undefined

  return (): T => {
    const next = compute()
    const key = JSON.stringify(next)
    if (key !== cachedKey) {
      cachedKey = key
      cached = next
    }
    return cached
  }
}

/**
 * Open/closed status of a schedule, computed on the client only.
 *
 * `getOpenStatus` depends on the current time, so it cannot run during SSR
 * without a hydration mismatch. `useSyncExternalStore` renders the server
 * snapshot (`null`) on the server and during hydration, then swaps in the real
 * status — no `setState` inside an effect.
 *
 * @param hours - The weekly schedule to evaluate.
 */
export function useOpenStatus(hours?: WeeklyHours): OpenStatus | null {
  const getSnapshot = useMemo(
    () => cachedSnapshot(() => getOpenStatus(hours)),
    [hours]
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => NO_STATUS)
}

/**
 * Same as {@link useOpenStatus}, but for a list of dealerships: returns a map of
 * dealership id to status (empty on the server and during hydration).
 *
 * @param dealerships - The dealerships to evaluate.
 */
export function useOpenStatuses(
  dealerships: Dealership[]
): Record<string, OpenStatus | null> {
  const getSnapshot = useMemo(
    () =>
      cachedSnapshot(() => {
        const next: Record<string, OpenStatus | null> = {}
        for (const d of dealerships) next[String(d.id)] = getOpenStatus(d.hours)
        return next
      }),
    [dealerships]
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => NO_STATUSES)
}
