import { cars } from '../../../i18n/labels'
import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { lookup, type LookupTable } from './lookup'

/**
 * Body style and vehicle type.
 *
 * Both target the options Facebook Marketplace expects (see
 * `lib/marketplace.ts`), because those are the values the catalogue already
 * stores. vPIC's `BodyClass` is a long, slash-separated string
 * ("Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)"), so the table
 * matches on substrings, most specific first.
 */

/** vPIC body classes mapped to our `bodyType` options. */
const BODY_CLASSES: LookupTable = [
  ['SPORT UTILITY', 'suv'],
  ['CROSSOVER', 'suv'],
  ['MINIVAN', 'minivan'],
  ['VAN', 'minivan'],
  ['PICKUP', 'truck'],
  ['TRUCK', 'truck'],
  ['CONVERTIBLE', 'convertible'],
  ['CABRIOLET', 'convertible'],
  ['ROADSTER', 'convertible'],
  ['HATCHBACK', 'hatchback'],
  ['LIFTBACK', 'hatchback'],
  ['WAGON', 'wagon'],
  ['COUPE', 'coupe'],
  ['SEDAN', 'sedan'],
  ['SALOON', 'sedan'],
]

/**
 * vPIC vehicle types mapped to our `vehicleType` options. An MPV is what vPIC
 * calls an SUV, which the catalogue sells as a "camioneta".
 */
const VEHICLE_TYPES: LookupTable = [
  ['PASSENGER CAR', 'car'],
  ['MULTIPURPOSE', 'truck'],
  ['TRUCK', 'truck'],
]

/**
 * Propose the body style.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
const bodyTypeMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const value = lookup(BODY_CLASSES, decoded.bodyClass)
  if (value === null) return null

  return {
    confidence: 'inferred',
    label: cars.fields.bodyStyle.label,
    path: 'bodyType',
    value,
  }
}

/**
 * Propose the vehicle type, falling back to the body class when vPIC does not
 * state one — an SUV is a "camioneta" no matter which field says so.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
const vehicleTypeMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const fromType = lookup(VEHICLE_TYPES, decoded.vehicleType)
  const body = lookup(BODY_CLASSES, decoded.bodyClass)
  const fromBody =
    body === 'suv' || body === 'truck' || body === 'minivan' ? 'truck' : null

  const value = fromBody ?? fromType
  if (value === null) return null

  return {
    confidence: 'inferred',
    label: cars.fields.vehicleType.label,
    path: 'vehicleType',
    value,
  }
}

export const bodyMappers: FieldMapper[] = [bodyTypeMapper, vehicleTypeMapper]
