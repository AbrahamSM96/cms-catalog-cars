'use client'

import { ErrorScreen } from '@/components/layout/ErrorScreen'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  retry: () => void
}

/**
 * ErrorBoundary — 500 for every route under the public site. Error boundaries
 * must be Client Components, so the header and footer above this segment keep
 * rendering while only the page is replaced.
 * @param props - Component props.
 */
export default function ErrorBoundary(
  props: ErrorBoundaryProps
): React.JSX.Element {
  const { error, retry } = props

  return <ErrorScreen digest={error.digest} onRetry={retry} />
}
