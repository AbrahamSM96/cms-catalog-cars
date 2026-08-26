import { connection } from 'next/server'

import { Hero, type HeroSlideView } from '@/components/frontend/Hero'
import { getHomepage } from '@/lib/payload-client'
import { getImageUrl } from '@/lib/images'
import type { Media } from '@/types/car'

/**
 * HomeHero — the hero carousel, built from the `homepage` global.
 *
 * Streamed from a `<Suspense>` boundary on the home page so the rest of the
 * page prerenders without a database. See `lib/payload-client.ts`.
 */
export async function HomeHero(): Promise<React.JSX.Element> {
  await connection()

  const homepage = await getHomepage()

  // Resolve hero carousel slides (image relation -> public URL).
  const heroSlides: HeroSlideView[] = (homepage?.heroSlides ?? [])
    .map((slide): HeroSlideView | null => {
      const image = slide.image
      if (!image || typeof image !== 'object') return null
      const media = image as Media

      return {
        alt:
          media.alt || slide.caption || 'Catálogo de autos seminuevos en venta',
        caption: slide.caption,
        url: media.url || getImageUrl(media.filename),
      }
    })
    .filter((s): s is HeroSlideView => s !== null)

  return <Hero slides={heroSlides} text={homepage?.hero} />
}
