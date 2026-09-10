import type { Translated } from '../../i18n/locales'

/**
 * Ports and domain types for VIN decoding.
 *
 * Everything here is provider-agnostic on purpose: NHTSA's vocabulary
 * (`BodyClass`, `FuelTypePrimary`, `ErrorCode`) never leaves `nhtsa.ts`, so a
 * second provider can be added later without touching the mappers, the
 * endpoint or the admin panel.
 */

/** A vehicle as described by its VIN, in our own vocabulary. */
export interface DecodedVin {
  /** Anti-lock brakes: `Standard`, `Optional` or unknown. */
  abs: string | null
  adaptiveCruiseControl: string | null
  /** Where the curtain airbags are, e.g. "1st and 2nd Rows". */
  airBagLocCurtain: string | null
  airBagLocFront: string | null
  airBagLocKnee: string | null
  airBagLocSide: string | null
  blindSpotMonitor: string | null
  bodyClass: string | null
  displacementL: number | null
  doors: number | null
  driveType: string | null
  /** vPIC's `ElectrificationLevel` — the only place hybrids show up. */
  electrificationLevel: string | null
  engineConfiguration: string | null
  engineCylinders: number | null
  engineHp: number | null
  /** Electronic stability control. */
  esc: string | null
  forwardCollisionWarning: string | null
  fuelTypePrimary: string | null
  keylessIgnition: string | null
  laneDepartureWarning: string | null
  make: string | null
  manufacturer: string | null
  model: string | null
  modelYear: number | null
  parkAssist: string | null
  plantCountry: string | null
  /** vPIC's name for a backup camera. */
  rearVisibilitySystem: string | null
  series: string | null
  transmissionSpeeds: number | null
  transmissionStyle: string | null
  trim: string | null
  vehicleType: string | null
}

/** Where a successful decode came from, for diagnostics and for the panel. */
export type DecodeSource = 'memory' | 'network' | 'store'

/**
 * Why a decode produced nothing. Deliberately a small closed set: the admin
 * turns each one into a translated message, so no English strings travel from
 * the server to the UI.
 */
export type DecodeFailure = 'invalid-vin' | 'not-found' | 'unavailable'

/**
 * The result of a decode. A discriminated union rather than an exception:
 * a decoder that throws would surface in the admin as an unhandled error,
 * and "NHTSA is down" is an ordinary outcome, not a bug.
 */
export type DecodeOutcome =
  | {
      data: DecodedVin
      ok: true
      /**
       * The provider's untranslated payload, present only on a network hit.
       * Persisted alongside the decode so a new mapper can be applied later
       * without spending another call.
       */
      raw?: unknown
      source: DecodeSource
    }
  | { ok: false; reason: DecodeFailure }

/**
 * The single port every decoder implements — the network adapter and each
 * cache decorator alike, which is what lets them be composed in any order.
 */
export interface VinDecoder {
  /**
   * Decode a VIN into vehicle attributes.
   *
   * @param vin - The VIN to decode, normalized or not.
   */
  decode: (vin: string) => Promise<DecodeOutcome>
}

/**
 * Persistence port for the squish-VIN cache. Kept separate from the decoder so
 * the caching decorator can be unit-tested against a fake store, with no
 * database in the loop.
 */
export interface VinCacheStore {
  /**
   * Look up a previously decoded squish VIN.
   *
   * @param squish - The squish VIN key.
   */
  read: (squish: string) => Promise<DecodedVin | null>
  /**
   * Persist a decode under its squish VIN.
   *
   * @param props - The entry to store.
   * @param props.decoded - The decoded attributes.
   * @param props.raw - The provider's untranslated payload, when available.
   * @param props.squish - The squish VIN key.
   * @param props.vin - The full VIN this decode came from, kept as a sample.
   */
  write: (props: {
    decoded: DecodedVin
    raw: unknown
    squish: string
    vin: string
  }) => Promise<void>
}

/**
 * How much to trust a proposed value.
 *
 * - `exact`: read straight off the VIN (year, doors, cylinders).
 * - `inferred`: translated through a lookup table we control (body, fuel).
 * - `guess`: matched by similarity and worth a second look (version).
 */
export type SuggestionConfidence = 'exact' | 'guess' | 'inferred'

/**
 * One proposed value for one field of the Cars form. Nothing is ever written
 * automatically: the panel renders these and the editor picks.
 */
export interface FieldSuggestion {
  confidence: SuggestionConfidence
  /** Human-readable rendering of `value`, when the raw value is an id. */
  display?: string
  label: Translated
  /** Field path in the Cars form, e.g. `bodyType` or `brand`. */
  path: string
  /**
   * An array targets a Payload array field — today only `features`, whose rows
   * the panel appends one by one.
   */
  value: number | string | string[]
}

/**
 * A mapper turns one decoded VIN into a proposal for one field of the Cars
 * form, or into `null` when the VIN says nothing about it.
 *
 * Every mapper is a plain function over plain data — no database, no network —
 * so adding a field to the magic load means adding a mapper, never editing the
 * pipeline that runs them.
 */
export type FieldMapper = (decoded: DecodedVin) => FieldSuggestion | null
