'use client'

import { useState } from 'react'
import styles from './Newsletter.module.css'

export default function Newsletter({ slim = false }: { slim?: boolean }) {
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
        body: JSON.stringify({ email, intent: 'newsletter', page_slug: 'home' }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg("Something went wrong. Try again or email us directly.")
    }
  }

  return (
    <section className={`${styles.section}${slim ? ` ${styles.sectionSlim}` : ''}`}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Word from the Atelier.</h2>
        <p className={styles.lede}>
          Now and then I send word from the bench — a new cut, a stone that stopped me, a piece just finished.
          If that speaks to you, come along.
        </p>

        {status === 'success' ? (
          <p className={styles.successMsg}>You&apos;re on the list. We&apos;ll be in touch.</p>
        ) : (
          <>
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
          <p className={styles.disclosure}>By joining, you agree to our <a href="/privacy-policy">Privacy Policy</a>.</p>
          </>
        )}
      </div>
    </section>
  )
}
