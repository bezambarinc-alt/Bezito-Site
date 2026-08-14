'use client'

import { useState } from 'react'
import styles from './preview.module.css'

export default function PinGate({ slug }: { slug: string }) {
  const [pin, setPin]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/preview/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        setError('Invalid access code. Please check with your contact.')
        setPin('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.gate}>
      <div className={styles.gateCard}>
        <h1 className={styles.gateHeading}>Enter your access code</h1>
        <p className={styles.gateSub}>You were provided a 4-digit code to view this page.</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.gateError}>{error}</p>}
          <input
            className={styles.pinInput}
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="· · · ·"
            autoFocus
            required
          />
          <button
            className={styles.gateBtn}
            type="submit"
            disabled={loading || pin.length !== 4}
          >
            {loading ? '…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
