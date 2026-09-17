'use client'

import { useEffect } from 'react'

// No nonce prop. Public routes run the nonce-free CSP (see proxy.ts), which
// allows cdn.curator.io by host — the page had to read headers() to get a nonce
// here, and that was enough to keep /journal off static rendering.
export default function CuratorFeed() {
  useEffect(() => {
    if (document.getElementById('curator-script')) return
    const script = document.createElement('script')
    script.id = 'curator-script'
    script.src = 'https://cdn.curator.io/published/8a90bee5-25c8-4b36-a23b-0db33a392762.js'
    script.async = true
    document.head.appendChild(script)
    // The id guard keeps the injection idempotent under Strict Mode's double-run.
  }, [])

  return null
}
