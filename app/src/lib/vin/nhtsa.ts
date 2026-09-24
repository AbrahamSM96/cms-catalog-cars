import type { DecodedVin, DecodeOutcome, VinDecoder } from './types'
import { isValidVin, modelYearFromVin, normalizeVin } from './vin'

/**
 * Adapter for NHTSA's vPIC decoder — the anti-corruption layer of this
 * feature. vPIC's vocabulary (`BodyClass`, `FuelTypePrimary`, empty strings
 * for "unknown") stops at this file's boundary; everything downstream sees a
 * {@link DecodedVin}.
 *
 * The service is free, needs no key and publishes no rate limit, but it is
 * still a third party on the critical path of the admin form, so every call is
 * bounded by a timeout and retried at most once.
 */

const VPIC_URL =
  'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended'

/** How long to wait before giving up on a single attempt. */
const TIMEOUT_MS = 5000

/** Total attempts per decode: one retry for a blip, then fail honestly. */
const MAX_ATTEMPTS = 2

/**
 * vPIC returns every attribute as a string, using the empty string — and
 * occasionally these phrases — to mean "unknown".
 */
const EMPTY_VALUES = new Set(['', 'not applicable', 'not available'])

/** One row of vPIC's flat `Results` array. Unlisted keys are ignored. */
type VpicRow = Record<string, string | undefined>

interface VpicResponse {
  Results?: VpicRow[]
}

/**
 * Read a vPIC attribute as text, collapsing its several spellings of
 * "unknown" into `null`.
 *
 * @param raw - The raw attribute value.
 */
function text(raw: string | undefined): string | null {
  const value = raw?.trim() ?? ''
  return EMPTY_VALUES.has(value.toLowerCase()) ? null : value
}

/**
 * Read a vPIC attribute as a number. Values arrive padded ("170.00",
 * "2.480000").
 *
 * @param raw - The raw attribute value.
 */
function num(raw: string | undefined): number | null {
  const value = text(raw)
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Read a vPIC attribute as a whole number.
 *
 * @param raw - The raw attribute value.
 */
function int(raw: string | undefined): number | null {
  const value = num(raw)
  return value === null ? null : Math.round(value)
}

/**
 * Translate one vPIC row into our own vehicle description.
 *
 * @param row - The row returned by vPIC.
 */
function toDecodedVin(row: VpicRow): DecodedVin {
  return {
    abs: text(row.ABS),
    adaptiveCruiseControl: text(row.AdaptiveCruiseControl),
    airBagLocCurtain: text(row.AirBagLocCurtain),
    airBagLocFront: text(row.AirBagLocFront),
    airBagLocKnee: text(row.AirBagLocKnee),
    airBagLocSide: text(row.AirBagLocSide),
    blindSpotMonitor: text(row.BlindSpotMon),
    bodyClass: text(row.BodyClass),
    displacementL: num(row.DisplacementL),
    doors: int(row.Doors),
    driveType: text(row.DriveType),
    electrificationLevel: text(row.ElectrificationLevel),
    engineConfiguration: text(row.EngineConfiguration),
    engineCylinders: int(row.EngineCylinders),
    engineHp: int(row.EngineHP),
    esc: text(row.ESC),
    forwardCollisionWarning: text(row.ForwardCollisionWarning),
    fuelTypePrimary: text(row.FuelTypePrimary),
    keylessIgnition: text(row.KeylessIgnition),
    laneDepartureWarning: text(row.LaneDepartureWarning),
    make: text(row.Make),
    manufacturer: text(row.Manufacturer),
    model: text(row.Model),
    modelYear: int(row.ModelYear),
    parkAssist: text(row.ParkAssist),
    plantCountry: text(row.PlantCountry),
    rearVisibilitySystem: text(row.RearVisibilitySystem),
    series: text(row.Series),
    transmissionSpeeds: int(row.TransmissionSpeeds),
    transmissionStyle: text(row.TransmissionStyle),
    trim: text(row.Trim),
    vehicleType: text(row.VehicleType),
  }
}

/**
 * Build the request URL. The model year is passed along when the VIN encodes
 * one: vPIC uses it to disambiguate the 30-year cycle of position 10 and
 * returns noticeably better data with it.
 *
 * @param vin - A normalized VIN.
 */
function requestUrl(vin: string): string {
  const year = modelYearFromVin(vin)
  const base = `${VPIC_URL}/${vin}?format=json`
  return year === null ? base : `${base}&modelyear=${String(year)}`
}

/**
 * Call vPIC, retrying once on a network or server error. Returns `null` when
 * the service could not be reached at all, which the caller reports as
 * `unavailable` rather than as "no such vehicle".
 *
 * @param vin - A normalized VIN.
 */
async function fetchRow(vin: string): Promise<VpicRow | null> {
  const url = requestUrl(vin)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!response.ok) continue

      const body = (await response.json()) as VpicResponse
      return body.Results?.[0] ?? null
    } catch {
      // Timeout, DNS failure or malformed body: fall through to the retry.
    }
  }

  return null
}

/**
 * Build the vPIC-backed decoder.
 *
 * It is deliberately the innermost layer: wrap it in the cache decorators from
 * `cache.ts` so repeated VINs from the same model, year and plant never reach
 * the network at all.
 */
export function nhtsaVinDecoder(): VinDecoder {
  return {
    /**
     * Decode a VIN through vPIC.
     *
     * @param rawVin - The VIN to decode, normalized or not.
     */
    decode: async (rawVin: string): Promise<DecodeOutcome> => {
      const vin = normalizeVin(rawVin)
      if (!isValidVin(vin)) return { ok: false, reason: 'invalid-vin' }

      const row = await fetchRow(vin)
      if (row === null) return { ok: false, reason: 'unavailable' }

      const data = toDecodedVin(row)

      // vPIC answers 200 with an all-empty row for a VIN it cannot place:
      // structurally fine, describing no vehicle.
      if (data.make === null && data.model === null) {
        return { ok: false, reason: 'not-found' }
      }

      return { data, ok: true, raw: row, source: 'network' }
    },
  }
}
