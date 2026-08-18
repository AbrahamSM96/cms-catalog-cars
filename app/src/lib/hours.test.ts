import { afterEach, describe, expect, it, vi } from 'vitest'

import type { WeeklyHours } from '../types/car'

import { getOpenStatus, hasSchedule } from './hours'

afterEach(() => {
  vi.useRealTimers()
})

/**
 * Helper: set fake time to a specific UTC date/time.
 *
 * @param iso - ISO 8601 string in UTC (must end with Z).
 */
function setUtcTime(iso: string): void {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

describe('getOpenStatus', () => {
  it('returns null when hours is undefined', () => {
    expect(getOpenStatus(undefined)).toBeNull()
  })

  it('returns "Cerrado" before opening time today', () => {
    // Wed 2024-01-17 07:00 UTC → 01:00 CST (before 09:00 open)
    setUtcTime('2024-01-17T07:00:00Z')

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre hoy a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('returns "Abierto" during opening hours', () => {
    // Wed 2024-01-17 16:00 UTC → 10:00 CST (between 09:00 and 19:00)
    setUtcTime('2024-01-17T16:00:00Z')

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('returns "Cerrado" after closing time and shows next day (mañana)', () => {
    // Wed 2024-01-17 23:30 UTC → 17:30 CST (after 17:00 close)
    setUtcTime('2024-01-17T23:30:00Z')

    const hours: WeeklyHours = {
      thursday: { close: '19:00', open: '09:00' },
      wednesday: { close: '17:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre mañana a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('returns next named day when not tomorrow', () => {
    // Fri 2024-01-19 23:30 UTC → 17:30 CST (after 17:00 close)
    setUtcTime('2024-01-19T23:30:00Z')

    const hours: WeeklyHours = {
      friday: { close: '17:00', open: '09:00' },
      monday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre el lunes a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('returns "Cerrado" for a closed day with no valid next day', () => {
    // Wed 2024-01-17 16:00 UTC → 10:00 CST
    setUtcTime('2024-01-17T16:00:00Z')

    const hours: WeeklyHours = {
      wednesday: { closed: true },
    }
    expect(getOpenStatus(hours)).toEqual({
      label: 'Cerrado',
      open: false,
    })
  })

  it('skips days with invalid open time in next-day search', () => {
    // Mon 2024-01-15 23:30 UTC → 17:30 CST (after 17:00 close)
    setUtcTime('2024-01-15T23:30:00Z')

    const hours: WeeklyHours = {
      monday: { close: '17:00', open: '09:00' },
      tuesday: { close: '19:00', open: '25:00' }, // invalid open time
      wednesday: { close: '19:00', open: '09:00' },
    }
    // tuesday open is invalid (25:00), so it's skipped; wednesday found at i=2
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre el miércoles a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('wraps around the week (Sunday → Monday)', () => {
    // Sun 2024-01-21 23:30 UTC → 17:30 CST (after 17:00 close)
    setUtcTime('2024-01-21T23:30:00Z')

    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '09:00' },
      sunday: { close: '17:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre mañana a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('returns "Cerrado" when no days have valid hours', () => {
    setUtcTime('2024-01-17T16:00:00Z')

    const hours: WeeklyHours = {
      friday: { closed: true },
      monday: { closed: true },
      saturday: { closed: true },
      sunday: { closed: true },
      thursday: { closed: true },
      tuesday: { closed: true },
      wednesday: { closed: true },
    }
    expect(getOpenStatus(hours)).toEqual({
      label: 'Cerrado',
      open: false,
    })
  })

  it('handles empty schedule (no days defined)', () => {
    setUtcTime('2024-01-17T16:00:00Z')

    expect(getOpenStatus({})).toEqual({
      label: 'Cerrado',
      open: false,
    })
  })

  it('skips days with empty open time (parseTime returns null)', () => {
    // Wed 2024-01-17 16:00 UTC → 10:00 CST
    setUtcTime('2024-01-17T16:00:00Z')

    const hours: WeeklyHours = {
      friday: { closed: true },
      monday: { closed: true },
      saturday: { closed: true },
      sunday: { closed: true },
      thursday: { closed: true },
      tuesday: { closed: true },
      wednesday: { close: '17:00', open: '' },
    }
    expect(getOpenStatus(hours)).toEqual({
      label: 'Cerrado',
      open: false,
    })
  })

  it('formats noon time correctly (12 p.m.)', () => {
    // Wed 2024-01-17 17:30 UTC → 11:30 CST (between 12:00 and 19:00)
    setUtcTime('2024-01-17T18:30:00Z')

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '12:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('formats midnight open time correctly (12 a.m.)', () => {
    // Thu 2024-01-18 06:30 UTC → 00:30 CST (between 00:00 and 09:00)
    setUtcTime('2024-01-18T06:30:00Z')

    const hours: WeeklyHours = {
      thursday: { close: '09:00', open: '00:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 9:00 a.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('shows "Abre hoy a las 12:00 p.m." before noon opening', () => {
    // Wed 2024-01-17 17:00 UTC → 11:00 CST (before 12:00 open)
    setUtcTime('2024-01-17T17:00:00Z')

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '12:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre hoy a las 12:00 p.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('shows "Abre hoy a las 12:00 a.m." before midnight opening', () => {
    // Thu 2024-01-18 05:00 UTC → 23:00 CST Wed (before 00:00 Thu open)
    // Actually Wed 23:00 is before Thu 00:00, so it should say "Abre mañana..."
    setUtcTime('2024-01-18T05:00:00Z')

    const hours: WeeklyHours = {
      thursday: { close: '09:00', open: '00:00' },
    }
    // Wed 23:00 CST → dayIdx=2 (wednesday), wednesday has no hours
    // next day is thursday with open 00:00
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre mañana a las 12:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('returns "Cerrado" when close <= open (invalid schedule today)', () => {
    // Wed 2024-01-17 16:00 UTC → 10:00 CST
    setUtcTime('2024-01-17T16:00:00Z')

    const hours: WeeklyHours = {
      friday: { closed: true },
      monday: { closed: true },
      saturday: { closed: true },
      sunday: { closed: true },
      thursday: { closed: true },
      tuesday: { closed: true },
      wednesday: { close: '08:00', open: '25:00' }, // invalid open time
    }
    // Falls through to next-day search; all other days closed → Cerrado
    expect(getOpenStatus(hours)).toEqual({
      label: 'Cerrado',
      open: false,
    })
  })
})

describe('hasSchedule', () => {
  it('returns false for undefined hours', () => {
    expect(hasSchedule(undefined)).toBe(false)
  })

  it('returns true when at least one day has valid open time', () => {
    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '09:00' },
    }
    expect(hasSchedule(hours)).toBe(true)
  })

  it('returns false when all days are closed', () => {
    const hours: WeeklyHours = {
      monday: { closed: true },
      tuesday: { closed: true },
    }
    expect(hasSchedule(hours)).toBe(false)
  })

  it('returns false when open time is invalid (hour > 23)', () => {
    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '25:00' },
    }
    expect(hasSchedule(hours)).toBe(false)
  })

  it('returns false when open time is invalid (min > 59)', () => {
    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '09:61' },
    }
    expect(hasSchedule(hours)).toBe(false)
  })

  it('returns false when open time format is invalid', () => {
    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '9am' },
    }
    expect(hasSchedule(hours)).toBe(false)
  })

  it('returns false for empty schedule', () => {
    expect(hasSchedule({})).toBe(false)
  })

  it('returns true for a valid day even if others are closed', () => {
    const hours: WeeklyHours = {
      friday: { closed: true },
      monday: { close: '19:00', open: '09:00' },
      tuesday: { closed: true },
    }
    expect(hasSchedule(hours)).toBe(true)
  })
})

describe('nowInMexico defensive branches', () => {
  afterEach(() => {
    // Fully restore the real Intl (not just DateTimeFormat) so nothing leaks.
    vi.unstubAllGlobals()
  })

  it('falls back to "Monday" when weekday part is missing', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-17T15:00:00Z'))
    vi.stubGlobal('Intl', {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'hour', value: '10' },
            { type: 'minute', value: '00' },
          ],
        }
      },
    })

    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('falls back to "0" when hour part is missing', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-17T15:00:00Z'))
    vi.stubGlobal('Intl', {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'weekday', value: 'Wednesday' },
            { type: 'minute', value: '00' },
          ],
        }
      },
    })

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre hoy a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('falls back to "0" when minute part is missing', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-17T15:00:00Z'))
    vi.stubGlobal('Intl', {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'weekday', value: 'Wednesday' },
            { type: 'hour', value: '10' },
          ],
        }
      },
    })

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })

  it('treats hour "24" as 0 (midnight)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-17T15:00:00Z'))
    vi.stubGlobal('Intl', {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'hour', value: '24' },
            { type: 'minute', value: '00' },
            { type: 'weekday', value: 'Wednesday' },
          ],
        }
      },
    })

    const hours: WeeklyHours = {
      wednesday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Abre hoy a las 9:00 a.m.',
      label: 'Cerrado',
      open: false,
    })
  })

  it('falls back to "monday" for unknown weekday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-17T15:00:00Z'))
    vi.stubGlobal('Intl', {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'hour', value: '10' },
            { type: 'minute', value: '00' },
            { type: 'weekday', value: 'Funday' },
          ],
        }
      },
    })

    const hours: WeeklyHours = {
      monday: { close: '19:00', open: '09:00' },
    }
    expect(getOpenStatus(hours)).toEqual({
      detail: 'Cierra a las 7:00 p.m.',
      label: 'Abierto',
      open: true,
    })
  })
})
