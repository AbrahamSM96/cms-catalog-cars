// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useOpenStatus, useOpenStatuses } from '@/lib/hours-client'
import type { Dealership, WeeklyHours } from '@/types/car'

// Wed 2024-01-17, 09:00 and 20:00 in America/Mexico_City (UTC-6).
const DURING_HOURS = '2024-01-17T18:00:00Z'
const AFTER_HOURS = '2024-01-18T02:00:00Z'

const HOURS: WeeklyHours = {
  wednesday: { close: '19:00', open: '09:00' },
}

afterEach(() => {
  vi.useRealTimers()
})

/**
 * Freeze the clock at a UTC instant so the status is deterministic.
 *
 * @param iso - ISO 8601 string in UTC (must end with Z).
 */
function setUtcTime(iso: string): void {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

/**
 * Build a dealership, overriding only what a test cares about.
 *
 * @param overrides - Fields to replace on the default document.
 */
function makeDealer(overrides: Partial<Dealership> = {}): Dealership {
  return {
    createdAt: '',
    id: 1,
    name: 'AutoGDL',
    updatedAt: '',
    ...overrides,
  }
}

/**
 * Renders both hooks so a server render can be asserted on their output.
 *
 * @param props - Component props.
 * @param props.dealerships - Dealerships whose statuses should be rendered.
 * @param props.hours - Weekly hours for the single-status hook.
 */
function Probe(props: {
  dealerships: Dealership[]
  hours: WeeklyHours
}): React.JSX.Element {
  const { dealerships, hours } = props
  const status = useOpenStatus(hours)
  const statuses = useOpenStatuses(dealerships)

  return (
    <span>{`${status === null ? 'null' : status.label}:${Object.keys(statuses).length}`}</span>
  )
}

describe('useOpenStatus', () => {
  it('computes the status on the client', () => {
    setUtcTime(DURING_HOURS)

    const { result } = renderHook(() => useOpenStatus(HOURS))
    expect(result.current).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('returns null for a schedule it cannot read', () => {
    setUtcTime(DURING_HOURS)

    const { result } = renderHook(() => useOpenStatus(undefined))
    expect(result.current).toBeNull()
  })

  it('keeps the same reference while the status does not change', () => {
    setUtcTime(DURING_HOURS)

    const { rerender, result } = renderHook(() => useOpenStatus(HOURS))
    const first = result.current
    rerender()

    // Identity matters: `useSyncExternalStore` compares snapshots with
    // `Object.is`, so a fresh object per call would re-render forever.
    expect(result.current).toBe(first)
  })

  it('swaps in a new status once the schedule says otherwise', () => {
    setUtcTime(DURING_HOURS)

    const { rerender, result } = renderHook(() => useOpenStatus(HOURS))
    expect(result.current?.open).toBe(true)

    vi.setSystemTime(new Date(AFTER_HOURS))
    rerender()

    expect(result.current?.open).toBe(false)
  })

  it('unsubscribes cleanly on unmount', () => {
    setUtcTime(DURING_HOURS)

    const { unmount } = renderHook(() => useOpenStatus(HOURS))
    expect(() => unmount()).not.toThrow()
  })
})

describe('useOpenStatuses', () => {
  it('maps every dealership id to its status', () => {
    setUtcTime(DURING_HOURS)

    const dealerships = [
      makeDealer({ hours: HOURS, id: 1 }),
      makeDealer({ hours: undefined, id: 2 }),
    ]

    const { result } = renderHook(() => useOpenStatuses(dealerships))
    expect(result.current['1']?.open).toBe(true)
    expect(result.current['2']).toBeNull()
  })

  it('returns an empty map for no dealerships', () => {
    setUtcTime(DURING_HOURS)

    const { result } = renderHook(() => useOpenStatuses([]))
    expect(result.current).toEqual({})
  })
})

describe('server snapshots', () => {
  it('renders nothing but the empty snapshots on the server', () => {
    setUtcTime(DURING_HOURS)

    // The status depends on the current time, so rendering it on the server
    // would hydrate into a mismatch. Both hooks answer empty there instead.
    const markup = renderToStaticMarkup(
      <Probe dealerships={[makeDealer({ hours: HOURS })]} hours={HOURS} />
    )

    // No status, and no entry for the dealership that has a readable schedule.
    expect(markup).toBe('<span>null:0</span>')
  })
})
