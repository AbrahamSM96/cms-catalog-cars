import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { bodyMappers } from './body'
import { engineMappers } from './engine'
import { featuresMapper } from './features'
import { fuelMapper } from './fuel'
import { numberMappers } from './numbers'
import { transmissionMapper } from './transmission'

/**
 * Every mapper that works from the VIN alone. Brand, model and version need
 * the catalogue and live in `catalog-resolver.ts` instead.
 */
export const FIELD_MAPPERS: FieldMapper[] = [
  ...numberMappers,
  ...engineMappers,
  ...bodyMappers,
  fuelMapper,
  transmissionMapper,
  featuresMapper,
]

/**
 * Run every mapper and keep the proposals that produced a value.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
export function mapDecodedVin(decoded: DecodedVin): FieldSuggestion[] {
  return FIELD_MAPPERS.map((mapper) => mapper(decoded)).filter(
    (suggestion): suggestion is FieldSuggestion => suggestion !== null
  )
}
