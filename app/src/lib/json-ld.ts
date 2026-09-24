import type { Car, Dealership, WeekdayKey } from '../types/car'

import { buildCarSlug } from './car-slug'
import { dealershipCity } from './city'
import { absoluteUrl } from './seo'

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
 * Serialize a JSON-LD document for a `<script type="application/ld+json">`.
 *
 * Structured data has to be written with `dangerouslySetInnerHTML` — the script
 * body is not a text node — and `JSON.stringify` escapes quotes and backslashes
 * but leaves `<` alone. The HTML parser does not know it is looking at JSON, so
 * a `</script>` anywhere inside a value ends the element early and everything
 * after it is parsed as markup:
 *
 *   version: 'Sport</script><img src=x onerror=alert(1)>'
 *
 * Every string in here comes from the CMS — car model, version, dealership
 * name, address — so that is reachable by anyone who can edit a document.
 * Both angle brackets are escaped, not just the opening one: `<` alone already
 * neutralises `</script>`, but leaving `>` behind means a payload survives in
 * the output as `</script>`, which reads like a half-escaped tag to anyone
 * auditing the page. Both are valid JSON and schema.org reads them back as `<`
 * and `>`, so escaping the pair costs nothing and closes the hole for good.
 *
 * @param data - The JSON-LD document, or array of documents, to embed.
 */
export function serializeLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
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
  return dealerships.map((dealer): Record<string, unknown> => {
    const city = dealershipCity(dealer)

    return {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      ...(dealer.address
        ? {
          address: {
            '@type': 'PostalAddress',
            addressCountry: dealer.address.country || 'MX',
            addressLocality: city?.name,
            addressRegion: city?.state,
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
    }
  })
}
