import type { Metadata } from 'next'

import { NotFoundScreen } from '@/components/layout/NotFoundScreen'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Página no encontrada',
}

/**
 * NotFound — 404 for every route under the public site.
 */
export default function NotFound(): React.JSX.Element {
  return <NotFoundScreen />
}
