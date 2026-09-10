import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { lookup, type LookupTable } from './lookup'
import { cars } from '../../../i18n/labels'

/**
 * Fuel type.
 *
 * A hybrid does not announce itself in `FuelTypePrimary` — that still reads
 * "Gasoline". The electrified drivetrain lives in a separate attribute, so it
 * is checked first; otherwise a Prius would be filed as a plain gasoline car.
 */

/** Electrification levels, most specific first. */
const ELECTRIFICATION: LookupTable = [
  ['PHEV', 'plug-in-hybrid'],
  ['PLUG-IN', 'plug-in-hybrid'],
  ['BEV', 'electric'],
  ['FCEV', 'electric'],
  ['HEV', 'hybrid'],
]

/** vPIC's primary fuels, for everything without an electrified drivetrain. */
const FUELS: LookupTable = [
  ['GASOLINE', 'gasoline'],
  ['DIESEL', 'diesel'],
  ['ELECTRIC', 'electric'],
]

/**
 * Propose the fuel type.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
export const fuelMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const electrified = lookup(ELECTRIFICATION, decoded.electrificationLevel)
  const value = electrified ?? lookup(FUELS, decoded.fuelTypePrimary)

  if (value === null) return null

  return {
    confidence: 'inferred',
    label: cars.fields.fuelType.label,
    path: 'fuelType',
    value,
  }
}
