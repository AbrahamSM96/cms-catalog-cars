import type { Attribution } from '@/lib/attribution'
import type { Lead } from '@/payload-types'

/**
 * Shaping a lead before it is written.
 *
 * Kept apart from `lib/lead-actions.ts` because that file is a `'use server'`
 * module, and those may export nothing but async functions — so the types and
 * the mapping, which are the parts worth testing, have to live here.
 */

/** Which button on the site produced the lead. */
export type LeadPlacement = NonNullable<Lead['placement']>

/** How the visitor chose to get in touch. */
export type LeadSource = NonNullable<Lead['source']>

export interface LeadInput {
  /** Origin of the visit, as captured on arrival. Null when unavailable. */
  attribution?: Attribution | null
  /** Car in context, when the lead came from a car page. */
  carId?: number | string | null
  placement: LeadPlacement
  source: LeadSource
}

export interface LeadData {
  car: number | string | null
  fbclid: string | null
  landingPath: string | null
  placement: LeadPlacement
  source: LeadSource
  status: 'new'
  utmCampaign: string | null
  utmContent: string | null
  utmMedium: string | null
  utmSource: string | null
}

/**
 * Flatten a click plus its session attribution into the row to be written.
 *
 * Every optional value lands as an explicit `null` rather than being left out,
 * so a lead with no campaign reads as "we looked and there was nothing" instead
 * of leaving the reader wondering whether the field was ever captured.
 *
 * @param props - The click and what is known about the visit.
 */
export function buildLeadData(props: LeadInput): LeadData {
  const { attribution, carId, placement, source } = props

  return {
    car: carId ?? null,
    fbclid: attribution?.fbclid ?? null,
    landingPath: attribution?.landingPath ?? null,
    placement,
    source,
    status: 'new',
    utmCampaign: attribution?.utmCampaign ?? null,
    utmContent: attribution?.utmContent ?? null,
    utmMedium: attribution?.utmMedium ?? null,
    utmSource: attribution?.utmSource ?? null,
  }
}
