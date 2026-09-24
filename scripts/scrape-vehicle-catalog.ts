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
 * from one and reuses it. `bun run catalog:cookie` captures that header into
 * `.bbva-cookie` (git-ignored) for you; `BBVA_COOKIE` overrides it.
 *
 * Those cookies live minutes, not hours, and a full run takes hours — so it
 * *will* outlive several of them. That is the normal shape of a refresh here,
 * not a failure: every response is checked for the API's error envelope, and a
 * dead session stops the run cleanly instead of writing thousands of empty
 * brands over a good catalogue. Capture a fresh cookie, run again, continue.
 *
 * ## Running it
 *
 * ```
 * bun run catalog:scrape                  # asks which year, defaults to the oldest missing
 * bun run catalog:scrape -- --year=2019   # same, without the question
 * bun run catalog:scrape -- --all         # every missing year, hours of them
 * bun run catalog:scrape -- --diff        # report what it would add, write nothing
 * bun run catalog:scrape -- --from=2015   # do not go further back than this
 * bun run catalog:scrape -- --refresh     # walk every year again, from scratch
 * ```
 *
 * A run is one year unless you say otherwise. One year is about 1,200 calls and
 * ten minutes, which is roughly what a captured session lives; a run that spans
 * years spans sessions, and the JSON is written only when the whole run
 * finishes — so a span that dies halfway has written nothing at all.
 *
 * The default is additive: the committed catalogue is read first, the years it
 * already covers are skipped, and what comes back is folded in. Paying again
 * for a year you already have is hours of somebody's afternoon.
 *
 * `--refresh` is for when the catalogue itself is suspect rather than merely
 * incomplete — a year captured wrong stays wrong otherwise, because being
 * present is all it takes to be skipped.
 *
 * A run is resumable, and resumable here means the data too: after every
 * (year, brand) pair both the pairs walked and everything captured go into
 * `.catalog-scrape-checkpoint.json`. An expired session costs you the cookie,
 * not the hours. The checkpoint is deleted once a run completes.
 */

import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'

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
 * How far back the quoter goes. Its own form says it only insures cars up to
 * thirty years old, and asking for older years returns nothing — so this is the
 * floor of what the catalogue can tell us, not a choice.
 */
const MAX_AGE_YEARS = 30

/**
 * Read a `--flag=value` argument.
 *
 * @param flag - The flag including its trailing `=`.
 */
function flagValue(flag: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(flag))?.slice(flag.length)
}

/**
 * Parse a comma-separated year list.
 *
 * @param value - Years as typed, at a prompt or after `--year=`.
 */
function parseYears(value: string): number[] {
  return value
    .split(',')
    .map((year) => Number(year.trim()))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b)
}

/**
 * Whether this run only reports, and so must leave nothing behind.
 *
 * Read once at module level because it governs the checkpoint, and a report
 * that persists a checkpoint is not a report: `--diff` writes no catalogue, but
 * it used to leave its accumulated data on disk anyway, where the next real run
 * would pick it up and commit it. Findings from a run you asked not to keep
 * should not arrive in the seed file by the side door.
 */
const DIFF_ONLY = process.argv.includes('--diff')

/**
 * Every model year the quoter can answer for, oldest first — the pool a run
 * picks from, not the run itself. `--from=YYYY` raises its floor.
 */
const RANGE = ((): number[] => {
  const requested = Number(flagValue('--from='))
  const last = new Date().getFullYear() + 1
  const floor = last - 1 - MAX_AGE_YEARS
  const first = Number.isFinite(requested) ? Math.max(requested, floor) : floor

  const years: number[] = []
  for (let year = first; year <= last; year += 1) years.push(year)
  return years
})()

/**
 * The only origin the API accepts.
 *
 * Adding `IMPORTADO` looks obviously right — this market runs on imported
 * inventory — and it is how this constant read for a while. It is also what
 * broke every endpoint: `marcas` and `subMarcas` answer `Operativa
 * temporalmente no disponible` to any list containing it, and to `IMPORTADO`
 * alone. Whatever the field once selected, today it takes one value.
 *
 * Nothing is lost by it. `NACIONAL` returns all 90 brands the quoter knows,
 * imported marques included, so the filter no longer filters.
 */
const ORIGINS = ['NACIONAL']

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
  slug: string
}

/** The seed file itself. */
interface SeedCatalog {
  brands: SeedBrand[]
  generatedAt: string
}

/**
 * What a run leaves on disk between sessions.
 *
 * Both halves are needed and for a while only one was here: `done` says which
 * (year, brand) pairs not to walk again, and `catalog` holds what walking them
 * produced. Keeping the first without the second is worse than keeping neither
 * — the rerun skips those brands and writes a catalogue quietly missing them.
 */
interface Checkpoint {
  catalog: SeedCatalog
  done: string[]
}

/** Raised when the API stops recognising our session. */
class SessionExpired extends Error {}

/**
 * Put a name in the catalogue's own casing.
 *
 * The API shouts everything — `ACURA`, `4RUNNER`, `FJ CRUISER` — while the seed
 * file, and therefore the site, stores `Acura`, `4runner`, `Fj Cruiser`. A full
 * rebuild never noticed the difference because it was uniformly wrong; folding
 * new years into an existing catalogue does, and the result is every brand
 * listed twice, once per casing.
 *
 * Words split on spaces only: `C-HR` is `C-hr` and `D-20` is `D-20`, which is
 * what the committed catalogue says and what every one of its 2,900 model names
 * agrees with.
 *
 * @param value - The name as the API shouts it.
 */
function titleCase(value: string): string {
  return value
    .split(' ')
    .map(
      (word) =>
        `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`
    )
    .join(' ')
}

/**
 * Build a brand's slug the way the committed catalogue builds it.
 *
 * Regenerated rather than carried over, which holds for all ninety brands —
 * with one exception worth keeping: `Lynk & Co` slugs to `lynk-and-co`, so the
 * ampersand spells itself out instead of dropping.
 *
 * @param name - The brand name, already in catalogue casing.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
}

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
    `No session. Run \`bun run catalog:cookie\` to capture one into ${COOKIE_FILE}, ` +
      'or set BBVA_COOKIE yourself.'
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
        'Usually that means the captured cookies expired — run ' +
        '`bun run catalog:cookie` for a fresh set. If a fresh session fails the ' +
        `same way, it is not the session: compare ${endpoint}'s body against a ` +
        'live capture, because this API answers a misspelled key the same way.'
    )
  }

  return parsed
}

/**
 * The fields every catalogue call carries.
 *
 * Three endpoints, three spellings of the origin filter, all for the same
 * field: `marcas` wants `listaTiposOrigenesVehiculos`, `subMarcas` wants
 * `listaTiposOrigenVehiculo`, and `versiones` wants `listaTipoOrigenVehiculo`.
 * They are not interchangeable, and the failure is quiet in the worst way: the
 * wrong key returns an empty list rather than an error, so a scraper using one
 * would cheerfully report that the whole catalogue is empty. Probed directly —
 * `versiones` on a 2024 Corolla answers with ten versions for the spelling
 * above and a clean `[]` for the other two.
 *
 * Which is why the origin key lives at each call site instead of here — there
 * is no single correct spelling to put in a shared body.
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
 * This one does not use `baseBody`, and that is not an oversight: `marcas`
 * spells the plan key `listaProductoPlan` where the other two endpoints spell
 * it `listaProductosPlan`. Together with the origin key below, that makes two
 * of the four fields differently named for the same data — which is why every
 * shape borrowed from the working endpoints was rejected, and why the body is
 * written out in full here rather than derived.
 *
 * Captured from the live request by `bun run catalog:cookie`; if it ever starts
 * failing again, recapture rather than guess.
 *
 * @param cookie - The captured cookie header.
 * @param year - The model year to list brands for.
 */
async function fetchBrands(
  cookie: string,
  year: number
): Promise<CatalogRef[]> {
  const brands = await post({
    body: {
      listaProductoPlan: PRODUCT_PLAN,
      listaTiposOrigenesVehiculos: ORIGINS,
      modelo: String(year),
      tipoVehiculo: ['AUTOMOVILES'],
    },
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
      slug: slugify(name),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

  return { brands: shaped, generatedAt: new Date().toISOString() }
}

/**
 * Rebuild the accumulators from a catalogue, so a resumed run carries forward
 * everything the previous session captured.
 *
 * @param catalog - The catalogue held in the checkpoint.
 */
function fromSeedCatalog(catalog: SeedCatalog): Map<string, BrandAccumulator> {
  const brands = new Map<string, BrandAccumulator>()

  for (const brand of catalog.brands) {
    const models: BrandAccumulator = new Map()
    for (const model of brand.models) {
      const versions = new Map<string, SeedVersion>()
      for (const version of model.versions) {
        versions.set(version.clave, { ...version, years: [...version.years] })
      }
      models.set(model.name, versions)
    }
    brands.set(brand.name, models)
  }

  return brands
}

/**
 * Read the checkpoint a previous session left behind.
 *
 * A checkpoint in the old format — a bare array of done pairs, with no captured
 * data beside it — is thrown away rather than honoured. Trusting its `done`
 * list would skip brands whose versions no longer exist anywhere.
 */
async function readCheckpoint(): Promise<Checkpoint> {
  const empty: Checkpoint = {
    catalog: { brands: [], generatedAt: new Date().toISOString() },
    done: [],
  }

  try {
    const parsed: unknown = JSON.parse(await readFile(CHECKPOINT_FILE, 'utf8'))

    if (Array.isArray(parsed)) {
      process.stdout.write(
        'Ignoring a checkpoint from an older version that kept no data.\n'
      )
      return empty
    }

    const checkpoint = parsed as Partial<Checkpoint>
    if (checkpoint.catalog === undefined) return empty

    return { catalog: checkpoint.catalog, done: checkpoint.done ?? [] }
  } catch {
    return empty
  }
}

/**
 * Persist the run so far.
 *
 * Called after every brand rather than only on the way out: a session that
 * dies is the expected ending here, not the exceptional one.
 *
 * @param props - The run's state.
 * @param props.brands - Everything captured so far.
 * @param props.done - The (year, brand) pairs already walked.
 */
async function saveCheckpoint(props: {
  brands: Map<string, BrandAccumulator>
  done: Set<string>
}): Promise<void> {
  const { brands, done } = props

  if (DIFF_ONLY) return

  await writeFile(
    CHECKPOINT_FILE,
    JSON.stringify({ catalog: toSeedCatalog(brands), done: [...done] }),
    'utf8'
  )
}

/**
 * Read the committed catalogue, or an empty one the first time.
 */
async function readSeedCatalog(): Promise<SeedCatalog> {
  try {
    return JSON.parse(await readFile(OUTPUT_FILE, 'utf8')) as SeedCatalog
  } catch {
    return { brands: [], generatedAt: new Date().toISOString() }
  }
}

/**
 * Every model year a catalogue already covers.
 *
 * Years are recorded per version rather than at the top, so this is the only
 * honest way to ask what a run produced — and it answers per year, which is
 * the unit the walk skips by.
 *
 * @param catalog - The catalogue to inspect.
 */
function yearsIn(catalog: SeedCatalog): Set<number> {
  const years = new Set<number>()

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      for (const version of model.versions) {
        for (const year of version.years) years.add(year)
      }
    }
  }

  return years
}

/**
 * Write a list of years as ranges: `1996-2019, 2027`.
 *
 * The years left to walk are usually a gap around what you already have, so
 * printing first-to-last would claim a span that includes everything being
 * skipped — the one thing the reader is trying to confirm.
 *
 * @param years - The years to describe, in ascending order.
 */
function asRanges(years: number[]): string {
  const parts: string[] = []
  let start: number | undefined
  let previous: number | undefined

  /**
   * Close the range being accumulated.
   */
  const flush = (): void => {
    if (start === undefined || previous === undefined) return
    parts.push(
      start === previous
        ? String(start)
        : `${String(start)}-${String(previous)}`
    )
  }

  for (const year of years) {
    if (previous !== undefined && year === previous + 1) {
      previous = year
      continue
    }
    flush()
    start = year
    previous = year
  }

  flush()

  return parts.join(', ')
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
 * Serialise the catalogue the way the committed file is written.
 *
 * `JSON.stringify(_, null, 2)` puts every year on its own line, which turns the
 * whole point of a run — a version gaining a model year — into five changed
 * lines instead of one. Across a catalogue this size that is forty thousand
 * lines of noise burying the eighty that matter, and this file is reviewed once
 * per year walked.
 *
 * `generatedAt` leads, as it does in the committed file, so the only thing a
 * diff shows is the catalogue itself.
 *
 * @param catalog - The catalogue to write.
 */
function serialize(catalog: SeedCatalog): string {
  const json = JSON.stringify(
    // eslint-disable-next-line sort-keys -- matches the committed file's layout
    { generatedAt: catalog.generatedAt, brands: catalog.brands },
    null,
    2
  )

  // Only arrays of bare numbers collapse, which in this shape is `years` alone:
  // every other array holds objects and cannot match.
  return `${json.replaceAll(
    /\[\n\s+((?:\d+,\n\s+)*\d+)\n\s+\]/g,
    (_match, inner: string) => `[${inner.replaceAll(/\s+/g, ' ')}]`
  )}\n`
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
   * Years are indexed alongside the description because they are most of what
   * a run actually changes. Scraping a model year finds mostly claves you
   * already have, each gaining one year — and a diff blind to that reports
   * "0 changed" for a run that touched thousands of rows.
   *
   * @param catalog - The catalogue to index.
   */
  const index = (catalog: SeedCatalog): Map<string, SeedVersion> => {
    const out = new Map<string, SeedVersion>()
    for (const brand of catalog.brands) {
      for (const model of brand.models) {
        for (const version of model.versions) {
          out.set(`${brand.name}|${model.name}|${version.clave}`, version)
        }
      }
    }
    return out
  }

  const before = index(previous)
  const after = index(next)

  const added = [...after.keys()].filter((key) => !before.has(key))
  const removed = [...before.keys()].filter((key) => !after.has(key))

  const changed: string[] = []
  const reyeared: string[] = []

  for (const [key, version] of after) {
    const was = before.get(key)
    if (was === undefined) continue

    if (was.description !== version.description) changed.push(key)

    const gained = version.years.filter((year) => !was.years.includes(year))
    if (gained.length > 0) {
      reyeared.push(`${key}  +${gained.join(',')}`)
    }
  }

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
      `  ${String(added.length)} new, ${String(removed.length)} gone, ` +
        `${String(changed.length)} reworded, ${String(reyeared.length)} gained years`,
      '',
      ...added.slice(0, 15).map((key) => `  + ${key}`),
      added.length > 15 ? `  … ${String(added.length - 15)} more` : '',
      ...removed.slice(0, 15).map((key) => `  - ${key}`),
      removed.length > 15 ? `  … ${String(removed.length - 15)} more` : '',
      ...reyeared.slice(0, 10).map((line) => `  ~ ${line}`),
      reyeared.length > 10 ? `  … ${String(reyeared.length - 10)} more` : '',
      '',
    ]
      .filter((line) => line !== '')
      .join('\n') + '\n'
  )
}

/**
 * Decide which years this run walks.
 *
 * Asking is the default, and the default answer is one year. A year is about
 * 1,200 calls and ten minutes, which is roughly what a captured session
 * survives — and the catalogue is only written once the whole run finishes, so
 * a run spanning years writes nothing for hours and then loses to an expired
 * cookie. `--all` is there for when you mean it.
 *
 * @param missing - Years the committed catalogue does not yet hold.
 */
async function chooseYears(missing: number[]): Promise<number[]> {
  const explicit = flagValue('--year=')
  if (explicit !== undefined) return parseYears(explicit)

  if (process.argv.includes('--all')) return missing
  if (missing.length === 0) return []

  const suggested = missing[0] as number
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  try {
    const answer = await rl.question(
      `Faltan ${String(missing.length)} años: ${asRanges(missing)}\n` +
        `¿Qué año camino? [${String(suggested)}] `
    )
    const typed = answer.trim()
    return typed === '' ? [suggested] : parseYears(typed)
  } finally {
    rl.close()
  }
}

/**
 * Walk the years the catalogue is missing, and fold them into it.
 */
async function main(): Promise<void> {
  const refresh = process.argv.includes('--refresh')
  const cookie = await readCookie()

  // The committed catalogue is the starting point, not something to replace:
  // the years it already holds are years nobody needs to pay for again.
  const existing = await readSeedCatalog()
  const covered = refresh ? new Set<number>() : yearsIn(existing)
  const years = await chooseYears(RANGE.filter((year) => !covered.has(year)))

  const checkpoint = await readCheckpoint()
  const done = new Set<string>(checkpoint.done)
  const brands = fromSeedCatalog(
    done.size > 0
      ? checkpoint.catalog
      : refresh
        ? { brands: [], generatedAt: new Date().toISOString() }
        : existing
  )

  const held = asRanges([...covered].sort((a, b) => a - b))

  if (years.length === 0) {
    process.stdout.write(
      `Nothing to walk: the catalogue already covers ${held}.\n` +
        'Use --refresh to walk those years again anyway.\n'
    )
    return
  }

  process.stdout.write(
    `Walking ${String(years.length)} ${years.length === 1 ? 'year' : 'years'}: ` +
      `${asRanges(years)}${held === '' ? '' : `, keeping ${held}`}.\n`
  )

  if (done.size > 0) {
    const carried = countOf(checkpoint.catalog)
    process.stdout.write(
      `Resuming: ${String(done.size)} year/brand pairs already walked, ` +
        `${String(carried.versions)} versions carried over.\n`
    )
  }

  let calls = 0

  try {
    for (const year of years) {
      const yearBrands = await fetchBrands(cookie, year)
      calls += 1
      await sleep(DELAY_MS)

      for (const brand of yearBrands) {
        const pair = `${String(year)}|${brand.codigoInterno}`
        if (done.has(pair)) continue

        const models = await fetchModels(cookie, year, brand)
        calls += 1
        await sleep(DELAY_MS)

        // Normalised here, at the one door every captured name comes through —
        // so a brand walked today lands on the same key as the same brand
        // captured last year, instead of beside it.
        const brandName = titleCase(brand.descripcionInterna)
        const brandModels =
          brands.get(brandName) ?? (new Map() as BrandAccumulator)
        brands.set(brandName, brandModels)

        for (const model of models) {
          const versions = await fetchVersions(cookie, year, brand, model)
          calls += 1
          await sleep(DELAY_MS)

          for (const version of versions) {
            record({
              brandModels,
              clave: version.clave,
              description: version.description,
              modelName: titleCase(model.descripcionInterna),
              year,
            })
          }
        }

        done.add(pair)
        await saveCheckpoint({ brands, done })
        process.stdout.write(
          `${String(year)} ${brand.descripcionInterna} — ${String(models.length)} models, ${String(calls)} calls\n`
        )
      }
    }
  } catch (error) {
    await saveCheckpoint({ brands, done })
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

  if (DIFF_ONLY) {
    await reportDiff(catalog)
    return
  }

  await writeFile(OUTPUT_FILE, serialize(catalog), 'utf8')

  // The run finished, so the checkpoint is spent: leaving it would make the
  // next run skip everything and write back what it just read.
  await unlink(CHECKPOINT_FILE).catch((): void => {})

  const totals = countOf(catalog)
  process.stdout.write(
    `\nWrote ${OUTPUT_FILE}\n  ${String(totals.brands)} brands, ${String(totals.models)} models, ${String(totals.versions)} versions in ${String(calls)} calls\n`
  )
}

await main()
