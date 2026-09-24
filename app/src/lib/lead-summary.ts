import type { Lead } from '@/payload-types'

/**
 * Turning a list of leads into the two answers the panel above the list is
 * there to give: which campaigns are producing contacts, and which cars are
 * being asked about.
 *
 * Counted here rather than in the database because the numbers are small — a
 * lot receives tens of contacts a month, not millions — and a single indexed
 * read beats teaching the query layer to group.
 */

/** How many rows a breakdown shows before the tail is folded into one. */
const TOP_N = 5

export interface LeadTally {
  count: number
  label: string
}

export interface LeadSummary {
  byCar: LeadTally[]
  bySource: LeadTally[]
}

/** The only two fields of a lead this summary reads. */
export interface LeadLike {
  car?: Lead['car']
  utmSource?: string | null
}

/**
 * Name a car the way the panel should list it.
 *
 * Returns null for a lead with no car, which is not a missing value but a
 * contact that never had one: the footer and navbar buttons sit on every page.
 *
 * @param car - The lead's car relationship, resolved or not.
 */
function carLabel(car: LeadLike['car']): string | null {
  if (!car) return null
  if (typeof car === 'number') return `#${String(car)}`

  return car.title || `#${String(car.id)}`
}

/**
 * Name the campaign a visit came from, falling back for visits with none.
 *
 * @param utmSource - The stored source, possibly absent or blank.
 * @param fallback - Label for a visit that carried no campaign.
 */
function sourceLabel(
  utmSource: string | null | undefined,
  fallback: string
): string {
  return utmSource?.trim() || fallback
}

/**
 * Count occurrences and return the largest few, tail folded into one row.
 *
 * Ties break alphabetically so the order does not shuffle between two reads of
 * the same data.
 *
 * @param entries - One label per lead.
 * @param otherLabel - Row name for everything past the top few.
 */
function tally(entries: string[], otherLabel: string): LeadTally[] {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    counts.set(entry, (counts.get(entry) ?? 0) + 1)
  }

  const sorted = [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label)
    )

  if (sorted.length <= TOP_N) return sorted

  const rest = sorted.slice(TOP_N).reduce((total, row) => total + row.count, 0)

  return [...sorted.slice(0, TOP_N), { count: rest, label: otherLabel }]
}

/**
 * Break a period's leads down by campaign and by car.
 *
 * @param props - Inputs.
 * @param props.leads - The leads of the period.
 * @param props.otherLabel - Row name for everything past the top few.
 * @param props.unattributedLabel - Row name for visits with no campaign.
 */
export function summariseLeads(props: {
  leads: LeadLike[]
  otherLabel: string
  unattributedLabel: string
}): LeadSummary {
  const { leads, otherLabel, unattributedLabel } = props

  const cars = leads
    .map((lead) => carLabel(lead.car))
    .filter((label): label is string => label !== null)

  const sources = leads.map((lead) =>
    sourceLabel(lead.utmSource, unattributedLabel)
  )

  return {
    byCar: tally(cars, otherLabel),
    bySource: tally(sources, otherLabel),
  }
}
