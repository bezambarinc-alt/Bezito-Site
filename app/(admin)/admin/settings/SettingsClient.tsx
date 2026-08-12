'use client'

import { useState } from 'react'
import styles from './settings.module.css'
import type { AdminUser } from './page'

interface Props {
  users: AdminUser[]
  currentUser: string
}

export default function SettingsClient({ users: initial, currentUser }: Props) {
  const [users, setUsers] = useState(initial)

  // PIN form
  const [pin, setPin] = useState({ new: '', confirm: '' })
  const [pinLoading, setPinLoading] = useState(false)
  const [pinMsg, setPinMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Add user form
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'admin' })
  const [userLoading, setUserLoading] = useState(false)
  const [userMsg, setUserMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function updatePin(e: React.FormEvent) {
    e.preventDefault()
    setPinMsg(null)
    if (pin.new !== pin.confirm) {
      setPinMsg({ text: 'PINs do not match', ok: false }); return
    }
    if (pin.new.length < 4) {
      setPinMsg({ text: 'PIN must be at least 4 digits', ok: false }); return
    }
    setPinLoading(true)
    try {
      const res = await fetch('/api/admin/settings/pin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.new }),
      })
      setPinMsg(res.ok
        ? { text: 'PIN updated ✓', ok: true }
        : { text: 'Failed to update PIN', ok: false })
      if (res.ok) setPin({ new: '', confirm: '' })
    } finally {
      setPinLoading(false)
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    setUserMsg(null)
    setUserLoading(true)
    try {
      const res = await fetch('/api/admin/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })
      if (res.ok) {
        const { id } = await res.json()
        setUsers(prev => [...prev, {
          id,
          email: userForm.email,
          role: userForm.role,
          created_at: new Date().toISOString(),
        }])
        setUserForm({ email: '', password: '', role: 'admin' })
        setUserMsg({ text: 'User added ✓', ok: true })
      } else {
        const data = await res.json()
        setUserMsg({ text: data.error || 'Failed to add user', ok: false })
      }
    } finally {
      setUserLoading(false)
    }
  }

  async function deleteUser(id: number, email: string) {
    if (!confirm(`Remove ${email}?`)) return
    const res = await fetch('/api/admin/settings/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id))
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to remove user')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      {/* ── PIN Access ── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>PIN Access</p>
        <p className={styles.hint}>
          Users on trusted IPs enter this PIN to unlock the admin — no password needed.
        </p>
        <form onSubmit={updatePin} className={styles.form}>
          <input
            type="password"
            inputMode="numeric"
            placeholder="New PIN (4+ digits)"
            value={pin.new}
            onChange={e => setPin(p => ({ ...p, new: e.target.value }))}
            className={styles.input}
            required
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="Confirm PIN"
            value={pin.confirm}
            onChange={e => setPin(p => ({ ...p, confirm: e.target.value }))}
            className={styles.input}
            required
          />
          <button type="submit" disabled={pinLoading} className={styles.btn}>
            {pinLoading ? 'Saving…' : 'Update PIN'}
          </button>
          {pinMsg && (
            <p className={`${styles.msg} ${pinMsg.ok ? styles.msgOk : styles.msgErr}`}>
              {pinMsg.text}
            </p>
          )}
        </form>
      </section>

      {/* ── Users ── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Admin Users</p>
        <p className={styles.hint}>
          These accounts can sign in with email + password from any location.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}{u.email === currentUser && <span style={{ color: '#aaa', marginLeft: '0.5rem', fontSize: '0.75rem' }}>(you)</span>}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.email !== currentUser && (
                    <button
                      onClick={() => deleteUser(u.id, u.email)}
                      className={styles.deleteBtn}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className={styles.subTitle}>Add User</p>
        <form onSubmit={addUser} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
            className={styles.input}
            required
          />
          <select
            value={userForm.role}
            onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
            className={styles.select}
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" disabled={userLoading} className={styles.btn}>
            {userLoading ? 'Adding…' : 'Add User'}
          </button>
          {userMsg && (
            <p className={`${styles.msg} ${userMsg.ok ? styles.msgOk : styles.msgErr}`}>
              {userMsg.text}
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
