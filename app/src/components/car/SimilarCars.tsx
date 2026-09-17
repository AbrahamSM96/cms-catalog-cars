import { CarCard } from '@/components/car/CarCard'
import { CarouselArrows } from '@/components/car/CarouselArrows'
import { getSimilarCars } from '@/lib/payload-client'

import type { Car } from '../../types/car'

interface SimilarCarsProps {
  car: Car
}

/** `id` del track: lo comparten el contenedor y las flechas cliente. */
const TRACK_ID = 'similar-cars-track'

/**
 * SimilarCars — carrusel de autos parecidos al de la ficha.
 *
 * El desplazamiento es scroll horizontal nativo con `snap`, así que el carrusel
 * funciona sin JavaScript (swipe en móvil, rueda/teclado en escritorio) y solo
 * las flechas se hidratan. Se renderiza dentro de su propio `<Suspense>` para
 * que la consulta de similares no retrase la ficha del auto.
 *
 * @param props - component props
 * @param props.car - el auto que se está viendo
 */
export async function SimilarCars({
  car,
}: SimilarCarsProps): Promise<React.JSX.Element | null> {
  const brandId = typeof car.brand === 'object' ? car.brand.id : car.brand
  const cars = await getSimilarCars(brandId ?? null, car.id, car.price).catch(
    () => []
  )
  if (cars.length === 0) return null

  return (
    <section aria-labelledby="similares" className="mt-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            id="similares"
          >
            Autos similares
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Otras opciones en tu mismo rango de precio.
          </p>
        </div>

        <CarouselArrows targetId={TRACK_ID} />
      </div>

      <ul
        className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0"
        id={TRACK_ID}
        tabIndex={0}
      >
        {cars.map((similar) => (
          <li
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            key={similar.id}
          >
            <CarCard car={similar} sizesVariant="catalog" />
          </li>
        ))}
      </ul>
    </section>
  )
}
