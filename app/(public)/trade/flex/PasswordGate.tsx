'use client'

import { useState, useEffect } from 'react'

const PW = 'FLEX26'
const KEY = 'ba_tf_auth'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(KEY) === '1') {
      setUnlocked(true)
    }
    setReady(true)
  }, [])

  if (!ready) return null
  if (unlocked) return <>{children}</>

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toUpperCase() === PW) {
      localStorage.setItem(KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ba-paper, #faf7f2)',
      fontFamily: 'var(--ba-font-sans)',
    }}>
      <div style={{ maxWidth: 360, width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--ba-font-sans)',
          fontSize: 22,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Bez Ambar
        </div>
        <p style={{
          fontFamily: 'var(--ba-font-sans)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#7d776f',
          marginBottom: 32,
        }}>
          The Flex Collection · Trade
        </p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Access code"
            autoFocus
            style={{
              fontFamily: 'var(--ba-font-sans)',
              fontSize: 15,
              padding: '12px 16px',
              border: '1px solid',
              borderColor: error ? '#b54242' : '#e2ddd4',
              background: '#fff',
              width: '100%',
              textAlign: 'center',
              letterSpacing: '0.1em',
              outline: 'none',
            }}
          />
          {error && (
            <p style={{ fontFamily: 'var(--ba-font-sans)', fontSize: 12, color: '#b54242', margin: 0 }}>
              Incorrect. Try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              fontFamily: 'var(--ba-font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '14px 24px',
              background: '#1a1a1a',
              color: 'var(--ba-paper, #faf7f2)',
              border: 0,
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
        </form>
        <p style={{
          fontFamily: 'var(--ba-font-sans)',
          fontSize: 12,
          color: '#7d776f',
          marginTop: 24,
        }}>
          For trade access, contact{' '}
          <a href="mailto:bez@bezambar.com" style={{ color: 'var(--ba-gold, #95826b)' }}>
            bez@bezambar.com
          </a>
        </p>
      </div>
    </div>
  )
}
