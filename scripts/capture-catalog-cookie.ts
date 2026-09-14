/**
 * Captures a quoter session into `.bbva-cookie`, so
 * `scripts/scrape-vehicle-catalog.ts` has something to run with.
 *
 * ## Why a browser at all
 *
 * The catalogue API sits behind Akamai Bot Manager, which guards the
 * *acquisition* of a session rather than its use: once a real browser holds
 * one, plain HTTP calls work fine for as long as it lives. So the scraper needs
 * a cookie header that some browser earned, and until now you earned it by hand
 * — DevTools, copy as cURL, pull out the `-b` string, paste.
 *
 * This script removes the copying, not the browser. It opens a real, visible
 * Chrome, walks the quoter's first step for you, and lifts the cookie header
 * off the page's own call to `catalogos/marcas`. The session is still minted by
 * real Chrome doing what real Chrome does — nothing here pretends to be a
 * browser it isn't, which is also why it should keep working when Akamai
 * tightens its rules.
 *
 * It also writes the whole `marcas` request to `.bbva-marcas-request.json`.
 * That is a diagnostic, not something the scraper reads: `marcas` names two of
 * its four fields differently from the sibling endpoints, and this file is how
 * that was found. Keep it for when the API changes its mind again.
 *
 * ## Running it
 *
 * ```
 * bun run catalog:cookie
 * ```
 *
 * The form-walking is best-effort: every selector belongs to someone else's
 * Angular app, so if a step has moved the script says so and keeps listening
 * while you finish the form by hand in the window it already opened. The
 * capture is what matters, and it does not depend on the automation working.
 */

import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  chromium,
  type Locator,
  type Page,
  type Request,
} from 'playwright-core'

const ROOT = path.resolve(import.meta.dirname, '..')
const COOKIE_FILE = path.join(ROOT, '.bbva-cookie')
const REQUEST_FILE = path.join(ROOT, '.bbva-marcas-request.json')

const QUOTER_URL =
  'https://cotizadores.bbvaseguros.mx/psns_mult_web_psnspublicwebapp_02/autoSeguroBancomer'

/** The call we are here for: the one that lists brands for a model year. */
const MARCAS_PATH = '/api/autos/aso/catalogos/marcas'

/**
 * How long to wait for that call. Generous, because it counts whatever time
 * you spend finishing the form yourself when the automation gives up.
 */
const CAPTURE_TIMEOUT_MS = 5 * 60 * 1000

/** How long any single step of the form gets before it is declared moved. */
const STEP_TIMEOUT_MS = 15 * 1000

/**
 * The year typed into the quoter's form.
 *
 * Not a choice, and deliberately not a question. A session belongs to the
 * browser that earned it, not to any model year, and the scraper picks its own
 * years afterwards — so asking here only ever produced the impression of having
 * chosen what to scrape. Answering `2019` at this prompt and then watching the
 * scraper start at 1996 is exactly what the prompt was good for.
 *
 * Any year the quoter accepts works. This one is inside the insurable range and
 * has stock in every brand, so the form never stalls on an empty dropdown.
 */
const FORM_YEAR = '2026'

/**
 * Run one step of the form, labelling whatever it throws.
 *
 * These selectors belong to someone else's Angular app, so steps do break.
 * When one does, knowing which one is the difference between a one-line fix
 * and rereading the whole walk.
 *
 * @param props - The step to run.
 * @param props.name - What the step does, for the message.
 * @param props.run - The step itself.
 */
async function runStep(props: {
  name: string
  run: () => Promise<void>
}): Promise<void> {
  const { name, run } = props

  try {
    await run()
  } catch (error) {
    const detail =
      error instanceof Error ? (error.message.split('\n')[0] ?? '') : ''
    throw new Error(`«${name}»${detail === '' ? '' : ` — ${detail}`}`)
  }
}

/**
 * Click the first candidate that is actually on screen.
 *
 * The visibility filter is the whole point. The quoter renders all five of its
 * sections into the DOM at once and hides the ones you are not on, so matching
 * an element is no evidence of having matched the right one: take whatever
 * comes first in document order and you are often waiting on a hidden twin
 * until the timeout, which reads as a hang rather than as a wrong selector.
 *
 * @param candidates - Locators to try, best guess first.
 */
async function clickFirstVisible(candidates: Locator[]): Promise<void> {
  for (const candidate of candidates) {
    const target = candidate.locator('visible=true').first()
    if ((await target.count()) === 0) continue
    await target.click({ timeout: STEP_TIMEOUT_MS })
    return
  }

  throw new Error('ningún selector encontró un elemento visible')
}

/**
 * Tick a checkbox or radio whose real input has been styled out of existence.
 *
 * This form draws its controls with `::before`/`::after` on a sibling span, and
 * pseudo-elements are not nodes — there is nothing for Playwright to aim at,
 * and the input behind them has no box of its own. So we click the host that
 * paints them, usually the wrapping label, exactly where a person would.
 *
 * When even that has no box, the last resort is to dispatch the click straight
 * at the input. An untrusted click event still runs the element's activation
 * behaviour, so the box ticks and Angular's `ng-click` fires — which is all we
 * need, and all a real click would have achieved here anyway.
 *
 * @param props - What to tick.
 * @param props.hosts - Clickable elements that render the control.
 * @param props.input - The real input hiding behind them.
 */
async function tick(props: {
  hosts: Locator[]
  input: Locator
}): Promise<void> {
  const { hosts, input } = props

  try {
    await clickFirstVisible(hosts)
  } catch {
    await input.dispatchEvent('click')
  }
}

/**
 * Click the button that advances the form.
 *
 * The button carries `ng-disabled` bound to the confirmation checkbox, so it
 * can sit there visible and not yet clickable; that is the caller's problem,
 * and the reason the checkbox step runs before this one.
 *
 * @param page - The page showing the quoter.
 */
async function clickContinue(page: Page): Promise<void> {
  await clickFirstVisible([
    page.locator('button.btn-next-section', { hasText: 'Continuar' }),
    page.locator('button, a', { hasText: 'Continuar' }),
    page.locator('[ng-click]', { hasText: 'Continuar' }),
  ])
}

/**
 * Walk the quoter's first step as far as the brand list, which is where the
 * call we want fires.
 *
 * Three screens: vehicle type plus the private-driver confirmation, then the
 * model year, then brand and model — and it is loading that third screen that
 * asks the API for brands. We never touch brand or model; arriving is enough.
 *
 * @param props - What to drive.
 * @param props.page - The page showing the quoter.
 * @param props.year - The model year to enter.
 */
async function driveForm(props: { page: Page; year: string }): Promise<void> {
  const { page, year } = props

  await runStep({
    name: 'tipo de auto',
    // The radio arrives with `checked`, and clicking it anyway is the point:
    // that attribute is static HTML, while Angular's `tipoAuto` stays null
    // until a click runs the handler — and the confirmation checkbox below is
    // `ng-disabled="tipoAuto == null"`. Skipping this leaves the next step dead.
    //
    // The input itself has no box to click: it is styled away and the adjacent
    // `.checkmark-paso-1` span is what you actually see, so we go through the
    // wrapping label instead.
    run: async (): Promise<void> => {
      const auto = page.locator('input[name="radio"][value="AUTOMOVILES"]')

      await tick({
        // The span is the control you actually see, so it is the first target;
        // the label around it is the fallback, and being a label it activates
        // the input from anywhere inside its box.
        hosts: [
          page.locator('.checkmark-paso-1.m-l-auto-paso1'),
          page.locator('label:has(input[name="radio"][value="AUTOMOVILES"])'),
        ],
        input: auto,
      })

      // Then check, because a click landing is not the same as it landing
      // where you meant. Both radios hang off one flag — `ng-checked` is
      // `opcVehiculo` for one and `!opcVehiculo` for the other — so a few
      // pixels wrong, or a handler that toggles rather than sets, quietly
      // leaves you on Pick Up. A previous capture came back full of pick-up
      // codes and nothing downstream thought that was odd.
      if (!(await auto.isChecked())) await auto.dispatchEvent('click')

      if (!(await auto.isChecked())) {
        throw new Error('no quedó seleccionado Auto / SUV')
      }
    },
  })

  await runStep({
    name: 'confirmación de chofer privado',
    run: async (): Promise<void> => {
      // Ticking an already-ticked box unticks it, which disables the Continuar
      // button below and turns the next step into a fifteen-second wait for a
      // control that is never going to enable.
      const box = page.locator('#squaredTwo')
      if (await box.isChecked()) return

      await tick({
        hosts: [
          page.locator('label[for="squaredTwo"]'),
          page.locator('.squaredTwo'),
        ],
        input: box,
      })
    },
  })

  await runStep({
    name: 'botón Continuar',
    run: (): Promise<void> => clickContinue(page),
  })

  await runStep({
    name: 'campo de año',
    run: async (): Promise<void> => {
      const input = page.locator('#inputAnio')
      await input.waitFor({ state: 'visible', timeout: STEP_TIMEOUT_MS })
      await input.click()
      await input.pressSequentially(year, { delay: 80 })
    },
  })

  await runStep({
    name: 'sugerencia del año',
    // The year field is a uib-typeahead: it only counts as filled once you take
    // a suggestion from its dropdown, so typed text alone leaves the form stuck.
    // `:visible` again — there is a `.dropdown-menu` per typeahead on the page
    // and the other two sit in `ng-hide`.
    run: async (): Promise<void> => {
      await page
        .locator('.dropdown-menu:visible a', { hasText: year })
        .first()
        .click({ timeout: STEP_TIMEOUT_MS })
    },
  })
}

/**
 * Turn the captured request into the record written to disk.
 *
 * The cookie is stripped out of the saved headers: it already has a home in
 * `.bbva-cookie`, and one copy of a live session on disk is enough.
 *
 * @param request - The captured `marcas` request.
 */
async function toRecord(request: Request): Promise<Record<string, unknown>> {
  const headers = await request.allHeaders()
  const { cookie: _cookie, ...rest } = headers

  return {
    body: request.postData() ?? '',
    capturedAt: new Date().toISOString(),
    headers: rest,
    method: request.method(),
    url: request.url(),
  }
}

/**
 * Open the quoter, walk it, and write out what the scraper needs.
 */
async function main(): Promise<void> {
  const browser = await chromium.launch({ channel: 'chrome', headless: false })
  const page = await browser.newPage()

  try {
    // Listen before navigating: the call can land while we are still clicking.
    const pending = page.waitForRequest(
      (candidate: Request): boolean => candidate.url().includes(MARCAS_PATH),
      { timeout: CAPTURE_TIMEOUT_MS }
    )

    await page.goto(QUOTER_URL, { waitUntil: 'domcontentloaded' })

    try {
      await driveForm({ page, year: FORM_YEAR })
    } catch (error) {
      const step = error instanceof Error ? error.message : 'paso desconocido'
      process.stdout.write(
        `\nNo pude avanzar el formulario solo: ${step}\n` +
          'Termínalo tú en la ventana que quedó abierta: tipo de auto, la\n' +
          'confirmación, el año, y hasta que aparezca el campo de Marca.\n' +
          'Sigo escuchando la red mientras tanto.\n\n'
      )
    }

    const request = await pending
    const headers = await request.allHeaders()
    const cookie = headers.cookie ?? ''

    if (cookie === '') {
      throw new Error(
        'La llamada a marcas salió sin header de cookie, que no debería pasar. ' +
          'Revisa la request en DevTools antes de confiar en esta captura.'
      )
    }

    // The session does not care which vehicle type you picked, so the cookie is
    // good either way — but the saved body is only worth copying into the
    // scraper if it came from the car branch. Pick Up asks the same endpoint
    // with a different product and a different `tipoVehiculo`.
    const body = request.postData() ?? ''
    const isCars = body.includes('AUTOMOVILES')

    await writeFile(COOKIE_FILE, `${cookie}\n`, 'utf8')
    await writeFile(
      REQUEST_FILE,
      `${JSON.stringify(await toRecord(request), null, 2)}\n`,
      'utf8'
    )

    process.stdout.write(
      [
        '',
        `Sesión capturada en ${COOKIE_FILE}`,
        `  ${String(cookie.split(';').length)} cookies, ${String(cookie.length)} caracteres`,
        `Request de marcas en ${REQUEST_FILE}`,
        ...(isCars
          ? []
          : [
              '',
              '  Ojo: esa request salió de la rama de Pick Up, no de Auto / SUV.',
              '  La cookie sirve igual; el body no, si lo querías para fetchBrands.',
            ]),
        '',
        'La sesión dura minutos, no horas — corre el scrape ya:',
        '  bun run catalog:scrape -- --diff',
        '',
      ].join('\n')
    )
  } finally {
    await browser.close()
  }
}

await main()
