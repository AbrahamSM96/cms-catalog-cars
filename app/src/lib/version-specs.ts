import type { Transmission } from './transmission'

import { detectTransmission } from './transmission'

/**
 * Reading the specs a catalogue version description already carries.
 *
 * The descriptions are dense but perfectly regular — every one of the 8,722
 * versions ends the same way:
 *
 * ```
 * 1.5L A-SPEC AA EE CD BA QC VP AUTOMATICO SUV 4 CIL 5 P 5 OCUP
 *                                              ^^^^^ ^^^ ^^^^^^
 * ```
 *
 * That makes this catalogue a better source than a VIN decoder for the market
 * this site sells into: occupants, doors and cylinders are present in 100% of
 * the rows, and the equipment shorthand covers most of them — for every car
 * sold in Mexico, including the ones NHTSA's database returns blank.
 *
 * The trade is that a description describes a *version*, not a *unit*: it says
 * what a 2013 Jetta Comfortline is, never that the car in the lot is one. That
 * is what the VIN is for, and why the two feed each other rather than compete.
 */

/** Specs recovered from a version description. `null` means "not stated". */
export interface VersionSpecs {
  cylinders: number | null
  displacementL: number | null
  doors: number | null
  /** Equipment, in Spanish, ready to become rows of the `features` array. */
  features: string[]
  passengers: number | null
  transmission: Transmission | null
}

/**
 * The equipment shorthand, in the order it reads well in a listing.
 *
 * Only the abbreviations whose meaning is unambiguous are here. `CD` appears in
 * 62% of the rows and is deliberately left out: in these catalogues it may mean
 * a CD player or a central locking system, and neither guess is worth printing
 * on a public listing — least of all "reproductor de CD" on a 2026 model.
 */
const EQUIPMENT: [string, string][] = [
  ['AA', 'Aire acondicionado'],
  ['EE', 'Elevadores eléctricos'],
  ['BA', 'Bolsas de aire'],
  ['QC', 'Quemacocos'],
  ['VP', 'Vestiduras de piel'],
]

/** Drivetrain shorthand, which reads as a feature rather than a spec. */
const DRIVETRAIN: [string, string][] = [
  ['4X4', 'Tracción 4x4'],
  ['AWD', 'Tracción en las cuatro ruedas'],
]

/** Engine displacement in litres, written `2.0L` or `1.5L`. */
const DISPLACEMENT = /\b(\d+\.\d+)L\b/

/** Cylinder count, written `4 CIL`. */
const CYLINDERS = /\b(\d+)\s+CIL\b/

/** Door count, written `5 P`. */
const DOORS = /\b(\d+)\s+P\b/

/** Occupant count, written `5 OCUP`. */
const PASSENGERS = /\b(\d+)\s+OCUP\b/

/**
 * Read the first capture of a pattern as a number.
 *
 * @param pattern - The pattern to run, capturing one numeric group.
 * @param text - The description to read, already upper-cased.
 */
function numberFrom(pattern: RegExp, text: string): number | null {
  const match = pattern.exec(text)
  return match === null ? null : Number(match[1])
}

/**
 * Collect the equipment named by a table's shorthand.
 *
 * @param table - Pairs of abbreviation and selling name.
 * @param text - The description to read, already upper-cased.
 */
function equipmentFrom(table: [string, string][], text: string): string[] {
  return table
    .filter(([code]) => new RegExp(`\\b${code}\\b`).test(text))
    .map(([, name]) => name)
}

/**
 * Read every spec a catalogue version description states.
 *
 * @param description - The version description, as the catalogue stores it.
 */
export function parseVersionDescription(description: string): VersionSpecs {
  const text = description.toUpperCase()

  return {
    cylinders: numberFrom(CYLINDERS, text),
    displacementL: numberFrom(DISPLACEMENT, text),
    doors: numberFrom(DOORS, text),
    features: [
      ...equipmentFrom(EQUIPMENT, text),
      ...equipmentFrom(DRIVETRAIN, text),
    ],
    passengers: numberFrom(PASSENGERS, text),
    transmission: detectTransmission(description),
  }
}
