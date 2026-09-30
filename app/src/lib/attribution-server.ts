import { cookies } from 'next/headers'

import {
  type Attribution,
  ATTRIBUTION_COOKIE,
  deserializeAttribution,
} from '@/lib/attribution'

/** Lee la atribución del servidor sin impedir la creación de un lead. */
export async function readAttributionCookie(): Promise<Attribution | null> {
  try {
    const store = await cookies()

    return deserializeAttribution(store.get(ATTRIBUTION_COOKIE)?.value)
  } catch {
    return null
  }
}
