const LAT_ERROR =
  'La latitud debe estar entre -90 y 90 en grados decimales (ej. 20.6597).'
const LNG_ERROR =
  'La longitud debe estar entre -180 y 180 en grados decimales (ej. -103.3496).'

/**
 * Validate a latitude value for Payload field validation. Null / undefined
 * values are considered valid (the field is optional).
 *
 * @param value - The latitude value in decimal degrees.
 */
export function validateLatitude(
  value: number | null | undefined
): true | string {
  return value == null || (value >= -90 && value <= 90) || LAT_ERROR
}

/**
 * Validate a longitude value for Payload field validation. Null / undefined
 * values are considered valid (the field is optional).
 *
 * @param value - The longitude value in decimal degrees.
 */
export function validateLongitude(
  value: number | null | undefined
): true | string {
  return value == null || (value >= -180 && value <= 180) || LNG_ERROR
}
