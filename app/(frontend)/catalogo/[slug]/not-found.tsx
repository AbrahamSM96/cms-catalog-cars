import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Auto no encontrado',
}

/**
 * NotFound
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-xl text-slate-600">Auto no encontrado</p>
        <Link
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/25"
          href="/catalogo"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}
