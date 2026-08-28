/**
 * Facebook Marketplace (Vehicles) helpers.
 *
 * Single source of truth for the select options used BOTH by the Payload
 * collection (Cars.ts) and by the admin "Copy for Facebook Marketplace" panel,
 * so the copyable values always match Facebook's dropdowns.
 *
 * Every option therefore carries two strings: `label` is what the admin panel
 * shows (English, like the rest of the CMS) and `fbLabel` is what gets pasted
 * into Facebook's Spanish form. They must not be collapsed into one — changing
 * `fbLabel` to English would stop matching Facebook's dropdown entries.
 */

export interface Option {
  /** Spanish text pasted into Facebook Marketplace's form. */
  fbLabel: string
  /** Admin-facing label (English), shown in the Payload select field. */
  label: string
  value: string
}

// Facebook "Vehicle type"
export const VEHICLE_TYPE_OPTIONS: Option[] = [
  { fbLabel: 'Auto', label: 'Car', value: 'car' },
  { fbLabel: 'Camioneta', label: 'Truck', value: 'truck' },
]

// Facebook "Body style"
export const BODY_TYPE_OPTIONS: Option[] = [
  { fbLabel: 'Coupé', label: 'Coupe', value: 'coupe' },
  { fbLabel: 'Camioneta', label: 'Truck', value: 'truck' },
  { fbLabel: 'Sedán', label: 'Sedan', value: 'sedan' },
  { fbLabel: 'Hatchback', label: 'Hatchback', value: 'hatchback' },
  { fbLabel: 'SUV', label: 'SUV', value: 'suv' },
  { fbLabel: 'Convertible', label: 'Convertible', value: 'convertible' },
  { fbLabel: 'Familiar', label: 'Wagon', value: 'wagon' },
  { fbLabel: 'Minivan', label: 'Minivan', value: 'minivan' },
  { fbLabel: 'Auto pequeño', label: 'Small car', value: 'small-car' },
]

// Facebook "Vehicle condition"
export const CONDITION_OPTIONS: Option[] = [
  { fbLabel: 'Excelente', label: 'Excellent', value: 'excellent' },
  { fbLabel: 'Muy bueno', label: 'Very good', value: 'very-good' },
  { fbLabel: 'Bueno', label: 'Good', value: 'good' },
  { fbLabel: 'Aceptable', label: 'Fair', value: 'fair' },
  { fbLabel: 'Malo', label: 'Poor', value: 'poor' },
]

// Colors are managed in the "colors" collection (Spanish names), not a fixed
// list, so they are passed through as plain strings — see MarketplaceValues.

// Facebook "Fuel type" (matches existing Cars.fuelType values)
export const FUEL_TYPE_OPTIONS: Option[] = [
  { fbLabel: 'Gasolina', label: 'Gasoline', value: 'gasoline' },
  { fbLabel: 'Diésel', label: 'Diesel', value: 'diesel' },
  { fbLabel: 'Eléctrico', label: 'Electric', value: 'electric' },
  { fbLabel: 'Híbrido', label: 'Hybrid', value: 'hybrid' },
  {
    fbLabel: 'Híbrido Enchufable',
    label: 'Plug-in hybrid',
    value: 'plug-in-hybrid',
  },
]

// Facebook "Transmission" (matches existing Cars.transmission values)
export const TRANSMISSION_OPTIONS: Option[] = [
  { fbLabel: 'Automática', label: 'Automatic', value: 'automatic' },
  { fbLabel: 'Manual', label: 'Manual', value: 'manual' },
]

/**
 * Resolve the Facebook-facing (Spanish) label for a stored select value.
 *
 * @param options - the list of options to search
 * @param value - the stored value to resolve
 */
export function labelFor(options: Option[], value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  const match = options.find((o) => o.value === value)
  return match ? match.fbLabel : String(value)
}

const numberFmt = new Intl.NumberFormat('en-US')

/**
 * formatKm
 *
 * @param mileage - the mileage in kilometers
 */
export function formatKm(mileage: unknown): string {
  const n = typeof mileage === 'number' ? mileage : Number(mileage)
  if (!n || Number.isNaN(n)) return ''
  return `${numberFmt.format(n)} km`
}

/**
 * formatPrice
 *
 * @param price - the price in USD
 */
export function formatPrice(price: unknown): string {
  const n = typeof price === 'number' ? price : Number(price)
  if (!n || Number.isNaN(n)) return ''
  return `$${numberFmt.format(n)}`
}

/**
 * Shape of the values the marketplace helpers read. Kept loose so it works
 * with both a saved Car doc and live Payload form values.
 */
export interface MarketplaceValues {
  vehicleType?: string
  year?: number | string
  brandName?: string
  model?: string
  mileage?: number | string
  price?: number | string
  bodyType?: string
  /** Color name in Spanish (resolved from the colors collection). */
  exteriorColor?: string
  /** Color name in Spanish (resolved from the colors collection). */
  interiorColor?: string
  condition?: string
  fuelType?: string
  transmission?: string
  city?: string
  state?: string
  features?: string[]
}

export interface MarketplaceField {
  key: string
  /** Admin-facing row label (English). Not pasted into Facebook. */
  label: string
  /** Human value ready to paste into Facebook. Empty string = missing data. */
  value: string
}

/**
 * Build the ordered list of Facebook Marketplace fields with copy-ready values.
 * The order mirrors Facebook's vehicle listing form.
 *
 * @param v - the source values (from a Car doc or live form)
 */
export function buildMarketplaceFields(
  v: MarketplaceValues
): MarketplaceField[] {
  const location = [v.city, v.state].filter(Boolean).join(', ')

  return [
    {
      key: 'vehicleType',
      label: 'Vehicle type',
      value: labelFor(VEHICLE_TYPE_OPTIONS, v.vehicleType),
    },
    { key: 'year', label: 'Year', value: v.year ? String(v.year) : '' },
    { key: 'brand', label: 'Brand', value: v.brandName || '' },
    { key: 'model', label: 'Model', value: v.model || '' },
    { key: 'mileage', label: 'Mileage', value: formatKm(v.mileage) },
    { key: 'price', label: 'Price', value: formatPrice(v.price) },
    {
      key: 'bodyType',
      label: 'Body style',
      value: labelFor(BODY_TYPE_OPTIONS, v.bodyType),
    },
    {
      key: 'exteriorColor',
      label: 'Exterior color',
      value: v.exteriorColor || '',
    },
    {
      key: 'interiorColor',
      label: 'Interior color',
      value: v.interiorColor || '',
    },
    {
      key: 'condition',
      label: 'Vehicle condition',
      value: labelFor(CONDITION_OPTIONS, v.condition),
    },
    {
      key: 'fuelType',
      label: 'Fuel type',
      value: labelFor(FUEL_TYPE_OPTIONS, v.fuelType),
    },
    {
      key: 'transmission',
      label: 'Transmission',
      value: labelFor(TRANSMISSION_OPTIONS, v.transmission),
    },
    { key: 'location', label: 'Location', value: location },
  ]
}

/**
 * Template-based description generator for the free-text Facebook field.
 *
 * NOTE: This is the deterministic baseline. To upgrade to an LLM-written
 * description later, swap the call site to hit a server endpoint that calls
 * Claude and falls back to this function on error. See buildMarketplaceFields
 * for the structured data an LLM prompt would receive.
 *
 * @param v - the source values (from a Car doc or live form)
 */
export function buildMarketplaceDescription(v: MarketplaceValues): string {
  const title = [v.brandName, v.model, v.year].filter(Boolean).join(' ')

  const lines: string[] = []
  if (title) lines.push(`🚗 ${title}`)
  lines.push('')

  /**
   * spec
   *
   * @param label - the human label for the spec
   * @param value - the human value for the spec
   */
  const spec = (label: string, value: string): void => {
    if (value) lines.push(`• ${label}: ${value}`)
  }

  spec('Kilometraje', formatKm(v.mileage))
  spec('Transmisión', labelFor(TRANSMISSION_OPTIONS, v.transmission))
  spec('Combustible', labelFor(FUEL_TYPE_OPTIONS, v.fuelType))
  spec('Carrocería', labelFor(BODY_TYPE_OPTIONS, v.bodyType))
  spec('Color exterior', v.exteriorColor || '')
  spec('Color interior', v.interiorColor || '')
  spec('Estado', labelFor(CONDITION_OPTIONS, v.condition))

  const location = [v.city, v.state].filter(Boolean).join(', ')
  spec('Ubicación', location)

  const features = (v.features || []).filter(Boolean)
  if (features.length > 0) {
    lines.push('')
    lines.push('✨ Equipamiento:')
    for (const f of features) lines.push(`  - ${f}`)
  }

  const price = formatPrice(v.price)
  if (price) {
    lines.push('')
    lines.push(`💲 Precio: ${price}`)
  }

  lines.push('')
  lines.push(
    '📩 Escríbenos para más información o para agendar una prueba de manejo.'
  )

  return lines.join('\n').trim()
}
