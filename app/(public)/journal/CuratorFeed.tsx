'use client'

/**
 * CuratorFeed — loads the Curator.io Instagram embed using Next.js <Script>.
 * strategy="lazyOnload" = deferred until page is idle (correct for third-party feeds).
 * Falls back to a direct Instagram link if the script hasn't loaded or is blocked.
 *
 * The <div id="curator-feed-..."> is server-rendered (part of the RSC parent).
 * This client component only handles the script injection.
 */

import Script from 'next/script'

export default function CuratorFeed() {
  return (
    <Script
      src="https://cdn.curator.io/published/5e41d6ec-ffe3-4d7e-9e2a-09f0d58789f2.js"
      strategy="lazyOnload"
      onError={() => {
        // Silently fail — the fallback UI is always visible in the RSC parent
      }}
    />
  )
}
