'use client'

/**
 * Global error boundary — catches unhandled runtime errors anywhere in the app.
 * Must be a Client Component. `reset()` re-renders the subtree from scratch.
 */

import { useEffect } from 'react'
import styles from './not-found.module.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev; swap for Sentry / your error reporter in prod
    console.error('[Bez Ambar] Unhandled error:', error)
  }, [error])

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.glyph} aria-hidden>&mdash;</span>
        <h1 className={styles.title}>Something went wrong.</h1>
        <p className={styles.body}>
          We hit an unexpected issue. It&rsquo;s on our end, not yours.
        </p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.primary}>Try Again</button>
          <a href="/" className={styles.ghost}>Return Home</a>
        </div>
      </div>
    </main>
  )
}
