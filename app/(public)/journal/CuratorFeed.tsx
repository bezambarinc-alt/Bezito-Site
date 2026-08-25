'use client'

import { useEffect } from 'react'

export default function CuratorFeed({ nonce }: { nonce?: string }) {
  useEffect(() => {
    if (document.getElementById('curator-script')) return
    const script = document.createElement('script')
    script.id = 'curator-script'
    script.src = 'https://cdn.curator.io/published/8a90bee5-25c8-4b36-a23b-0db33a392762.js'
    script.async = true
    if (nonce) script.setAttribute('nonce', nonce)
    document.head.appendChild(script)
  }, [])

  return null
}
