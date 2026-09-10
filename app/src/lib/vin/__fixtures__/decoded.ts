import type { DecodedVin } from '../types'

/**
 * A decoded VIN with every attribute unknown, so each test states only the
 * attributes it is actually about.
 */
const EMPTY: DecodedVin = {
  abs: null,
  adaptiveCruiseControl: null,
  airBagLocCurtain: null,
  airBagLocFront: null,
  airBagLocKnee: null,
  airBagLocSide: null,
  blindSpotMonitor: null,
  bodyClass: null,
  displacementL: null,
  doors: null,
  driveType: null,
  electrificationLevel: null,
  engineConfiguration: null,
  engineCylinders: null,
  engineHp: null,
  esc: null,
  forwardCollisionWarning: null,
  fuelTypePrimary: null,
  keylessIgnition: null,
  laneDepartureWarning: null,
  make: null,
  manufacturer: null,
  model: null,
  modelYear: null,
  parkAssist: null,
  plantCountry: null,
  rearVisibilitySystem: null,
  series: null,
  transmissionSpeeds: null,
  transmissionStyle: null,
  trim: null,
  vehicleType: null,
}

/**
 * Build a decoded VIN for a test.
 *
 * @param overrides - The attributes this test cares about.
 */
export function decodedVin(overrides: Partial<DecodedVin> = {}): DecodedVin {
  return { ...EMPTY, ...overrides }
}
