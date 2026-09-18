'use client'

import './globals.css'
import { ErrorScreen } from '@/components/layout/ErrorScreen'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

/**
 * GlobalError — last-resort 500, used when the root layout itself throws. It
 * replaces the layout, so it renders its own document. `next/font` cannot run
 * in a Client Component, so the type falls back to the system stack declared in
 * `globals.css`.
 * @param props - Component props.
 */
export default function GlobalError(
  props: GlobalErrorProps
): React.JSX.Element {
  const { error, retry } = props

  return (
    <html lang="es">
      <body className="antialiased">
        <title>Error del sitio</title>
        <ErrorScreen digest={error.digest} onRetry={retry} />
      </body>
    </html>
  )
}
