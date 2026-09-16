import type { LeadTally } from '@/lib/lead-summary'

interface LeadsBreakdownProps {
  /** Shown when the breakdown has no rows. */
  emptyText: string
  /** The tallied rows, largest first. */
  rows: LeadTally[]
  /** Heading above the list. */
  title: string
}

/**
 * LeadsBreakdown
 *
 * One breakdown of the leads panel, drawn as labelled bars.
 *
 * Bars are measured against the largest row rather than against the total, so a
 * split like 9 / 7 / 6 stays readable instead of collapsing into three stubs.
 * The number beside each bar is what the reader actually quotes, so the bar is
 * only there to make the ranking legible at a glance.
 *
 * @param props - Component props.
 */
export function LeadsBreakdown(
  props: LeadsBreakdownProps
): React.JSX.Element {
  const { emptyText, rows, title } = props
  const top = rows[0]?.count ?? 1

  return (
    <section className="admin-leads__panel">
      <h3 className="admin-leads__panel-title">{title}</h3>
      {rows.length === 0 ? (
        <p className="admin-leads__empty">{emptyText}</p>
      ) : (
        <ul className="admin-leads__rows">
          {rows.map((row) => (
            <li className="admin-leads__row" key={row.label}>
              <span className="admin-leads__row-label" title={row.label}>
                {row.label}
              </span>
              <span className="admin-leads__bar">
                <span
                  className="admin-leads__bar-fill"
                  style={{ width: `${String((row.count / top) * 100)}%` }}
                />
              </span>
              <span className="admin-leads__row-count">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
