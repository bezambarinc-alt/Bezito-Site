'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '360px', margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ marginBottom: '2rem' }}>Sign in</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc' }}
        />
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button type="submit" style={{ padding: '0.75rem', fontSize: '1rem', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Sign in
        </button>
      </form>
    </main>
  )
}
