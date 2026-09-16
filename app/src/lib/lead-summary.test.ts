import { describe, expect, it } from 'vitest'

import type { LeadLike } from '@/lib/lead-summary'
import { summariseLeads } from '@/lib/lead-summary'

const LABELS = { otherLabel: 'Otros', unattributedLabel: 'Directo' }

/**
 * Build a car relationship as Payload resolves it at depth 1.
 *
 * @param id - The car id.
 * @param title - The display title the save hook wrote, if any.
 */
function car(id: number, title?: string): NonNullable<LeadLike['car']> {
  return { id, title } as NonNullable<LeadLike['car']>
}

describe('summariseLeads', () => {
  it('counts campaigns, biggest first', () => {
    const { bySource } = summariseLeads({
      leads: [
        { utmSource: 'facebook' },
        { utmSource: 'facebook' },
        { utmSource: 'instagram' },
      ],
      ...LABELS,
    })

    expect(bySource).toEqual([
      { count: 2, label: 'facebook' },
      { count: 1, label: 'instagram' },
    ])
  })

  it('files a visit with no campaign under the fallback label', () => {
    const { bySource } = summariseLeads({
      leads: [{ utmSource: null }, { utmSource: '   ' }, {}],
      ...LABELS,
    })

    expect(bySource).toEqual([{ count: 3, label: 'Directo' }])
  })

  it('trims the stored campaign name', () => {
    const { bySource } = summariseLeads({
      leads: [{ utmSource: ' facebook ' }],
      ...LABELS,
    })

    expect(bySource).toEqual([{ count: 1, label: 'facebook' }])
  })

  it('breaks a tie alphabetically so the order never shuffles', () => {
    const { bySource } = summariseLeads({
      leads: [{ utmSource: 'tiktok' }, { utmSource: 'facebook' }],
      ...LABELS,
    })

    expect(bySource.map((row) => row.label)).toEqual(['facebook', 'tiktok'])
  })

  it('folds everything past the top five into one row', () => {
    const { bySource } = summariseLeads({
      leads: [
        { utmSource: 'a' },
        { utmSource: 'a' },
        { utmSource: 'b' },
        { utmSource: 'c' },
        { utmSource: 'd' },
        { utmSource: 'e' },
        { utmSource: 'f' },
        { utmSource: 'g' },
      ],
      ...LABELS,
    })

    expect(bySource).toHaveLength(6)
    expect(bySource.at(-1)).toEqual({ count: 2, label: 'Otros' })
  })

  it('names cars by their title', () => {
    const { byCar } = summariseLeads({
      leads: [
        { car: car(1, 'Mazda CX-5 2021') },
        { car: car(1, 'Mazda CX-5 2021') },
        { car: car(2, 'Nissan Versa 2020') },
      ],
      ...LABELS,
    })

    expect(byCar).toEqual([
      { count: 2, label: 'Mazda CX-5 2021' },
      { count: 1, label: 'Nissan Versa 2020' },
    ])
  })

  it('falls back to the id for a car saved before the title hook ran', () => {
    const { byCar } = summariseLeads({
      leads: [{ car: car(7) }],
      ...LABELS,
    })

    expect(byCar).toEqual([{ count: 1, label: '#7' }])
  })

  it('labels an unresolved car relationship by its id', () => {
    const { byCar } = summariseLeads({ leads: [{ car: 9 }], ...LABELS })

    expect(byCar).toEqual([{ count: 1, label: '#9' }])
  })

  // The footer and navbar buttons sit on every page, so these leads never had
  // a car — they are not cars missing from the breakdown.
  it('leaves leads with no car out of the car breakdown', () => {
    const { byCar, bySource } = summariseLeads({
      leads: [{ car: null, utmSource: 'facebook' }, { utmSource: 'facebook' }],
      ...LABELS,
    })

    expect(byCar).toEqual([])
    expect(bySource).toEqual([{ count: 2, label: 'facebook' }])
  })

  it('returns empty breakdowns for an empty period', () => {
    expect(summariseLeads({ leads: [], ...LABELS })).toEqual({
      byCar: [],
      bySource: [],
    })
  })
})
