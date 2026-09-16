'use client'

import type { LeadPlacement, LeadSource } from '@/lib/leads'
import { readAttribution } from '@/lib/attribution'
import { recordLead } from '@/lib/lead-actions'

interface LeadLinkProps {
  /** Car in context, when the link sits on a car page. */
  carId?: number | string | null
  children: React.ReactNode
  className?: string
  /** The `wa.me` or `tel:` destination. */
  href: string
  placement: LeadPlacement
  rel?: string
  source: LeadSource
  target?: string
}

/**
 * LeadLink
 *
 * A contact link that records the click before handing the visitor over.
 *
 * Exists so the pages holding these links — the footer, the contact page — can
 * stay server components: only this one anchor has to cross into the client.
 *
 * The click is never awaited and the navigation is never intercepted. The
 * browser follows the `href` as it always would, and the recording rides along
 * behind it. Blocking the tap on a round trip would be a worse site in exchange
 * for a slightly better report.
 *
 * @param props - Component props.
 */
export function LeadLink(props: LeadLinkProps): React.JSX.Element {
  const { carId, children, className, href, placement, rel, source, target } =
    props

  /**
   * Record the click, letting the browser navigate in the same breath.
   */
  const handleClick = (): void => {
    void recordLead({
      attribution: readAttribution(),
      carId,
      placement,
      source,
    })
  }

  return (
    <a
      className={className}
      href={href}
      onClick={handleClick}
      rel={rel}
      target={target}
    >
      {children}
    </a>
  )
}
