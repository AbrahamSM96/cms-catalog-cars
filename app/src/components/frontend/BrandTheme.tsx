import { connection } from 'next/server'
import NextTopLoader from 'nextjs-toploader'

import { getSiteSettings } from '@/lib/payload-client'
import { resolveSiteConfig } from '@/config/site'

/**
 * BrandTheme — paints the client's brand colours over the defaults in
 * globals.css and colours the navigation progress bar with them.
 *
 * The colours live in the CMS, so they cannot be baked into the root element at
 * build time (the build has no database). They are streamed instead: the shell
 * paints with the defaults from globals.css and this `<style>` overrides them
 * when the cached settings arrive. `:root` here beats `:root` there because it
 * comes later in the document, and the whole Tailwind accent scale is derived
 * from `--accent` with `color-mix`, so overriding the three variables re-themes
 * every shade.
 *
 * `connection()` keeps the read out of the prerendered shell — without it Next
 * would resolve the cached call at build time and hit the database.
 */
export async function BrandTheme(): Promise<React.JSX.Element> {
  await connection()

  const site = resolveSiteConfig(await getSiteSettings())

  const css = `:root{--accent:${site.theme.accent};--accent-strong:${site.theme.accentStrong};--primary:${site.theme.primary}}`

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <NextTopLoader
        color={site.theme.accent}
        height={3}
        shadow={`0 0 10px ${site.theme.accent},0 0 5px ${site.theme.accent}`}
        showSpinner={false}
        speed={200}
        zIndex={9999}
      />
    </>
  )
}
