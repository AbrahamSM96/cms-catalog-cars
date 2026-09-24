import type { Payload } from 'payload'

import { LeadsBreakdown } from '@/components/admin/LeadsBreakdown'
import { summariseLeads } from '@/lib/lead-summary'

interface LeadsSummaryProps {
  /** Request i18n, injected by Payload into `beforeList`. */
  i18n?: { language?: string } | null
  /** Local API instance, injected by Payload into `beforeList`. */
  payload: Payload
}

interface Copy {
  /** Heading of the car breakdown. */
  byCar: string
  /** Heading of the campaign breakdown. */
  bySource: string
  /** Shown when the period produced nothing. */
  empty: string
  /** Sentence under the title. */
  intro: string
  /** Row name for everything past the top five. */
  other: string
  /** Captions of the four tiles, in render order. */
  stats: [string, string, string, string]
  /** Panel title. */
  title: string
  /** Row name for a visit that carried no campaign. */
  unattributed: string
}

interface StatView {
  /** Caption above the number. */
  label: string
  /** Tint applied to the tile. */
  tone: 'accent' | 'caution' | 'neutral' | 'positive'
  /** The count itself. */
  value: number
}

/** Milliseconds in a day. */
const DAY = 86_400_000

/** Length of the reported period, and of the one it is compared against. */
const WINDOW_DAYS = 30

/**
 * Most leads read into the breakdown.
 *
 * A lot that clears this in a month has outgrown a summary counted in memory
 * and would be better served by a real report than by a silently truncated one.
 */
const MAX_LEADS = 1000

const COPY: Record<'en' | 'es', Copy> = {
  en: {
    byCar: 'Most asked about',
    bySource: 'Where they came from',
    empty:
      'No contacts in the last 30 days. Every WhatsApp and phone tap on the site lands here on its own.',
    intro:
      'Contacts the site produced in the last 30 days, and what they were about.',
    other: 'Everything else',
    stats: ['Last 30 days', 'Not yet contacted', 'Sold', 'Previous 30 days'],
    title: 'Where your contacts are coming from',
    unattributed: 'Direct / organic',
  },
  es: {
    byCar: 'Autos más preguntados',
    bySource: 'De dónde llegaron',
    empty:
      'Sin contactos en los últimos 30 días. Cada toque a WhatsApp o al teléfono en el sitio aparece aquí solo.',
    intro:
      'Contactos que generó el sitio en los últimos 30 días, y de qué se trataron.',
    other: 'Todo lo demás',
    stats: ['Últimos 30 días', 'Sin atender', 'Vendidos', '30 días previos'],
    title: 'De dónde te están llegando los contactos',
    unattributed: 'Directo / orgánico',
  },
}

/**
 * Narrow the request language to the copy this panel ships, matching the
 * config's `fallbackLanguage: 'en'` for anything else.
 *
 * @param language - `i18n.language` as given by Payload, e.g. `es` or `en-US`.
 */
function resolveLanguage(language: string | undefined): 'en' | 'es' {
  return language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/**
 * Lead overview injected above the leads list through
 * `admin.components.beforeList`.
 *
 * The list itself answers "who wrote us". This answers the two questions that
 * decide what the client does next: which campaigns are paying for themselves,
 * and which cars nobody is asking about.
 *
 * A rolling 30 days rather than a calendar month, deliberately. A calendar
 * boundary computed on a server running UTC would start the client's month at
 * six in the evening on the last day of the previous one, and a rolling window
 * compares cleanly against the window before it.
 *
 * Styling lives in `leads.css` and consumes the tokens from `theme.css`, so the
 * block follows the admin's light/dark toggle.
 *
 * @param props - Component props.
 */
export async function LeadsSummary(
  props: LeadsSummaryProps
): Promise<React.JSX.Element> {
  const { i18n, payload } = props
  const copy = COPY[resolveLanguage(i18n?.language ?? undefined)]

  // oxlint-disable-next-line react/purity -- This async server summary needs one consistent rolling-window boundary.
  const now = Date.now()
  const since = new Date(now - WINDOW_DAYS * DAY).toISOString()
  const previousSince = new Date(now - 2 * WINDOW_DAYS * DAY).toISOString()

  const [current, pending, sold, previous] = await Promise.all([
    payload.find({
      collection: 'leads',
      depth: 1,
      limit: MAX_LEADS,
      sort: '-createdAt',
      where: { createdAt: { greater_than_equal: since } },
    }),
    payload.count({
      collection: 'leads',
      where: {
        and: [
          { createdAt: { greater_than_equal: since } },
          { status: { equals: 'new' } },
        ],
      },
    }),
    payload.count({
      collection: 'leads',
      where: {
        and: [
          { createdAt: { greater_than_equal: since } },
          { status: { equals: 'sold' } },
        ],
      },
    }),
    payload.count({
      collection: 'leads',
      where: {
        and: [
          { createdAt: { greater_than_equal: previousSince } },
          { createdAt: { less_than: since } },
        ],
      },
    }),
  ])

  const { byCar, bySource } = summariseLeads({
    leads: current.docs,
    otherLabel: copy.other,
    unattributedLabel: copy.unattributed,
  })

  const stats: StatView[] = [
    { label: copy.stats[0], tone: 'neutral', value: current.totalDocs },
    { label: copy.stats[1], tone: 'caution', value: pending.totalDocs },
    { label: copy.stats[2], tone: 'positive', value: sold.totalDocs },
    { label: copy.stats[3], tone: 'accent', value: previous.totalDocs },
  ]

  return (
    <section className="admin-leads">
      <header className="admin-leads__header">
        <h2 className="admin-leads__title">{copy.title}</h2>
        <p className="admin-leads__intro">{copy.intro}</p>
      </header>

      <div className="admin-hero__stats">
        {stats.map((stat) => (
          <article
            className={`admin-stat admin-stat--${stat.tone}`}
            key={stat.label}
          >
            <p className="admin-stat__label">{stat.label}</p>
            <p className="admin-stat__value">{stat.value}</p>
          </article>
        ))}
      </div>

      {current.totalDocs === 0 ? (
        <p className="admin-leads__empty">{copy.empty}</p>
      ) : (
        <div className="admin-leads__panels">
          <LeadsBreakdown
            emptyText={copy.empty}
            rows={bySource}
            title={copy.bySource}
          />
          <LeadsBreakdown
            emptyText={copy.empty}
            rows={byCar}
            title={copy.byCar}
          />
        </div>
      )}
    </section>
  )
}
