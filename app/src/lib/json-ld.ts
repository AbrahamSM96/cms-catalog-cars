import type { Car, Dealership, WeekdayKey } from '../types/car'

import { absoluteUrl } from './seo'
import { buildCarSlug } from './car-slug'

const WEEKDAY_NAMES: Record<WeekdayKey, string> = {
  friday: 'Friday',
  monday: 'Monday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  thursday: 'Thursday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
}

/**
 * Build the ItemList JSON-LD entries for the catalog page, one per car.
 *
 * @param cars - the cars to list
 */
export function buildItemListLd(cars: Car[]): Array<Record<string, unknown>> {
  return cars.map((car, index): Record<string, unknown> => {
    const brandName = typeof car.brand === 'object' ? car.brand.name : ''
    return {
      '@type': 'ListItem',
      name: [brandName, car.model, car.version, car.year]
        .filter(Boolean)
        .join(' '),
      position: index + 1,
      url: absoluteUrl(`/catalogo/${buildCarSlug(car)}`),
    }
  })
}

/**
 * Build the AutoDealer JSON-LD array for the locations page.
 *
 * @param dealerships - the dealerships to describe
 */
export function buildAutoDealerLd(
  dealerships: Dealership[]
): Array<Record<string, unknown>> {
  return dealerships.map(
    (dealer): Record<string, unknown> => ({
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      ...(dealer.address
        ? {
            address: {
              '@type': 'PostalAddress',
              addressCountry: dealer.address.country || 'MX',
              addressLocality: dealer.address.city,
              addressRegion: dealer.address.state,
              postalCode: dealer.address.postalCode,
              streetAddress: dealer.address.line1,
            },
          }
        : {}),
      ...(dealer.coordinates?.latitude && dealer.coordinates?.longitude
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: dealer.coordinates.latitude,
              longitude: dealer.coordinates.longitude,
            },
          }
        : {}),
      name: dealer.name,
      ...(dealer.hours
        ? {
            openingHoursSpecification: Object.entries(dealer.hours)
              .map(([day, hours]): Record<string, unknown> | null => {
                if (!hours || hours.closed || !hours.open || !hours.close) {
                  return null
                }
                return {
                  '@type': 'OpeningHoursSpecification',
                  closes: hours.close,
                  dayOfWeek: WEEKDAY_NAMES[day as WeekdayKey],
                  opens: hours.open,
                }
              })
              .filter(
                (entry): entry is Record<string, unknown> => entry !== null
              ),
          }
        : {}),
      ...(dealer.phone ? { telephone: dealer.phone } : {}),
      url: absoluteUrl('/ubicaciones'),
    })
  )
}
