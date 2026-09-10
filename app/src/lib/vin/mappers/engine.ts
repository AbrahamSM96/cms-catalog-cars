import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { lookup, type LookupTable } from './lookup'
import { cars } from '../../../i18n/labels'

/**
 * Engine description.
 *
 * The catalogue stores it as free text in the shape the admin placeholder
 * shows — "L4 2.0" — so the layout and the displacement are stitched together
 * here. Anything less than both halves is not worth proposing: "L4" alone
 * tells a buyer nothing the rest of the listing does not.
 */

/** vPIC cylinder layouts, mapped to the prefix the catalogue writes. */
const CONFIGURATIONS: LookupTable = [
  ['V-SHAPED', 'V'],
  ['IN-LINE', 'L'],
  ['INLINE', 'L'],
]

/** Layout assumed when vPIC does not state one, which is the common case. */
const DEFAULT_CONFIGURATION = 'L'

/**
 * Propose the engine description.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
const engineMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const { displacementL, engineCylinders } = decoded
  if (displacementL === null || engineCylinders === null) return null

  const layout =
    lookup(CONFIGURATIONS, decoded.engineConfiguration) ??
    DEFAULT_CONFIGURATION

  return {
    confidence: 'inferred',
    label: cars.fields.engine.label,
    path: 'engine',
    value: `${layout}${String(engineCylinders)} ${displacementL.toFixed(1)}`,
  }
}

export const engineMappers: FieldMapper[] = [engineMapper]
