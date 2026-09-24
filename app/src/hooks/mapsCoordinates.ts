import type { CollectionBeforeChangeHook } from 'payload'

import { resolveCoordinatesFromMapsUrl } from '../lib/google-maps-url'

/** The slice of a dealership this hook reads and writes. */
interface DealershipData {
  coordinates?: { latitude?: number | null; longitude?: number | null } | null
  googleMapsUrl?: string | null
}

/**
 * Fill the map coordinates from the Google Maps link the admin pasted, so the
 * usual flow (share the place → paste the link) is enough to place the pin.
 *
 * Typed coordinates win: the numbers are only written when they are empty or
 * when the link itself changed. A link that carries no place leaves the fields
 * untouched instead of clearing them.
 *
 * @param root0 - Payload hook arguments.
 * @param root0.data - The incoming dealership data.
 * @param root0.originalDoc - The dealership data currently stored.
 */
export const fillCoordinatesFromMapsUrl: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
}) => {
  const next = data as DealershipData
  const previous = originalDoc as DealershipData | undefined

  const url = next.googleMapsUrl?.trim()
  if (!url) return data

  const urlChanged = url !== previous?.googleMapsUrl?.trim()
  const hasCoordinates =
    next.coordinates?.latitude != null && next.coordinates.longitude != null

  if (hasCoordinates && !urlChanged) return data

  const found = await resolveCoordinatesFromMapsUrl(url)
  if (!found) return data

  return {
    ...data,
    coordinates: {
      ...next.coordinates,
      latitude: found.latitude,
      longitude: found.longitude,
    },
  }
}
