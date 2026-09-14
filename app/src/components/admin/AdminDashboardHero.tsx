import Link from 'next/link'
import type { Payload } from 'payload'

import type { Car } from '@/payload-types'

interface AdminDashboardHeroProps {
  /** Request i18n, injected by Payload into `beforeDashboard`. */
  i18n?: { language?: string } | null
  /** Local API instance, injected by Payload into `beforeDashboard`. */
  payload: Payload
  /** The signed-in admin user, injected by Payload. */
  user?: { email?: string | null } | null
}

interface Copy {
  /** Shown when no car exists yet. */
  emptyText: string
  /** Salutation before the user name. */
  greeting: string
  /** Sentence under the greeting. */
  intro: string
  /** Heading above the recent cars. */
  recentTitle: string
  /** Captions of the four stat tiles, in render order. */
  stats: [string, string, string, string]
  /** Status badge per car status. */
  status: Record<Car['status'], string>
  /** Link to the cars collection. */
  viewAll: string
}

interface StatView {
  /** Caption above the number. */
  label: string
  /** Tint applied to the tile. */
  tone: 'accent' | 'caution' | 'neutral' | 'positive'
  /** The count itself. */
  value: number
}

const COPY: Record<'en' | 'es', Copy> = {
  en: {
    emptyText: 'Publish your first car to see it here.',
    greeting: 'Welcome back',
    intro: "Here's how your inventory looks.",
    recentTitle: 'Recently edited cars',
    stats: ['Cars in catalog', 'Available', 'Sold', 'Featured'],
    status: {
      available: 'Available',
      reserved: 'Reserved',
      sold: 'Sold',
    },
    viewAll: 'View all',
  },
  es: {
    emptyText: 'Publica tu primer auto para verlo aquí.',
    greeting: 'Hola de nuevo',
    intro: 'Este es el estado de tu inventario.',
    recentTitle: 'Últimos autos editados',
    stats: ['Autos en catálogo', 'Disponibles', 'Vendidos', 'Destacados'],
    status: {
      available: 'Disponible',
      reserved: 'Apartado',
      sold: 'Vendido',
    },
    viewAll: 'Ver todos',
  },
}

/**
 * Narrow the request language to the copy this dashboard ships, matching the
 * config's `fallbackLanguage: 'en'` for anything else.
 *
 * @param language - `i18n.language` as given by Payload, e.g. `es` or `en-US`.
 */
function resolveLanguage(language: string | undefined): 'en' | 'es' {
  return language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/**
 * Human name for a car, for the rare document saved before the title hook ran.
 *
 * @param car - The car to label.
 */
function carTitle(car: Car): string {
  if (car.title) return car.title

  const brand = typeof car.brand === 'object' ? car.brand.name : ''

  return [brand, car.model, car.year].filter(Boolean).join(' ') || `#${car.id}`
}

/**
 * Inventory overview injected above the Payload dashboard through
 * `admin.components.beforeDashboard`.
 *
 * It answers the two questions the stock dashboard does not: how the stock
 * splits by availability, and what was touched last. Both are single indexed
 * queries, and the counts are read with `payload.count()` rather than by
 * fetching documents.
 *
 * Styling lives in `dashboard.css` and consumes the tokens from `theme.css`,
 * so it follows the admin's light/dark toggle.
 *
 * @param props - Component props.
 */
export async function AdminDashboardHero(
  props: AdminDashboardHeroProps
): Promise<React.JSX.Element> {
  const { i18n, payload, user } = props
  const adminRoute = payload.config.routes.admin
  const lang = resolveLanguage(i18n?.language ?? undefined)
  const copy = COPY[lang]
  const locale = lang === 'es' ? 'es-MX' : 'en-MX'
  const currency = new Intl.NumberFormat(locale, {
    currency: 'MXN',
    maximumFractionDigits: 0,
    style: 'currency',
  })
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  const [total, available, sold, featured, recent] = await Promise.all([
    payload.count({ collection: 'cars' }),
    payload.count({
      collection: 'cars',
      where: { status: { equals: 'available' } },
    }),
    payload.count({
      collection: 'cars',
      where: { status: { equals: 'sold' } },
    }),
    payload.count({
      collection: 'cars',
      where: { featured: { equals: true } },
    }),
    payload.find({
      collection: 'cars',
      depth: 1,
      limit: 6,
      sort: '-updatedAt',
    }),
  ])

  const stats: StatView[] = [
    { label: copy.stats[0], tone: 'neutral', value: total.totalDocs },
    { label: copy.stats[1], tone: 'positive', value: available.totalDocs },
    { label: copy.stats[2], tone: 'caution', value: sold.totalDocs },
    { label: copy.stats[3], tone: 'accent', value: featured.totalDocs },
  ]

  const name = user?.email ? user.email.split('@')[0] : ''

  return (
    <section className="admin-hero">
      <header className="admin-hero__header">
        <h1 className="admin-hero__title">
          {copy.greeting}
          {name ? `, ${name}` : ''}
        </h1>
        <p className="admin-hero__text">{copy.intro}</p>
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

      <div className="admin-hero__section-head">
        <h2 className="admin-hero__subtitle">{copy.recentTitle}</h2>
        <Link
          className="admin-hero__link"
          href={`${adminRoute}/collections/cars`}
        >
          {copy.viewAll}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>

      {recent.docs.length === 0 ? (
        <p className="admin-hero__empty">{copy.emptyText}</p>
      ) : (
        <ul className="admin-recent">
          {recent.docs.map((car) => (
            <li key={car.id}>
              <Link
                className="admin-card"
                href={`${adminRoute}/collections/cars/${car.id}`}
              >
                <span className="admin-card__head">
                  <span className="admin-card__title">{carTitle(car)}</span>
                  <span className={`admin-badge admin-badge--${car.status}`}>
                    {copy.status[car.status]}
                  </span>
                </span>
                <span className="admin-card__price">
                  {currency.format(car.price)}
                </span>
                <span className="admin-card__meta">
                  {car.mileage ? `${car.mileage.toLocaleString(locale)} km` : '—'}
                  <span aria-hidden="true"> · </span>
                  {date.format(new Date(car.updatedAt))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
