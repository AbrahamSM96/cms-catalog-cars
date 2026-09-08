import { connection } from 'next/server'

import { buildAutoDealerLd, serializeLd } from '@/lib/json-ld'
import { getDealerships } from '@/lib/payload-client'
import { Locations } from '@/components/location/Locations'

/**
 * DealershipLocations — the locations list plus its AutoDealer structured data.
 *
 * Streamed from a `<Suspense>` boundary so the page around it prerenders
 * without a database. See `lib/payload-client.ts`.
 */
export async function DealershipLocations(): Promise<React.JSX.Element> {
  await connection()

  const dealerships = await getDealerships()

  const autoDealerLd = {
    '@context': 'https://schema.org',
    '@graph': buildAutoDealerLd(dealerships),
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeLd(autoDealerLd) }}
        type="application/ld+json"
      />
      <Locations dealerships={dealerships} />
    </>
  )
}
