'use server'

import { getPayload } from 'payload'

import { buildLeadData, type LeadInput } from '@/lib/leads'
import config from '@payload-config'

/**
 * Record a contact the site produced.
 *
 * Written with the Local API on purpose: the `leads` collection refuses every
 * create that arrives through the REST API, because the button behind a lead is
 * public and an open endpoint would let anyone fill the client's sales report.
 *
 * Never throws and never blocks the click. Callers fire it without awaiting and
 * navigate immediately — awaiting would put a round trip between the tap and
 * WhatsApp, and would cost the `window.open` on the car page its user gesture,
 * which is what keeps popup blockers out of the way. A lead that fails to write
 * is a gap in a report; a button that hesitates is a lost sale.
 *
 * @param props - The click and what is known about the visit.
 */
export async function recordLead(props: LeadInput): Promise<void> {
  const { attribution, carId, placement, source } = props

  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'leads',
      data: buildLeadData({ attribution, carId, placement, source }),
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not record lead')
  }
}
