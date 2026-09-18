import type { Metadata } from 'next'

import './globals.css'
import { NotFoundScreen } from '@/components/layout/NotFoundScreen'
import { poppins } from '@/commons/poppins'

export const metadata: Metadata = {
  description: 'La dirección que buscas no existe en este sitio.',
  title: 'Página no encontrada',
}

/**
 * GlobalNotFound — 404 for URLs that match no route at all.
 *
 * The app has two root layouts (`(frontend)` and `(payload)`), so there is no
 * single layout Next can compose a global 404 from. This file bypasses
 * rendering entirely and must therefore ship its own document, styles and font.
 * It renders without the header and footer on purpose: nothing here depends on
 * the CMS, so the page stays fully static.
 */
export default function GlobalNotFound(): React.JSX.Element {
  return (
    <html className={`${poppins.variable} antialiased`} lang="es">
      <body>
        <NotFoundScreen />
      </body>
    </html>
  )
}
