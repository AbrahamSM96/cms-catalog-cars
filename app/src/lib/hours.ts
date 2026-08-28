import type { WeekdayKey, WeeklyHours } from '@/types/car'

// Monday-first order so weekday math is consistent.
const ORDER: WeekdayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const LABELS: Record<WeekdayKey, string> = {
  friday: 'viernes',
  monday: 'lunes',
  saturday: 'sábado',
  sunday: 'domingo',
  thursday: 'jueves',
  tuesday: 'martes',
  wednesday: 'miércoles',
}

const TIME_ZONE = 'America/Mexico_City'

export interface OpenStatus {
  open: boolean
  label: 'Abierto' | 'Cerrado'
  /** e.g. "Cierra a las 7:00 p.m." or "Abre mañana a las 9:00 a.m." */
  detail?: string
}

/**
 * Parse "HH:MM" (24h) into minutes since midnight, or null if invalid.
 *
 * @param value - the time string to parse
 */
function parseTime(value?: string): number | null {
  if (!value) return null
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null
  return h * 60 + m
}

/**
 * Format minutes since midnight into "9:00 a.m." (Spanish).
 *
 * @param mins - the minutes since midnight to format
 */
function formatTime(mins: number): string {
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const period = h24 < 12 ? 'a.m.' : 'p.m.'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Current weekday index (0 = Monday) and minutes since midnight, in Mexico time. */
function nowInMexico(): { dayIdx: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: TIME_ZONE,
    weekday: 'long',
  }).formatToParts(new Date())

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Monday'
  let hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  if (hour === 24) hour = 0 // some runtimes emit "24" for midnight

  const jsToKey: Record<string, WeekdayKey> = {
    Friday: 'friday',
    Monday: 'monday',
    Saturday: 'saturday',
    Sunday: 'sunday',
    Thursday: 'thursday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
  }
  const dayIdx = ORDER.indexOf(jsToKey[weekday] ?? 'monday')
  return { dayIdx, minutes: hour * 60 + minute }
}

/**
 * Compute the open/closed status for a weekly schedule.
 * Time-dependent — call from the client (e.g. in a useEffect) to avoid SSR
 * hydration mismatches.
 *
 * @param hours - the weekly schedule to check
 */
export function getOpenStatus(hours?: WeeklyHours): OpenStatus | null {
  if (!hours) return null

  const { dayIdx, minutes } = nowInMexico()
  const todayKey = ORDER[dayIdx]
  const today = hours[todayKey]

  if (today && !today.closed) {
    const open = parseTime(today.open)
    const close = parseTime(today.close)
    if (open !== null && close !== null && close > open) {
      if (minutes < open) {
        return {
          detail: `Abre hoy a las ${formatTime(open)}`,
          label: 'Cerrado',
          open: false,
        }
      }
      if (minutes < close) {
        return {
          detail: `Cierra a las ${formatTime(close)}`,
          label: 'Abierto',
          open: true,
        }
      }
    }
  }

  // Closed now — find the next day with an opening time.
  for (let i = 1; i <= 7; i++) {
    const key = ORDER[(dayIdx + i) % 7]
    const day = hours[key]
    if (day && !day.closed) {
      const open = parseTime(day.open)
      if (open !== null) {
        const when = i === 1 ? 'mañana' : `el ${LABELS[key]}`
        return {
          detail: `Abre ${when} a las ${formatTime(open)}`,
          label: 'Cerrado',
          open: false,
        }
      }
    }
  }

  return { label: 'Cerrado', open: false }
}

/**
 * True if the schedule has at least one usable day (to decide whether to show status).
 *
 * @param hours - the weekly schedule to check
 */
export function hasSchedule(hours?: WeeklyHours): boolean {
  if (!hours) return false
  return ORDER.some((k) => {
    const d = hours[k]
    return d && !d.closed && parseTime(d.open) !== null
  })
}
