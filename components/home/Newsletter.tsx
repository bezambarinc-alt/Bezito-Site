'use client'

import { useState } from 'react'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Newsletter', email, intent: 'newsletter', page_slug: 'home' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg("Something went wrong. Try again or email us directly.")
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>The Private List</h2>
        <p className={`ba-lede ${styles.lede}`}>
          First access to new pieces, archive discoveries, and notes from the atelier.
          Rarely sent. Always worth it.
        </p>

        {status === 'success' ? (
          <p className={styles.successMsg}>You&apos;re on the list. We&apos;ll be in touch.</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
            />
            <button className={styles.btn} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? '…' : 'Join'}
            </button>
            {status === 'error' && <p className={styles.errorMsg}>{errorMsg}</p>}
          </form>
        )}
      </div>
    </section>
  )
}
