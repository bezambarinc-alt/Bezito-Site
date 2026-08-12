'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './login.module.css'

type Tab = 'pin' | 'signin'

function LoginForm() {
  const [tab, setTab] = useState<Tab>('pin')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        body: JSON.stringify({ email, password }),
      })
      res.ok ? router.push(from) : setError('Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.wordmark}>BEZ AMBAR</div>
        <div className={styles.subtitle}>Admin</div>

        {/* Tabs */}
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
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoFocus
              className={`${styles.input} ${styles.pinInput}`}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading || !pin} className={styles.btn}>
              {loading ? 'Verifying…' : 'Unlock →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading || !email || !password} className={styles.btn}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
