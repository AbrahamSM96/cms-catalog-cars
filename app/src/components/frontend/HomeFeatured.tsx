import { connection } from 'next/server'

import { FeaturedCars } from '@/components/frontend/FeaturedCars'
import { getFeaturedCars } from '@/lib/payload-client'

/**
 * HomeFeatured — the featured cars strip on the home page.
 *
 * Streamed from a `<Suspense>` boundary so the page prerenders without a
 * database. See `lib/payload-client.ts`.
 */
export async function HomeFeatured(): Promise<React.JSX.Element | null> {
  await connection()

  return <FeaturedCars cars={await getFeaturedCars()} />
}
