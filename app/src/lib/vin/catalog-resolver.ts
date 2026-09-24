
import { cars, common } from '../../i18n/labels'
import { slugify } from '../slugify'
import { detectTransmission } from '../transmission'

import type { DecodedVin, FieldSuggestion, SuggestionConfidence } from './types'

/**
 * Resolving a decoded VIN against our own catalogue.
 *
 * vPIC answers in its own words — "VOLKSWAGEN", "Mazda3", "Comfortline,
 * Sportline" — while the form stores a brand id, a model name spelled the way
 * the catalogue spells it, and a version description scraped verbatim. This
 * file is the bridge, and it only ever proposes values that already exist in
 * the catalogue: a brand nobody sells or a version nobody listed is worse than
 * an empty field.
 *
 * The database sits behind {@link CatalogRepository} so all of this is unit
 * tested with a fake repository and no Postgres in the loop.
 */

/** A brand as the catalogue stores it. */
export interface CatalogBrand {
  id: number | string
  name: string
  slug: string
}

/** A model as the catalogue stores it. */
export interface CatalogModel {
  id: number | string
  name: string
}

/** Read side of the catalogue, kept to the three lookups this feature needs. */
export interface CatalogRepository {
  /** Every brand, for matching against the decoded make. */
  listBrands: () => Promise<CatalogBrand[]>
  /**
   * The models of one brand.
   *
   * @param brandId - The brand whose models to list.
   */
  listModels: (brandId: number | string) => Promise<CatalogModel[]>
  /**
   * The version descriptions of one model in one year.
   *
   * @param props - Query parameters.
   * @param props.modelId - The model whose versions to list.
   * @param props.year - The model year to filter by.
   */
  listVersionDescriptions: (props: {
    modelId: number | string
    year: number
  }) => Promise<string[]>
}

/**
 * Spellings vPIC uses that the catalogue writes differently. Kept short on
 * purpose: an alias is a claim that two names mean the same brand, and a wrong
 * one silently files cars under the wrong marque.
 */
const BRAND_ALIASES: Record<string, string> = {
  chevy: 'chevrolet',
  gm: 'chevrolet',
  mercedes: 'mercedesbenz',
  vw: 'volkswagen',
}

/** Minimum score a version description needs before it is worth proposing. */
const VERSION_MIN_SCORE = 4

/** Weight of a trim word appearing in the description. */
const TRIM_TOKEN_SCORE = 3

/**
 * Shortest trim word worth matching. Two is deliberate — half the trims sold
 * here are two letters ("EX", "GT", "SE", "XL") — and it is safe because the
 * words are matched whole, so "GT" does not light up inside "GTI".
 */
const MIN_TOKEN_LENGTH = 2

/**
 * Collapse a name to its bare letters and digits, so "Mazda 3", "Mazda3" and
 * "MAZDA-3" compare equal.
 *
 * @param value - The name to collapse.
 */
function compact(value: string | null): string {
  return slugify(value ?? '').replace(/-/g, '')
}

/** One link of the brand-matching chain. */
interface BrandStrategy {
  confidence: SuggestionConfidence
  /**
   * Try to match a make against a brand.
   *
   * @param brand - The catalogue brand under test.
   * @param make - The compacted make decoded from the VIN.
   */
  matches: (brand: CatalogBrand, make: string) => boolean
}

/**
 * Brand matching, from the reading we trust most to the one we trust least.
 * The first link that matches wins, and its confidence travels with the
 * suggestion so the panel can flag the weaker readings.
 */
const BRAND_STRATEGIES: BrandStrategy[] = [
  {
    confidence: 'exact',
    /**
     * The make, slugified, is exactly the brand's slug.
     *
     * @param brand - The catalogue brand under test.
     * @param make - The compacted make decoded from the VIN.
     */
    matches: (brand, make): boolean => compact(brand.slug) === make,
  },
  {
    confidence: 'exact',
    /**
     * The make and the brand name are the same letters.
     *
     * @param brand - The catalogue brand under test.
     * @param make - The compacted make decoded from the VIN.
     */
    matches: (brand, make): boolean => compact(brand.name) === make,
  },
  {
    confidence: 'inferred',
    /**
     * The make is a known other spelling of the brand.
     *
     * @param brand - The catalogue brand under test.
     * @param make - The compacted make decoded from the VIN.
     */
    matches: (brand, make): boolean =>
      BRAND_ALIASES[make] === compact(brand.name),
  },
  {
    confidence: 'guess',
    /**
     * One name is the beginning of the other ("Land Rover" vs "Landrover 4x4").
     *
     * @param brand - The catalogue brand under test.
     * @param make - The compacted make decoded from the VIN.
     */
    matches: (brand, make): boolean => {
      const name = compact(brand.name)
      return name.startsWith(make) || make.startsWith(name)
    },
  },
]

/**
 * Find the catalogue brand a decoded make refers to.
 *
 * @param brands - Every brand in the catalogue.
 * @param make - The make decoded from the VIN.
 */
export function resolveBrand(
  brands: CatalogBrand[],
  make: string | null
): { brand: CatalogBrand; confidence: SuggestionConfidence } | null {
  const needle = compact(make)
  if (!needle) return null

  for (const strategy of BRAND_STRATEGIES) {
    const brand = brands.find((candidate) => strategy.matches(candidate, needle))
    if (brand) return { brand, confidence: strategy.confidence }
  }

  return null
}

/**
 * Find the catalogue model a decoded model name refers to. vPIC writes
 * "Mazda3" where the catalogue writes "Mazda 3", so the comparison ignores
 * spacing entirely.
 *
 * @param models - The models of the already resolved brand.
 * @param model - The model name decoded from the VIN.
 */
export function resolveModel(
  models: CatalogModel[],
  model: string | null
): { confidence: SuggestionConfidence; model: CatalogModel } | null {
  const needle = compact(model)
  if (!needle) return null

  const exact = models.find((candidate) => compact(candidate.name) === needle)
  if (exact) return { confidence: 'exact', model: exact }

  const partial = models.find((candidate) => {
    const name = compact(candidate.name)
    return name.startsWith(needle) || needle.startsWith(name)
  })
  if (partial) return { confidence: 'guess', model: partial }

  return null
}

/**
 * Score how well one catalogue version description matches a decoded VIN.
 *
 * The catalogue descriptions are dense strings like
 * "2.0L EX AA EE CD BA ESTANDAR HATCHBACK 4 CIL 5 P", and vPIC contributes a
 * trim ("EX-V6"), a displacement, a cylinder count, a door count and a
 * transmission. Each agreement adds to the score; nothing subtracts, because a
 * description simply not mentioning the doors is not evidence against it.
 *
 * @param decoded - The vehicle as described by its VIN.
 * @param description - One catalogue version description.
 */
export function scoreVersion(
  decoded: DecodedVin,
  description: string
): number {
  const haystack = description.toUpperCase()
  let score = 0

  const trimWords = `${decoded.trim ?? ''} ${decoded.series ?? ''}`
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((word) => word.length >= MIN_TOKEN_LENGTH)

  for (const word of new Set(trimWords)) {
    if (new RegExp(`\\b${word}\\b`).test(haystack)) score += TRIM_TOKEN_SCORE
  }

  if (decoded.displacementL !== null) {
    if (haystack.includes(decoded.displacementL.toFixed(1))) score += 2
  }

  if (decoded.engineCylinders !== null) {
    if (haystack.includes(`${String(decoded.engineCylinders)} CIL`)) score += 1
  }

  if (decoded.doors !== null) {
    if (haystack.includes(`${String(decoded.doors)} P`)) score += 1
  }

  const style = decoded.transmissionStyle
  if (style !== null) {
    const wanted = style.toUpperCase().includes('MANUAL') ? 'manual' : 'automatic'
    if (detectTransmission(description) === wanted) score += 1
  }

  return score
}

/**
 * Pick the catalogue version that best matches a decoded VIN, or nothing.
 *
 * A tie is treated as no answer: two descriptions scoring the same means the
 * VIN cannot tell them apart, and guessing between them would put the wrong
 * trim on a listing.
 *
 * @param decoded - The vehicle as described by its VIN.
 * @param descriptions - The catalogue versions for the model and year.
 */
export function resolveVersion(
  decoded: DecodedVin,
  descriptions: string[]
): string | null {
  const scored = descriptions.map((description) => ({
    description,
    score: scoreVersion(decoded, description),
  }))

  const best = scored.reduce<{ description: string; score: number } | null>(
    (winner, candidate) =>
      winner === null || candidate.score > winner.score ? candidate : winner,
    null
  )

  if (best === null || best.score < VERSION_MIN_SCORE) return null

  const tied = scored.filter((candidate) => candidate.score === best.score)
  return tied.length === 1 ? best.description : null
}

/**
 * Turn a decoded VIN into proposals for the catalogue-backed fields.
 *
 * Each step depends on the previous one — versions only exist inside a model,
 * models only inside a brand — so the chain stops at the first thing the
 * catalogue does not know, and returns whatever it resolved up to there.
 *
 * @param props - Resolution inputs.
 * @param props.decoded - The vehicle as described by its VIN.
 * @param props.repo - Read access to the catalogue.
 */
export async function resolveCatalogFields(props: {
  decoded: DecodedVin
  repo: CatalogRepository
}): Promise<FieldSuggestion[]> {
  const { decoded, repo } = props
  const suggestions: FieldSuggestion[] = []

  const brandMatch = resolveBrand(await repo.listBrands(), decoded.make)
  if (brandMatch === null) return suggestions

  suggestions.push({
    confidence: brandMatch.confidence,
    display: brandMatch.brand.name,
    label: common.brand,
    path: 'brand',
    value: brandMatch.brand.id,
  })

  const modelMatch = resolveModel(
    await repo.listModels(brandMatch.brand.id),
    decoded.model
  )
  if (modelMatch === null) return suggestions

  suggestions.push({
    confidence: modelMatch.confidence,
    label: common.model,
    path: 'model',
    value: modelMatch.model.name,
  })

  const year = decoded.modelYear
  if (year === null) return suggestions

  const version = resolveVersion(
    decoded,
    await repo.listVersionDescriptions({ modelId: modelMatch.model.id, year })
  )
  if (version === null) return suggestions

  suggestions.push({
    confidence: 'guess',
    label: cars.fields.version.label,
    path: 'version',
    value: version,
  })

  return suggestions
}
