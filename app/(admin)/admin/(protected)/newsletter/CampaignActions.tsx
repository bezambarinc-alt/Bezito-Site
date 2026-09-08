'use client'

import { useState } from 'react'
import styles from './newsletter.module.css'

export function SendButton({ campaignKey }: { campaignKey: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSend() {
    setState('loading')
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignKey }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok || data.error) {
        setMsg(data.error ?? 'Send failed')
        setState('error')
      } else {
        setState('sent')
      }
    } catch {
      setMsg('Network error')
      setState('error')
    }
  }

  if (state === 'sent') return <span className={styles.badgeSent}>Queued ✓</span>
  if (state === 'error') return <span className={styles.badgeError} title={msg}>Error</span>

  return (
    <button
      className={styles.sendBtn}
      disabled={state === 'loading'}
      onClick={handleSend}
    >
      {state === 'loading' ? '…' : 'Send'}
    </button>
  )
}
