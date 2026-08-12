'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'pin' | 'signin'

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '0.75rem',
  fontSize: '1rem',
  background: disabled ? '#888' : '#111',
  color: '#fff',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  width: '100%',
  fontFamily: 'Georgia, serif',
  letterSpacing: '0.04em',
  transition: 'background 0.15s',
})

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

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
  }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        router.push(from)
      } else {
        setError('Invalid PIN')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push(from)
      } else {
        setError('Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const tabBase: React.CSSProperties = {
    flex: 1,
    padding: '0.6rem',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    transition: 'background 0.15s, color 0.15s',
  }

  return (
    <main style={{ padding: '4rem 1.5rem', maxWidth: '380px', margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <p style={{ fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999', marginBottom: '1.5rem' }}>
        Bez Ambar Admin
      </p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'normal', marginBottom: '2rem' }}>
        {tab === 'pin' ? 'Enter PIN' : 'Sign in'}
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', border: '1px solid #ccc', marginBottom: '1.75rem' }}>
        <button
          onClick={() => switchTab('pin')}
          style={{ ...tabBase, background: tab === 'pin' ? '#111' : '#fff', color: tab === 'pin' ? '#fff' : '#555' }}
        >
          PIN
        </button>
        <button
          onClick={() => switchTab('signin')}
          style={{ ...tabBase, background: tab === 'signin' ? '#111' : '#fff', color: tab === 'signin' ? '#fff' : '#555', borderLeft: '1px solid #ccc' }}
        >
          Sign In
        </button>
      </div>

      {tab === 'pin' ? (
        <form onSubmit={handlePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            autoFocus
            style={{ ...inputStyle, fontSize: '1.5rem', letterSpacing: '0.4em', textAlign: 'center' }}
          />
          {error && <p style={{ color: '#c00', margin: 0, fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" disabled={loading || !pin} style={btnStyle(loading || !pin)}>
            {loading ? 'Verifying…' : 'Unlock →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: '#c00', margin: 0, fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" disabled={loading || !email || !password} style={btnStyle(loading || !email || !password)}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      )}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
