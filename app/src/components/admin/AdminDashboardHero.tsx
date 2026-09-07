import Link from 'next/link'
import type { Payload } from 'payload'

import type { Car } from '@/payload-types'

interface AdminDashboardHeroProps {
  /** Local API instance, injected by Payload into `beforeDashboard`. */
  payload: Payload
  /** The signed-in admin user, injected by Payload. */
  user?: { email?: string | null } | null
}

interface StatView {
  /** Caption above the number. */
  label: string
  /** Tint applied to the tile. */
  tone: 'accent' | 'caution' | 'neutral' | 'positive'
  /** The count itself. */
  value: number
}

const COPY = {
  emptyText: 'Publica tu primer auto para verlo aquí.',
  greeting: 'Hola de nuevo',
  intro: 'Este es el estado de tu inventario.',
  recentTitle: 'Últimos autos editados',
  viewAll: 'Ver todos',
}

const STATUS_LABEL: Record<Car['status'], string> = {
  available: 'Disponible',
  reserved: 'Apartado',
  sold: 'Vendido',
}

const currency = new Intl.NumberFormat('es-MX', {
  currency: 'MXN',
  maximumFractionDigits: 0,
  style: 'currency',
})

const date = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

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
  const { payload, user } = props
  const adminRoute = payload.config.routes.admin

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
    { label: 'Autos en catálogo', tone: 'neutral', value: total.totalDocs },
    { label: 'Disponibles', tone: 'positive', value: available.totalDocs },
    { label: 'Vendidos', tone: 'caution', value: sold.totalDocs },
    { label: 'Destacados', tone: 'accent', value: featured.totalDocs },
  ]

  const name = user?.email ? user.email.split('@')[0] : ''

  return (
    <section className="admin-hero">
      <header className="admin-hero__header">
        <h1 className="admin-hero__title">
          {COPY.greeting}
          {name ? `, ${name}` : ''}
        </h1>
        <p className="admin-hero__text">{COPY.intro}</p>
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
        <h2 className="admin-hero__subtitle">{COPY.recentTitle}</h2>
        <Link
          className="admin-hero__link"
          href={`${adminRoute}/collections/cars`}
        >
          {COPY.viewAll}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>

      {recent.docs.length === 0 ? (
        <p className="admin-hero__empty">{COPY.emptyText}</p>
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
                    {STATUS_LABEL[car.status]}
                  </span>
                </span>
                <span className="admin-card__price">
                  {currency.format(car.price)}
                </span>
                <span className="admin-card__meta">
                  {car.mileage ? `${car.mileage.toLocaleString('es-MX')} km` : '—'}
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
