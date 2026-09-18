'use client'

import Link from 'next/link'

interface ErrorScreenProps {
  /** Hash Next generates for the thrown error; shown as the fault code. */
  digest?: string
  /** Re-renders the boundary's children. Comes from `error.tsx`. */
  onRetry: () => void
}

/**
 * 500 screen drawn as an instrument cluster: the tachometer is pinned in the
 * red and the check-engine light is on. The error digest is presented as an
 * OBD fault code so support can match it against the server logs.
 *
 * @param props - Component props.
 */
export function ErrorScreen(props: ErrorScreenProps): React.JSX.Element {
  const { digest, onRetry } = props

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-white pt-24 pb-16 sm:pt-32">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60" />

      <div className="relative mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Instrument cluster */}
        <div className="animate-rise shadow-float mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <svg
            aria-hidden="true"
            className="mx-auto h-auto w-56"
            fill="none"
            viewBox="0 0 200 136"
          >
            <path
              d="M20 110a80 80 0 0 1 160 0"
              stroke="rgb(51 65 85)"
              strokeLinecap="round"
              strokeWidth={12}
            />
            <path
              d="M20 110a80 80 0 0 1 160 0"
              stroke="var(--accent)"
              strokeDasharray="72 400"
              strokeDashoffset={-179}
              strokeLinecap="round"
              strokeWidth={12}
            />
            <line
              stroke="var(--accent)"
              strokeLinecap="round"
              strokeWidth={5}
              x1={100}
              x2={152}
              y1={110}
              y2={77}
            />
            <circle cx={100} cy={110} fill="rgb(226 232 240)" r={7} />
            <text
              fill="rgb(148 163 184)"
              fontSize={13}
              fontWeight={600}
              letterSpacing={3}
              textAnchor="middle"
              x={100}
              y={128}
            >
              x1000 RPM
            </text>
          </svg>

          {/* Check-engine tell-tale */}
          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-accent-600/40 bg-accent-600/10 px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-500" />
            </span>
            <span className="text-xs font-semibold tracking-[0.25em] text-accent-300 uppercase">
              Revisar motor
            </span>
          </div>

          <p className="mt-6 font-mono text-xs tracking-widest text-slate-400 uppercase">
            Código de falla
          </p>
          <p className="mt-1 font-mono text-sm break-all text-slate-200">
            {digest ? `P0-${digest}` : 'P0-SIN-REGISTRO'}
          </p>
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Se nos apagó el motor
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Algo falló de nuestro lado al cargar esta página. La falla ya quedó
            registrada; casi siempre basta con volver a intentarlo.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-accent-700 hover:shadow-accent-600/30"
              onClick={onRetry}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h5M20 20v-5h-5M5.5 15a7.5 7.5 0 0 0 13-3M18.5 9a7.5 7.5 0 0 0-13 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Volver a encender
            </button>
            <Link
              className="shadow-soft inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-900 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
              href="/catalogo"
            >
              Ir al catálogo
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Si sigue fallando,{' '}
            <Link
              className="font-semibold text-accent-600 underline-offset-4 hover:underline"
              href="/contacto"
            >
              escríbenos
            </Link>{' '}
            con el código de falla y lo revisamos.
          </p>
        </div>
      </div>
    </main>
  )
}
