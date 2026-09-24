import { cars } from '../../../i18n/labels'
import type { DecodedVin, FieldMapper, FieldSuggestion } from '../types'

/**
 * Equipment, as rows for the `features` array.
 *
 * Two rules govern this mapper, and both exist because these strings end up
 * verbatim in a public sales listing:
 *
 * 1. **Only `Standard` counts.** vPIC also answers `Optional`, which means the
 *    model line offered the equipment — not that this unit has it. Listing a
 *    backup camera because it was on the options sheet is a false claim about
 *    a car someone is about to drive to see.
 * 2. **The text is Spanish**, because unlike the admin labels these rows are
 *    read by buyers.
 *
 * What is not here is as deliberate as what is. NHTSA records regulated safety
 * equipment, so there is no Bluetooth, no touchscreen, no sunroof and no
 * leather — that half of the equipment list has to come from the photos or the
 * spec sheet, and belongs to the multimodal step.
 */

/** The only value that means "this car actually has it". */
const STANDARD = 'Standard'

/** Safety and convenience equipment vPIC reports, with its selling name. */
const EQUIPMENT: [keyof DecodedVin, string][] = [
  ['rearVisibilitySystem', 'Cámara de reversa'],
  ['parkAssist', 'Sensores de estacionamiento'],
  ['blindSpotMonitor', 'Monitor de punto ciego'],
  ['forwardCollisionWarning', 'Alerta de colisión frontal'],
  ['laneDepartureWarning', 'Alerta de cambio de carril'],
  ['adaptiveCruiseControl', 'Control crucero adaptativo'],
  ['keylessIgnition', 'Encendido sin llave'],
  ['esc', 'Control electrónico de estabilidad'],
  ['abs', 'Frenos ABS'],
]

/** Airbag positions, in the order they are read out loud. */
const AIRBAGS: [keyof DecodedVin, string][] = [
  ['airBagLocFront', 'frontales'],
  ['airBagLocSide', 'laterales'],
  ['airBagLocCurtain', 'de cortina'],
  ['airBagLocKnee', 'de rodilla'],
]

/**
 * Join a list the way Spanish does, with "y" before the last item.
 *
 * @param parts - The items to join.
 */
function joinSpanish(parts: string[]): string {
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`
}

/**
 * Describe the airbags as one feature rather than one row per position — a
 * listing reads better with "bolsas de aire frontales, laterales y de cortina"
 * than with three separate bullets.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
function airbagFeature(decoded: DecodedVin): string | null {
  const present = AIRBAGS.filter(([key]) => decoded[key] !== null).map(
    ([, name]) => name
  )
  if (present.length === 0) return null

  return `Bolsas de aire ${joinSpanish(present)}`
}

/**
 * Propose the equipment rows.
 *
 * @param decoded - The vehicle as described by its VIN.
 */
export const featuresMapper: FieldMapper = (
  decoded: DecodedVin
): FieldSuggestion | null => {
  const features = EQUIPMENT.filter(([key]) => decoded[key] === STANDARD).map(
    ([, name]) => name
  )

  const airbags = airbagFeature(decoded)
  if (airbags !== null) features.push(airbags)

  if (features.length === 0) return null

  return {
    confidence: 'inferred',
    display: features.join(' · '),
    label: cars.fields.features.label,
    path: 'features',
    value: features,
  }
}
