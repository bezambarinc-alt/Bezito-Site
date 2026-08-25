'use client'

import { useEffect } from 'react'

export default function CuratorFeed({ nonce }: { nonce?: string }) {
  useEffect(() => {
    if (document.getElementById('curator-script')) return
    const script = document.createElement('script')
    script.id = 'curator-script'
    script.src = 'https://cdn.curator.io/published/5e41d6ec-ffe3-4d7e-9e2a-09f0d58789f2.js'
    script.async = true
    if (nonce) script.setAttribute('nonce', nonce)
    document.head.appendChild(script)
  }, [])

  return null
}
