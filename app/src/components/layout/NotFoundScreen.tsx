import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'

interface NotFoundScreenProps {
  /** Copy under the plate number, stamped in the brand accent. */
  caption?: string
  /** Paragraph under the headline. */
  description?: string
  /** Headline shown under the plate. */
  heading?: string
  /** Characters printed on the plate. Keep it short: it renders huge. */
  plate?: string
}

/**
 * 404 screen built around a vehicle licence plate: the URL that did not match
 * is shown as a plate that is not in the inventory. Shared by the app-wide
 * `not-found`, the global (unmatched URL) one and the car detail route.
 *
 * @param props - Component props.
 */
export function NotFoundScreen(props: NotFoundScreenProps): React.JSX.Element {
  const {
    caption = 'No registrado',
    description = 'La dirección que buscas no está en nuestro inventario. Puede que la unidad ya se haya vendido o que el enlace venga con un dígito de más.',
    heading = 'Tomaste una salida equivocada',
    plate = '404-NTF',
  } = props

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-white pt-24 pb-16 sm:pt-32">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60" />

      <div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Badge className="animate-rise" dot variant="glass">
          <span className="text-sm font-medium text-slate-700">
            Ruta sin salida
          </span>
        </Badge>

        {/* Licence plate */}
        <div className="animate-rise shadow-float relative mx-auto mt-8 w-full max-w-md rounded-[1.75rem] border-[6px] border-slate-900 bg-gradient-to-b from-white via-slate-50 to-slate-200 p-1.5">
          <span className="absolute top-3 left-4 h-2 w-2 rounded-full bg-slate-900/25" />
          <span className="absolute top-3 right-4 h-2 w-2 rounded-full bg-slate-900/25" />
          <span className="absolute bottom-3 left-4 h-2 w-2 rounded-full bg-slate-900/25" />
          <span className="absolute right-4 bottom-3 h-2 w-2 rounded-full bg-slate-900/25" />

          <div className="rounded-[1.25rem] border border-slate-300/80 px-6 py-6">
            <p className="text-[0.65rem] font-semibold tracking-[0.45em] text-slate-500 uppercase">
              México
            </p>
            <p className="mt-2 text-6xl font-bold tracking-[0.12em] text-slate-900 tabular-nums sm:text-7xl">
              {plate}
            </p>
            <p className="mt-2 text-[0.65rem] font-semibold tracking-[0.35em] text-accent-600 uppercase">
              {caption}
            </p>
          </div>
        </div>

        {/* Road */}
        <div className="road-lane mx-auto mt-10 h-1.5 w-full max-w-lg rounded-full" />

        <h1 className="mt-10 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          {description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-accent-700 hover:shadow-accent-600/30"
            href="/catalogo"
          >
            Ver catálogo completo
            <svg
              aria-hidden="true"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 7l5 5m0 0l-5 5m5-5H6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Link>
          <Link
            className="shadow-soft inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-900 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
            href="/buscador"
          >
            Buscar por marca y modelo
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          ¿Preferías hablar con alguien?{' '}
          <Link
            className="font-semibold text-accent-600 underline-offset-4 hover:underline"
            href="/contacto"
          >
            Contáctanos
          </Link>{' '}
          o{' '}
          <Link
            className="font-semibold text-accent-600 underline-offset-4 hover:underline"
            href="/"
          >
            vuelve al inicio
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
