/**
 * Rebuilds `app/src/seed/vehicle-catalog.json` from the public quoter API.
 *
 * The catalogue behind the seed file was captured by hand once and has been
 * frozen since; this makes it reproducible, so a new model year is a command
 * rather than an afternoon.
 *
 * ## The session
 *
 * The API sits behind Akamai Bot Manager. Akamai guards the *acquisition* of a
 * session, not its use: once a real browser has one, plain HTTP calls work
 * fine. So the script does not drive a browser — it takes the cookie header
 * from one and reuses it:
 *
 * 1. Open the quoter in a browser and pick any brand, so a catalogue call fires.
 * 2. Copy that request as cURL and take its `-b` cookie string.
 * 3. Put it in `.bbva-cookie` at the repo root (git-ignored).
 *
 * Those cookies live minutes, not hours, so a long run can outlive them. That
 * is why every response is checked for the API's error envelope: the run stops
 * and says the session died, instead of writing thousands of empty brands over
 * a good catalogue.
 *
 * ## Running it
 *
 * ```
 * bun run catalog:scrape            # full refresh, writes the JSON
 * bun run catalog:scrape -- --diff  # report what changed, write nothing
 * ```
 *
 * A run is resumable: progress is checkpointed per (year, brand), so an expired
 * session costs you the cookie, not the hour.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const COOKIE_FILE = path.join(ROOT, '.bbva-cookie')
const OUTPUT_FILE = path.join(ROOT, 'app/src/seed/vehicle-catalog.json')
const CHECKPOINT_FILE = path.join(ROOT, '.catalog-scrape-checkpoint.json')

const API =
  'https://cotizadores.bbvaseguros.mx/psns_mult_web_psnspublicwebapp_02/api/autos/aso/catalogos'

const REFERER =
  'https://cotizadores.bbvaseguros.mx/psns_mult_web_psnspublicwebapp_02/autoSeguroBancomer'

/**
 * Pause between calls. The quoter answers in ~0.3s, so this is politeness
 * rather than backpressure: roughly two requests a second, which is slower
 * than a person clicking through the form.
 */
const DELAY_MS = 500

/**
 * Model years to walk. The frozen catalogue covers 2020-2026; the extra year
 * ahead is where next season's models show up first.
 */
const YEARS = ((): number[] => {
  const last = new Date().getFullYear() + 1
  const years: number[] = []
  for (let year = 2020; year <= last; year += 1) years.push(year)
  return years
})()

/**
 * Both origins are walked. The hand-made catalogue was captured with
 * `NACIONAL` only, which would have dropped every imported model — and in this
 * market that is a lot of inventory.
 */
const ORIGINS = ['NACIONAL', 'IMPORTADO']

/** The quoter's product selector, copied from the live request verbatim. */
const PRODUCT_PLAN = [
  {
    codigoPlan: '005',
    codigoProducto: '2010',
    codigoRamo: 'AUAR',
    revisionPlan: '005',
  },
]

/** A code/description pair, the shape every catalogue level answers with. */
interface CatalogRef {
  codigoInterno: string
  descripcionInterna: string
}

/** One row of the `versiones` response. */
interface VersionRow {
  codigoInternoAutomovil?: string
  version?: { codigoInterno?: string; descripcionInterna?: string }
}

/** The API's error envelope, returned with HTTP 200. */
interface ErrorEnvelope {
  errorFormDto?: { operacionMensaje?: string[]; operacionResultado?: string }
}

/** A version as the seed file stores it. */
interface SeedVersion {
  clave: string
  description: string
  years: number[]
}

/** A model as the seed file stores it. */
interface SeedModel {
  name: string
  versions: SeedVersion[]
}

/** A brand as the seed file stores it. */
interface SeedBrand {
  models: SeedModel[]
  name: string
}

/** The seed file itself. */
interface SeedCatalog {
  brands: SeedBrand[]
  generatedAt: string
}

/** Raised when the API stops recognising our session. */
class SessionExpired extends Error {}

/**
 * Wait between calls.
 *
 * @param ms - How long to wait, in milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Read the cookie header captured from a browser.
 */
async function readCookie(): Promise<string> {
  const fromEnv = process.env.BBVA_COOKIE?.trim()
  if (fromEnv) return fromEnv

  try {
    const contents = await readFile(COOKIE_FILE, 'utf8')
    const cookie = contents.trim()
    if (cookie) return cookie
  } catch {
    // Fall through to the instructions below.
  }

  throw new Error(
    `No session. Put the cookie header from a browser request into ${COOKIE_FILE}, ` +
      'or set BBVA_COOKIE. See the comment at the top of this file.'
  )
}

/**
 * Call one catalogue endpoint.
 *
 * @param props - Call parameters.
 * @param props.body - The JSON body to post.
 * @param props.cookie - The captured cookie header.
 * @param props.endpoint - The endpoint name, e.g. `versiones`.
 */
async function post(props: {
  body: Record<string, unknown>
  cookie: string
  endpoint: string
}): Promise<unknown> {
  const { body, cookie, endpoint } = props

  const response = await fetch(`${API}/${endpoint}`, {
    body: JSON.stringify(body),
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      cookie,
      origin: 'https://cotizadores.bbvaseguros.mx',
      referer: REFERER,
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`${endpoint} answered HTTP ${String(response.status)}`)
  }

  const parsed: unknown = await response.json()

  // The API reports failure with HTTP 200 and this envelope. The most common
  // cause by far is an expired session, which otherwise looks exactly like a
  // brand that has no models.
  if (!Array.isArray(parsed)) {
    const envelope = parsed as ErrorEnvelope
    const message = envelope.errorFormDto?.operacionMensaje?.join(', ')
    throw new SessionExpired(
      `${endpoint} refused the request${message ? `: ${message}` : ''}. ` +
        'The captured cookies have most likely expired — grab a fresh set.'
    )
  }

  return parsed
}

/**
 * The fields every catalogue call carries.
 *
 * Note the two spellings of the origin filter: `subMarcas` expects
 * `listaTiposOrigenVehiculo` and `versiones` expects `listaTipoOrigenVehiculo`,
 * singular. They are not interchangeable — the wrong one returns an empty list
 * rather than an error, so a scraper using it would quietly report that the
 * whole catalogue is empty.
 *
 * @param year - The model year, which the API calls `modelo`.
 */
function baseBody(year: number): Record<string, unknown> {
  return {
    listaProductosPlan: PRODUCT_PLAN,
    modelo: String(year),
    tipoVehiculo: ['AUTOMOVILES'],
  }
}

/**
 * List every brand offered for a model year.
 *
 * TODO: the body below is unverified. `marcas` rejected every shape tried so
 * far — the `subMarcas` body without `marcaVehiculo`, the same with the
 * singular origin key, and a plain GET — all answering `ERROR_SERVICIO`.
 * Capture the real request from the browser's network tab and correct this one
 * function; the rest of the script is verified against the live API.
 *
 * @param cookie - The captured cookie header.
 * @param year - The model year to list brands for.
 */
async function fetchBrands(cookie: string, year: number): Promise<CatalogRef[]> {
  const brands = await post({
    body: { ...baseBody(year), listaTipoOrigenVehiculo: ORIGINS },
    cookie,
    endpoint: 'marcas',
  })

  return brands as CatalogRef[]
}

/**
 * List the models a brand offered in a model year.
 *
 * @param cookie - The captured cookie header.
 * @param year - The model year.
 * @param brand - The brand to list models for.
 */
async function fetchModels(
  cookie: string,
  year: number,
  brand: CatalogRef
): Promise<CatalogRef[]> {
  const models = await post({
    body: {
      ...baseBody(year),
      listaTiposOrigenVehiculo: ORIGINS,
      marcaVehiculo: { ...brand, selected: false },
    },
    cookie,
    endpoint: 'subMarcas',
  })

  return models as CatalogRef[]
}

/**
 * List the versions a model offered in a model year.
 *
 * @param cookie - The captured cookie header.
 * @param year - The model year.
 * @param brand - The model's brand.
 * @param model - The model to list versions for.
 */
async function fetchVersions(
  cookie: string,
  year: number,
  brand: CatalogRef,
  model: CatalogRef
): Promise<{ clave: string; description: string }[]> {
  const rows = (await post({
    body: {
      ...baseBody(year),
      listaTipoOrigenVehiculo: ORIGINS,
      marcaVehiculo: { ...brand, selected: false },
      subMarcaVehiculo: { ...model, selected: false },
    },
    cookie,
    endpoint: 'versiones',
  })) as VersionRow[]

  return rows
    .map((row) => ({
      clave: row.codigoInternoAutomovil ?? '',
      description: row.version?.descripcionInterna ?? '',
    }))
    .filter((row) => row.clave !== '' && row.description !== '')
}

/**
 * Accumulator holding one brand while its years are walked.
 */
type BrandAccumulator = Map<string, Map<string, SeedVersion>>

/**
 * Fold one version into the accumulator, merging the years of a version that
 * several model years share — which is most of them, since these descriptions
 * belong to a generation rather than to a calendar year.
 *
 * @param props - What to record.
 * @param props.brandModels - The brand's models so far.
 * @param props.clave - The version's catalogue key.
 * @param props.description - The version's description.
 * @param props.modelName - The model the version belongs to.
 * @param props.year - The model year this sighting came from.
 */
function record(props: {
  brandModels: BrandAccumulator
  clave: string
  description: string
  modelName: string
  year: number
}): void {
  const { brandModels, clave, description, modelName, year } = props

  const versions = brandModels.get(modelName) ?? new Map<string, SeedVersion>()
  brandModels.set(modelName, versions)

  const existing = versions.get(clave)
  if (existing === undefined) {
    versions.set(clave, { clave, description, years: [year] })
    return
  }

  if (!existing.years.includes(year)) existing.years.push(year)
}

/**
 * Shape the accumulators into the seed file's structure, sorted so two runs of
 * the same catalogue produce byte-identical files and a diff shows only real
 * changes.
 *
 * @param brands - Every brand's accumulated models.
 */
function toSeedCatalog(brands: Map<string, BrandAccumulator>): SeedCatalog {
  const shaped: SeedBrand[] = [...brands.entries()]
    .map(([name, models]) => ({
      models: [...models.entries()]
        .map(([modelName, versions]) => ({
          name: modelName,
          versions: [...versions.values()]
            .map((version) => ({
              ...version,
              years: [...version.years].sort((a, b) => a - b),
            }))
            .sort((left, right) => left.clave.localeCompare(right.clave)),
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
      name,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

  return { brands: shaped, generatedAt: new Date().toISOString() }
}

/**
 * Count the pieces of a catalogue, for the run summary and the diff.
 *
 * @param catalog - The catalogue to measure.
 */
function countOf(catalog: SeedCatalog): {
  brands: number
  models: number
  versions: number
} {
  const models = catalog.brands.reduce((sum, b) => sum + b.models.length, 0)
  const versions = catalog.brands.reduce(
    (sum, b) => sum + b.models.reduce((n, m) => n + m.versions.length, 0),
    0
  )
  return { brands: catalog.brands.length, models, versions }
}

/**
 * Report what a fresh capture would change, without writing anything.
 *
 * This is the mode worth running often: a full refresh is thousands of calls,
 * but the answer people act on is "what is new", and that fits in a paragraph.
 *
 * @param next - The freshly captured catalogue.
 */
async function reportDiff(next: SeedCatalog): Promise<void> {
  const previous = JSON.parse(
    await readFile(OUTPUT_FILE, 'utf8')
  ) as SeedCatalog

  /**
   * Index every version of a catalogue by brand, model and key.
   *
   * @param catalog - The catalogue to index.
   */
  const index = (catalog: SeedCatalog): Map<string, string> => {
    const out = new Map<string, string>()
    for (const brand of catalog.brands) {
      for (const model of brand.models) {
        for (const version of model.versions) {
          out.set(
            `${brand.name}|${model.name}|${version.clave}`,
            version.description
          )
        }
      }
    }
    return out
  }

  const before = index(previous)
  const after = index(next)

  const added = [...after.keys()].filter((key) => !before.has(key))
  const removed = [...before.keys()].filter((key) => !after.has(key))
  const changed = [...after.entries()].filter(
    ([key, description]) =>
      before.has(key) && before.get(key) !== description
  )

  const was = countOf(previous)
  const now = countOf(next)

  process.stdout.write(
    [
      '',
      'Diff against the committed catalogue',
      `  brands    ${String(was.brands)} → ${String(now.brands)}`,
      `  models    ${String(was.models)} → ${String(now.models)}`,
      `  versions  ${String(was.versions)} → ${String(now.versions)}`,
      '',
      `  ${String(added.length)} new, ${String(removed.length)} gone, ${String(changed.length)} reworded`,
      '',
      ...added.slice(0, 15).map((key) => `  + ${key}`),
      added.length > 15 ? `  … ${String(added.length - 15)} more` : '',
      ...removed.slice(0, 15).map((key) => `  - ${key}`),
      removed.length > 15 ? `  … ${String(removed.length - 15)} more` : '',
      '',
    ]
      .filter((line) => line !== '')
      .join('\n') + '\n'
  )
}

/**
 * Walk the whole catalogue.
 */
async function main(): Promise<void> {
  const diffOnly = process.argv.includes('--diff')
  const cookie = await readCookie()

  const brands = new Map<string, BrandAccumulator>()
  const done = new Set<string>(
    await readFile(CHECKPOINT_FILE, 'utf8')
      .then((raw) => JSON.parse(raw) as string[])
      .catch((): string[] => [])
  )

  let calls = 0

  try {
    for (const year of YEARS) {
      const yearBrands = await fetchBrands(cookie, year)
      calls += 1
      await sleep(DELAY_MS)

      for (const brand of yearBrands) {
        const checkpoint = `${String(year)}|${brand.codigoInterno}`
        if (done.has(checkpoint)) continue

        const models = await fetchModels(cookie, year, brand)
        calls += 1
        await sleep(DELAY_MS)

        const brandModels =
          brands.get(brand.descripcionInterna) ?? (new Map() as BrandAccumulator)
        brands.set(brand.descripcionInterna, brandModels)

        for (const model of models) {
          const versions = await fetchVersions(cookie, year, brand, model)
          calls += 1
          await sleep(DELAY_MS)

          for (const version of versions) {
            record({
              brandModels,
              clave: version.clave,
              description: version.description,
              modelName: model.descripcionInterna,
              year,
            })
          }
        }

        done.add(checkpoint)
        process.stdout.write(
          `${String(year)} ${brand.descripcionInterna} — ${String(models.length)} models, ${String(calls)} calls\n`
        )
      }
    }
  } catch (error) {
    await writeFile(CHECKPOINT_FILE, JSON.stringify([...done]), 'utf8')
    if (error instanceof SessionExpired) {
      process.stderr.write(
        `\n${error.message}\nProgress kept in ${CHECKPOINT_FILE}; rerun with a fresh cookie to continue.\n`
      )
      process.exitCode = 1
      return
    }
    throw error
  }

  const catalog = toSeedCatalog(brands)

  if (diffOnly) {
    await reportDiff(catalog)
    return
  }

  await writeFile(OUTPUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  const totals = countOf(catalog)
  process.stdout.write(
    `\nWrote ${OUTPUT_FILE}\n  ${String(totals.brands)} brands, ${String(totals.models)} models, ${String(totals.versions)} versions in ${String(calls)} calls\n`
  )
}

await main()
