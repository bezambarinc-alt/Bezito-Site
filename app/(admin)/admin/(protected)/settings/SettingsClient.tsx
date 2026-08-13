'use client'

import { useState } from 'react'
import styles from './settings.module.css'
import type { AdminUser, WhitelistEntry } from './page'

interface Props {
  users: AdminUser[]
  whitelist: WhitelistEntry[]
  currentUser: string
}

type Msg = { text: string; ok: boolean } | null

export default function SettingsClient({ users: initUsers, whitelist: initWl, currentUser }: Props) {
  const [users, setUsers] = useState(initUsers)
  const [whitelist, setWhitelist] = useState(initWl)

  // PIN form
  const [pin, setPin] = useState({ new: '', confirm: '' })
  const [pinLoading, setPinLoading] = useState(false)
  const [pinMsg, setPinMsg] = useState<Msg>(null)

  // Add user form
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'admin' })
  const [userLoading, setUserLoading] = useState(false)
  const [userMsg, setUserMsg] = useState<Msg>(null)

  // Add-IP form
  const [ipForm, setIpForm] = useState({ ip: '', label: '', days: 30 })
  const [ipLoading, setIpLoading] = useState(false)
  const [ipMsg, setIpMsg] = useState<Msg>(null)

  async function updatePin(e: React.FormEvent) {
    e.preventDefault()
    setPinMsg(null)
    if (pin.new !== pin.confirm) { setPinMsg({ text: 'PINs do not match', ok: false }); return }
    if (pin.new.length < 4) { setPinMsg({ text: 'PIN must be at least 4 digits', ok: false }); return }
    setPinLoading(true)
    try {
      const res = await fetch('/api/admin/settings/pin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.new }),
      })
      setPinMsg(res.ok ? { text: 'PIN updated ✓', ok: true } : { text: 'Failed to update PIN', ok: false })
      if (res.ok) setPin({ new: '', confirm: '' })
    } finally { setPinLoading(false) }
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
        setUsers(prev => [...prev, { id, email: userForm.email, role: userForm.role, created_at: new Date().toISOString() }])
        setUserForm({ email: '', password: '', role: 'admin' })
        setUserMsg({ text: 'User added ✓', ok: true })
      } else {
        const data = await res.json()
        setUserMsg({ text: data.error || 'Failed to add user', ok: false })
      }
    } finally { setUserLoading(false) }
  }

  async function deleteUser(id: number, email: string) {
    if (!confirm(`Remove ${email}?`)) return
    const res = await fetch('/api/admin/settings/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id))
    else { const d = await res.json(); alert(d.error || 'Failed to remove user') }
  }

  async function addIp(e: React.FormEvent) {
    e.preventDefault()
    setIpMsg(null)
    setIpLoading(true)
    try {
      const res = await fetch('/api/admin/settings/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ipForm),
      })
      if (res.ok) {
        const exp = new Date(Date.now() + ipForm.days * 864e5).toISOString()
        setWhitelist(prev => {
          const without = prev.filter(w => w.ip_address !== ipForm.ip)
          return [{ id: Date.now(), ip_address: ipForm.ip, label: ipForm.label || null, expires_at: exp, created_at: new Date().toISOString(), expired: false }, ...without]
        })
        setIpForm({ ip: '', label: '', days: 30 })
        setIpMsg({ text: 'IP whitelisted ✓', ok: true })
      } else {
        const d = await res.json()
        setIpMsg({ text: d.error || 'Failed to add IP', ok: false })
      }
    } finally { setIpLoading(false) }
  }

  async function revokeIp(ip: string) {
    if (!confirm(`Revoke access for ${ip}?`)) return
    const res = await fetch('/api/admin/settings/whitelist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    })
    if (res.ok) setWhitelist(prev => prev.filter(w => w.ip_address !== ip))
    else { const d = await res.json(); alert(d.error || 'Failed to revoke') }
  }

  function fmtExpiry(iso: string, expired: boolean): string {
    if (expired) return 'expired'
    const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5)
    return days <= 0 ? 'expiring' : `${days}d left`
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      {/* ── PIN Access ── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>PIN Access</p>
        <p className={styles.hint}>Users on trusted IPs enter this PIN to unlock the admin — no password needed.</p>
        <form onSubmit={updatePin} className={styles.form}>
          <input type="password" inputMode="numeric" placeholder="New PIN (4+ digits)" value={pin.new}
            onChange={e => setPin(p => ({ ...p, new: e.target.value }))} className={styles.input} required />
          <input type="password" inputMode="numeric" placeholder="Confirm PIN" value={pin.confirm}
            onChange={e => setPin(p => ({ ...p, confirm: e.target.value }))} className={styles.input} required />
          <button type="submit" disabled={pinLoading} className={styles.btn}>{pinLoading ? 'Saving…' : 'Update PIN'}</button>
          {pinMsg && <p className={`${styles.msg} ${pinMsg.ok ? styles.msgOk : styles.msgErr}`}>{pinMsg.text}</p>}
        </form>
      </section>

      {/* ── Trusted IPs (Whitelist) ── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Trusted Locations</p>
        <p className={styles.hint}>
          Whitelisted IPs default to PIN login (no password). Added automatically when someone checks
          &ldquo;Trust this location&rdquo;, or manually below. Revoke anytime.
        </p>

        {whitelist.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr><th>IP Address</th><th>Label</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {whitelist.map(w => (
                <tr key={w.id} style={w.expired ? { opacity: 0.5 } : {}}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{w.ip_address}</td>
                  <td>{w.label ?? <span style={{ color: 'var(--ink-faint)' }}>—</span>}</td>
                  <td>
                    <span className={`${styles.badge ?? ''}`} style={{
                      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                      background: w.expired ? 'var(--surface-2)' : 'rgba(74,222,128,0.1)',
                      color: w.expired ? 'var(--ink-faint)' : 'var(--green, #4ade80)',
                    }}>{fmtExpiry(w.expires_at, w.expired)}</span>
                  </td>
                  <td>
                    <button onClick={() => revokeIp(w.ip_address)} className={styles.deleteBtn}>Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className={styles.subTitle}>Whitelist an IP</p>
        <form onSubmit={addIp} className={styles.form}>
          <input type="text" placeholder="IP address (e.g. 140.174.53.82)" value={ipForm.ip}
            onChange={e => setIpForm(p => ({ ...p, ip: e.target.value }))} className={styles.input} required />
          <input type="text" placeholder="Label (e.g. Office, Home)" value={ipForm.label}
            onChange={e => setIpForm(p => ({ ...p, label: e.target.value }))} className={styles.input} />
          <select value={ipForm.days} onChange={e => setIpForm(p => ({ ...p, days: parseInt(e.target.value) }))} className={styles.select}>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
          <button type="submit" disabled={ipLoading} className={styles.btn}>{ipLoading ? 'Adding…' : 'Whitelist IP'}</button>
          {ipMsg && <p className={`${styles.msg} ${ipMsg.ok ? styles.msgOk : styles.msgErr}`}>{ipMsg.text}</p>}
        </form>
      </section>

      {/* ── Users ── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Admin Users</p>
        <p className={styles.hint}>These accounts can sign in with email + password from any location.</p>

        <table className={styles.table}>
          <thead>
            <tr><th>Email</th><th>Role</th><th>Added</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}{u.email === currentUser && <span style={{ color: '#aaa', marginLeft: '0.5rem', fontSize: '0.75rem' }}>(you)</span>}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.email !== currentUser && <button onClick={() => deleteUser(u.id, u.email)} className={styles.deleteBtn}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className={styles.subTitle}>Add User</p>
        <form onSubmit={addUser} className={styles.form}>
          <input type="email" placeholder="Email" value={userForm.email}
            onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} className={styles.input} required />
          <input type="password" placeholder="Password" value={userForm.password}
            onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} className={styles.input} required />
          <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))} className={styles.select}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" disabled={userLoading} className={styles.btn}>{userLoading ? 'Adding…' : 'Add User'}</button>
          {userMsg && <p className={`${styles.msg} ${userMsg.ok ? styles.msgOk : styles.msgErr}`}>{userMsg.text}</p>}
        </form>
      </section>
    </div>
  )
}
