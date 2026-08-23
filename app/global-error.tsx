'use client'

import { useEffect } from 'react'

/** Root layout error boundary — must render its own html/body. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Bez Ambar] Root error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#faf7f2', fontFamily: "'Lyon Text Regular', Georgia, serif", display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '480px' }}>
          <span style={{ display: 'block', fontSize: '1.5rem', color: '#c5a258', marginBottom: '1.5rem' }} aria-hidden>—</span>
          <h1 style={{ fontWeight: 400, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: '#1a1a1a', margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>Something went wrong.</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We hit an unexpected issue on our end. Your session is intact — try again or return home.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{ padding: '0.75rem 2rem', background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.7rem', borderRadius: '999px' }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{ padding: '0.75rem 2rem', border: '1px solid rgba(26,26,26,0.4)', color: '#1a1a1a', textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.7rem', borderRadius: '999px', display: 'inline-block' }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
