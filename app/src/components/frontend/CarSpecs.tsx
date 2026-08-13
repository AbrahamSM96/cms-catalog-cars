import type { Car } from '../../types/car'

interface CarSpecsProps {
  car: Car
}

/**
 * CarSpecs 
 *
 * @param props - CarSpecsProps
 * @param props.car - Car
 */
export function CarSpecs({ car }: CarSpecsProps): React.JSX.Element {
  const brandName = typeof car.brand === 'object' ? car.brand.name : 'Unknown'

  const specs = [
    { label: 'Marca', value: brandName },
    { label: 'Modelo', value: car.model },
    { label: 'Versión', value: car.version },
    { label: 'Año', value: car.year },
    {
      label: 'Transmisión',
      value: car.transmission === 'automatic' ? 'Automática' : 'Manual',
    },
    {
      label: 'Kilometraje',
      value: car.mileage
        ? new Intl.NumberFormat('en-US').format(car.mileage) + ' km'
        : 'N/A',
    },
    { label: 'Cilindros', value: car.cylinders || 'N/A' },
    { label: 'Pasajeros', value: car.passengers || 'N/A' },
  ]

  // Status badge
  const statusConfig = {
    available: {
      color:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      label: '🟢 Disponible',
    },
    reserved: {
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      label: '🟡 Reservado',
    },
    sold: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      label: '🔴 Vendido',
    },
  }

  const status = statusConfig[car.status]

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Especificaciones
        </h2>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <dl className="space-y-3">
        {specs.map((spec) => (
          <div
            className="flex justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800"
            key={spec.label}
          >
            <dt className="font-medium text-zinc-600 dark:text-zinc-400">
              {spec.label}
            </dt>
            <dd className="font-semibold text-zinc-900 dark:text-zinc-50">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Price */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Precio</div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {new Intl.NumberFormat('en-US', {
            currency: 'USD',
            minimumFractionDigits: 0,
            style: 'currency',
          }).format(car.price)}
        </div>
      </div>

      {/* Description */}
      {car.description && (
        <div className="mt-6">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Descripción
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {car.description}
          </p>
        </div>
      )}
    </div>
  )
}
