const LAT_ERROR =
  'Latitude must be between -90 and 90 in decimal degrees (e.g. 20.6597).'
const LNG_ERROR =
  'Longitude must be between -180 and 180 in decimal degrees (e.g. -103.3496).'

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
