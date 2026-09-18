import type { Metadata } from 'next'

import { NotFoundScreen } from '@/components/layout/NotFoundScreen'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Auto no encontrado',
}

/**
 * NotFound — shown when the slug does not match a published car.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <NotFoundScreen
      caption="Fuera de inventario"
      description="Esta unidad ya no está publicada. Suele pasar cuando el auto se vendió o se dio de baja del catálogo, pero seguro tenemos algo parecido."
      heading="Este auto ya no está en el piso"
      plate="VEN-DID"
    />
  )
}
