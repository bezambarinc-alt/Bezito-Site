'use client'

import Script from 'next/script'

export default function CuratorFeed({ nonce }: { nonce?: string }) {
  return (
    <Script
      src="https://cdn.curator.io/published/5e41d6ec-ffe3-4d7e-9e2a-09f0d58789f2.js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  )
}
