import { connection } from 'next/server'

import { CatalogFinder } from '@/components/frontend/CatalogFinder'
import { getBrands } from '@/lib/payload-client'

/**
 * FinderBrands — the guided finder, fed with the brand list from the CMS.
 *
 * Streamed from a `<Suspense>` boundary so the page around it prerenders
 * without a database. See `lib/payload-client.ts`.
 */
export async function FinderBrands(): Promise<React.JSX.Element> {
  await connection()

  return <CatalogFinder brands={await getBrands()} />
}
