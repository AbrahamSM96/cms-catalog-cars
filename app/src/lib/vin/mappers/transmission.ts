import { cars } from '../../../i18n/labels'
import { detectTransmission } from '../../transmission'
import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { lookup, type LookupTable } from './lookup'

/**
 * Transmission.
 *
 * The catalogue only knows `automatic` and `manual`, so every self-shifting
 * box collapses into `automatic`. The table is checked before falling back to
 * {@link detectTransmission}, which reads the catalogue's own Spanish version
 * descriptions: "Automated Manual Transmission" contains the word "manual" and
 * would otherwise be filed as a stick shift.
 */
const TRANSMISSION_STYLES: LookupTable = [
  ['AUTOMATED MANUAL', 'automatic'],
  ['AUTOMATIC', 'automatic'],
  ['CONTINUOUSLY VARIABLE', 'automatic'],
  ['DUAL-CLUTCH', 'automatic'],
  ['MANUAL', 'manual'],
]

/**
 * Propose the transmission.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
export const transmissionMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const style = decoded.transmissionStyle
  const value =
    lookup(TRANSMISSION_STYLES, style) ?? detectTransmission(style ?? undefined)
  if (value === null) return null

  return {
    confidence: 'inferred',
    label: cars.fields.transmission.label,
    path: 'transmission',
    value,
  }
}
