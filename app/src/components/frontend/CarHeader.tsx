import {
  BadgeCheck,
  Fuel,
  Gauge,
  type LucideIcon,
  MapPin,
  Palette,
  Settings2,
} from 'lucide-react'

import type { Brand, Car } from '../../types/car'

import { ShareButton } from './ShareButton'

interface CarHeaderProps {
  car: Car
}

const FUEL_LABELS: Record<NonNullable<Car['fuelType']>, string> = {
  diesel: 'Diésel',
  electric: 'Eléctrico',
  gasoline: 'Gasolina',
  hybrid: 'Híbrido',
  'plug-in-hybrid': 'Híbrido Enchufable',
}

/**
 * CarHeader
 *
 * @param props - component props
 * @param props.car - car data
 */
export function CarHeader({ car }: CarHeaderProps): React.JSX.Element | null {
  if (!car) return null
  const brandName =
    typeof car.brand === 'object' ? (car.brand as Brand).name : 'Unknown'
  const exteriorColorName =
    car.exteriorColor && typeof car.exteriorColor === 'object'
      ? car.exteriorColor.name
      : ''

  // Build technical specs string (like "4 Pts. 320i, L4,2.0t. 184Hp, Ta8...")
  /**
   * buildTechSpecs
   */
  const buildTechSpecs = (): string => {
    const specs: string[] = []
    if (car.doors) specs.push(`${car.doors} Pts.`)
    if (car.model) specs.push(car.model)
    if (car.engine) specs.push(car.engine)
    if (car.horsepower) specs.push(`${car.horsepower}Hp`)
    if (car.transmission)
      specs.push(car.transmission === 'automatic' ? 'Ta' : 'Tm')
    if (car.bodyType) specs.push(car.bodyType.charAt(0).toUpperCase())
    return specs.join(', ')
  }

  const techSpecs = buildTechSpecs()

  const location =
    car.location?.dealership && car.location?.city
      ? `${car.location.dealership} - ${car.location.city}`
      : car.location?.city || 'Ubicación no disponible'

  const pills: { icon: LucideIcon; label: string }[] = []
  if (car.fuelType) pills.push({ icon: Fuel, label: FUEL_LABELS[car.fuelType] })
  if (car.transmission)
    pills.push({
      icon: Settings2,
      label: car.transmission === 'automatic' ? 'Automática' : 'Manual',
    })
  if (car.mileage)
    pills.push({
      icon: Gauge,
      label: `${new Intl.NumberFormat('en-US').format(car.mileage)} km`,
    })
  if (exteriorColorName) pills.push({ icon: Palette, label: exteriorColorName })

  return (
    <div className="mb-8">
      {/* Brand row */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
          <span className="text-lg font-bold">{brandName.charAt(0)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-900">
            {brandName}
          </span>
          <BadgeCheck aria-hidden="true" className="h-5 w-5 text-accent-600" />
        </div>
      </div>

      {/* Title + Share */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {brandName} {car.model} {car.year}
          </h1>

          {techSpecs && (
            <p className="mt-2 text-lg text-slate-500">{techSpecs}</p>
          )}

          <div className="mt-3 flex items-center gap-2 text-slate-600">
            <MapPin aria-hidden="true" className="h-5 w-5 text-accent-600" />
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>

        <ShareButton
          text={`Mira este ${brandName} ${car.model} ${car.year}`}
          title={`${brandName} ${car.model} ${car.year}`}
        />
      </div>

      {/* Info pills */}
      {pills.length > 0 && (
        <div className="hidden sm:flex mt-5 flex-wrap gap-2">
          {pills.map(({ icon: Icon, label }) => (
            <span
              className="shadow-soft inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
              key={label}
            >
              <Icon
                aria-hidden="true"
                className="h-4 w-4 text-slate-400"
                strokeWidth={1.8}
              />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
