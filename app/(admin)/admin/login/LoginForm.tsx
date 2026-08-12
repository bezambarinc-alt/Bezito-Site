'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './login.module.css'

type Tab = 'pin' | 'signin'

export default function LoginForm({ defaultTab }: { defaultTab: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [trustDevice, setTrustDevice] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams?.get('from') ?? '/admin'

  function switchTab(t: Tab) { setTab(t); setError('') }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      res.ok ? router.push(from) : setError('Invalid PIN')
    } finally { setLoading(false) }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, trustDevice }),
      })
      res.ok ? router.push(from) : setError('Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <div className={styles.mark}>BA</div>
          <div className={styles.wordmark}>BEZ AMBAR</div>
        </div>
        <div className={styles.subtitle}>Admin Console</div>

        <div className={styles.tabs}>
          <button
            onClick={() => switchTab('pin')}
            className={`${styles.tab} ${tab === 'pin' ? styles.tabActive : ''}`}
          >
            PIN
          </button>
          <button
            onClick={() => switchTab('signin')}
            className={`${styles.tab} ${tab === 'signin' ? styles.tabActive : ''}`}
          >
            Sign In
          </button>
        </div>

        {tab === 'pin' ? (
          <form onSubmit={handlePin} className={styles.form}>
            <label className={styles.label}>Access PIN</label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoFocus
              className={`${styles.input} ${styles.pinInput}`}
            />
            {error && <p className={styles.error}>⚠ {error}</p>}
            <button type="submit" disabled={loading || !pin} className={styles.btn}>
              {loading ? 'Verifying…' : 'Unlock'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className={styles.form}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@bezambar.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              className={styles.input}
            />
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
            />
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={e => setTrustDevice(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>Trust this location for 30 days</span>
            </label>
            {error && <p className={styles.error}>⚠ {error}</p>}
            <button type="submit" disabled={loading || !email || !password} className={styles.btn}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <div className={styles.footer}>Authorized access only · Bez Ambar Inc.</div>
      </div>
    </div>
  )
}
