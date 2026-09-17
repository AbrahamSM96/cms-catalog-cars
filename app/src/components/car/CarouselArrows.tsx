'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface CarouselArrowsProps {
  targetId: string
}

/** Margen (px) para dar un extremo por alcanzado pese al redondeo del scroll. */
const EDGE_TOLERANCE_PX = 8

/** Separación (px) entre tarjetas del carrusel — el `gap-6` del track. */
const TRACK_GAP_PX = 24

/**
 * CarouselArrows — única parte cliente del carrusel de autos similares.
 *
 * No envuelve a las tarjetas: las busca por `id` en el DOM y mueve su scroll,
 * así el track y las `CarCard` siguen siendo Server Components y no viajan al
 * navegador. En móvil se ocultan porque ahí el gesto de swipe ya basta.
 *
 * @param props - component props
 * @param props.targetId - `id` del contenedor con scroll horizontal a mover
 */
export function CarouselArrows({
  targetId,
}: CarouselArrowsProps): React.JSX.Element {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const track = document.getElementById(targetId)
    if (!track) return

    /** Recalcula qué flechas siguen teniendo recorrido por delante. */
    const sync = (): void => {
      const maxScroll = track.scrollWidth - track.clientWidth
      setCanScrollLeft(track.scrollLeft > EDGE_TOLERANCE_PX)
      setCanScrollRight(track.scrollLeft < maxScroll - EDGE_TOLERANCE_PX)
    }

    sync()
    track.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    return (): void => {
      track.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [targetId])

  const scrollByCard = useCallback(
    /**
     * Avanza o retrocede una tarjeta completa.
     *
     * @param direction - -1 para ir a la izquierda, 1 para la derecha
     */
    (direction: -1 | 1): void => {
      const track = document.getElementById(targetId)
      if (!track) return

      const card = track.firstElementChild
      const step = card
        ? card.getBoundingClientRect().width + TRACK_GAP_PX
        : track.clientWidth

      track.scrollBy({ behavior: 'smooth', left: step * direction })
    },
    [targetId]
  )

  return (
    <div className="hidden gap-2 sm:flex">
      <button
        aria-controls={targetId}
        aria-label="Ver autos anteriores"
        className="shadow-soft cursor-pointer rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-accent-500 hover:text-accent-600 disabled:cursor-default disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
        disabled={!canScrollLeft}
        onClick={() => scrollByCard(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      <button
        aria-controls={targetId}
        aria-label="Ver más autos"
        className="shadow-soft cursor-pointer rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-accent-500 hover:text-accent-600 disabled:cursor-default disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
        disabled={!canScrollRight}
        onClick={() => scrollByCard(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  )
}
