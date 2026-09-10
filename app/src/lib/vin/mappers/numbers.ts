import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

import { cars } from '../../../i18n/labels'

/**
 * Mappers for the values the VIN states outright: no translation table, no
 * judgement call, so they carry `exact` confidence.
 */

/**
 * Build a mapper that copies one numeric attribute straight through.
 *
 * @param props - Mapper definition.
 * @param props.label - Admin-facing label of the target field.
 * @param props.path - Field path in the Cars form.
 * @param props.read - Reads the attribute off the decoded VIN.
 */
function numberMapper(props: {
  label: FieldSuggestion['label']
  path: string
  read: (decoded: DecodedVin) => number | null
}): FieldMapper {
  const { label, path, read } = props

  return (decoded: DecodedVin): FieldSuggestion | null => {
    const value = read(decoded)
    if (value === null) return null
    return { confidence: 'exact', label, path, value }
  }
}

export const numberMappers: FieldMapper[] = [
  numberMapper({
    label: cars.fields.year.label,
    path: 'year',
    /**
     * Read the model year.
     *
     * @param decoded - The decoded VIN.
     */
    read: (decoded): number | null => decoded.modelYear,
  }),
  numberMapper({
    label: cars.fields.doors.label,
    path: 'doors',
    /**
     * Read the door count.
     *
     * @param decoded - The decoded VIN.
     */
    read: (decoded): number | null => decoded.doors,
  }),
  numberMapper({
    label: cars.fields.cylinders.label,
    path: 'cylinders',
    /**
     * Read the cylinder count.
     *
     * @param decoded - The decoded VIN.
     */
    read: (decoded): number | null => decoded.engineCylinders,
  }),
  numberMapper({
    label: cars.fields.horsepower.label,
    path: 'horsepower',
    /**
     * Read the rated horsepower.
     *
     * @param decoded - The decoded VIN.
     */
    read: (decoded): number | null => decoded.engineHp,
  }),
]
