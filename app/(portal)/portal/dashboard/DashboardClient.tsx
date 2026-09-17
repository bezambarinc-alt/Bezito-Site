'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

interface PortalPage {
  slug: string
  title: string
  doc_type: 'showcase' | 'proposal'
  status: string
  /** Whether a code is set — the code itself is hashed and never comes back. */
  has_pin: boolean
  pin_expires_at: string | null
  updated_at: string
}

interface Props {
  pages: PortalPage[]
  clientName: string
}

/** A 401 means the portal session lapsed — say so rather than "try again". */
function pinErrorText(status: number, action: string): string {
  if (status === 401 || status === 403) return 'Your session has expired. Please sign in again.'
  return `Couldn’t ${action}. Please try again.`
}

export default function DashboardClient({ pages, clientName }: Props) {
  const router = useRouter()
  const proposals = pages.filter(p => p.doc_type === 'proposal')
  const showcases  = pages.filter(p => p.doc_type === 'showcase')

  // Whether a code exists, from the server. Separate from the code itself.
  const [hasPin, setHasPin] = useState<Record<string, boolean>>(
    Object.fromEntries(pages.map(p => [p.slug, p.has_pin])),
  )
  // The code in plaintext, which only exists for the tab that generated it —
  // the server stores a bcrypt hash and has no way to hand it back. Reloading
  // clears this, which is why the card offers a regenerate once it's gone.
  const [pinState, setPinState] = useState<Record<string, string | null>>({})
  const [pinExpiry, setPinExpiry] = useState<Record<string, string | null>>(
    Object.fromEntries(pages.map(p => [p.slug, p.pin_expires_at])),
  )
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  // Per-card error text — a failed pin call used to be swallowed, leaving the
  // card looking unchanged with no explanation.
  const [pinError, setPinError] = useState<Record<string, string | null>>({})

  // Request form state
  const [reqSku, setReqSku]       = useState('')
  const [reqMsg, setReqMsg]       = useState('')
  const [reqStatus, setReqStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function generatePin(slug: string) {
    setLoading(l => ({ ...l, [slug]: true }))
    setPinError(e => ({ ...e, [slug]: null }))
    try {
      const res = await fetch(`/api/portal/pages/${slug}/pin`, { method: 'POST' })
      if (res.ok) {
        const d = await res.json()
        setPinState(s => ({ ...s, [slug]: d.pin }))
        setPinExpiry(s => ({ ...s, [slug]: d.expires }))
        setHasPin(s => ({ ...s, [slug]: true }))
      } else {
        setPinError(e => ({ ...e, [slug]: pinErrorText(res.status, 'generate an access code') }))
      }
    } catch {
      setPinError(e => ({ ...e, [slug]: 'Network error — check your connection and try again.' }))
    } finally {
      setLoading(l => ({ ...l, [slug]: false }))
    }
  }

  async function revokePin(slug: string) {
    setLoading(l => ({ ...l, [slug]: true }))
    setPinError(e => ({ ...e, [slug]: null }))
    try {
      const res = await fetch(`/api/portal/pages/${slug}/pin`, { method: 'DELETE' })
      if (res.ok) {
        setPinState(s => ({ ...s, [slug]: null }))
        setPinExpiry(s => ({ ...s, [slug]: null }))
        setHasPin(s => ({ ...s, [slug]: false }))
      } else {
        setPinError(e => ({ ...e, [slug]: pinErrorText(res.status, 'revoke the access code') }))
      }
    } catch {
      setPinError(e => ({ ...e, [slug]: 'Network error — check your connection and try again.' }))
    } finally {
      setLoading(l => ({ ...l, [slug]: false }))
    }
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setReqStatus('sending')
    try {
      const res = await fetch('/api/portal/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_sku: reqSku || undefined, message: reqMsg }),
      })
      if (res.ok) {
        setReqStatus('sent')
        setReqSku('')
        setReqMsg('')
      } else {
        setReqStatus('error')
      }
    } catch {
      setReqStatus('error')
    }
  }

  function fmtExpiry(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    return `Expires ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.welcome}>Welcome back, <strong>{clientName}</strong></span>
          <button
            type="button"
            className={styles.signout}
            onClick={async () => {
              await fetch('/api/portal/auth', { method: 'DELETE' })
              // refresh() drops the cached RSC payload for the dashboard so the
              // signed-out state can't be served back from the client router.
              router.replace('/portal/login')
              router.refresh()
            }}
          >Sign out</button>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Proposals ── */}
        {proposals.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Proposals</h2>
            <p className={styles.sectionSub}>Sent to you directly. Review at your convenience.</p>
            <div className={styles.cards}>
              {proposals.map(p => (
                <div key={p.slug} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardTitle}>{p.title}</span>
                    <span className={`${styles.badge} ${styles.badgeProposal}`}>Proposal</span>
                  </div>
                  <div className={styles.cardMeta}>Updated {new Date(p.updated_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── My Pages ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Pages</h2>
          <p className={styles.sectionSub}>Share a page with your customer using a 4-digit access code.</p>

          {showcases.length === 0 ? (
            <p className={styles.empty}>No pages yet — request one below.</p>
          ) : (
            <div className={styles.cards}>
              {showcases.map(p => {
                const pin    = pinState[p.slug]
                const active = hasPin[p.slug]
                const expiry = pinExpiry[p.slug]
                const busy   = loading[p.slug]
                const err    = pinError[p.slug]
                const isLive = p.status === 'live'

                return (
                  <div key={p.slug} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardTitle}>{p.title}</span>
                      <span className={`${styles.badge} ${isLive ? styles.badgeLive : styles.badgeDraft}`}>
                        {isLive ? 'Live' : p.status}
                      </span>
                    </div>

                    {err && <p className={styles.formError} role="alert">{err}</p>}

                    {/* Three states, because the code is only legible once:
                        just generated (show the digits), set but not in this
                        tab (show that it's live, offer a new one), none. */}
                    {pin ? (
                      <div className={styles.pinRow}>
                        <span className={styles.pinLabel}>Access code</span>
                        <span className={styles.pin}>{pin}</span>
                        <span className={styles.pinExpiry}>{fmtExpiry(expiry)}</span>
                        <span className={styles.noPin}>Copy it now — it isn’t shown again.</span>
                        <div className={styles.pinActions}>
                          <a
                            href={`/preview/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.previewLink}
                          >Preview →</a>
                          <button
                            className={styles.revokeBtn}
                            onClick={() => revokePin(p.slug)}
                            disabled={busy}
                          >{busy ? '…' : 'Revoke'}</button>
                        </div>
                      </div>
                    ) : active ? (
                      <div className={styles.pinRow}>
                        <span className={styles.pinLabel}>Access code</span>
                        <span className={styles.pinExpiry}>Active — {fmtExpiry(expiry)}</span>
                        <div className={styles.pinActions}>
                          <a
                            href={`/preview/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.previewLink}
                          >Preview →</a>
                          <button
                            className={styles.generateBtn}
                            onClick={() => generatePin(p.slug)}
                            disabled={busy}
                            title="Replaces the current code with a new one"
                          >{busy ? '…' : 'New code'}</button>
                          <button
                            className={styles.revokeBtn}
                            onClick={() => revokePin(p.slug)}
                            disabled={busy}
                          >{busy ? '…' : 'Revoke'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.pinRow}>
                        <span className={styles.noPin}>No active access code</span>
                        <button
                          className={styles.generateBtn}
                          onClick={() => generatePin(p.slug)}
                          disabled={busy || !isLive}
                          title={!isLive ? 'Page must be live to generate a code' : undefined}
                        >{busy ? 'Generating…' : 'Generate code'}</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Request a Page ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Request a Page</h2>
          <p className={styles.sectionSub}>Tell us what you&rsquo;d like and we&rsquo;ll build it for you.</p>

          {reqStatus === 'sent' ? (
            <p className={styles.success}>Request received — we&rsquo;ll be in touch.</p>
          ) : (
            <form className={styles.requestForm} onSubmit={submitRequest}>
              {reqStatus === 'error' && <p className={styles.formError}>Something went wrong. Please try again.</p>}

              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="req-sku">Product reference <span className={styles.optional}>(optional)</span></label>
                <input
                  id="req-sku"
                  className={styles.formInput}
                  type="text"
                  value={reqSku}
                  onChange={e => setReqSku(e.target.value)}
                  placeholder="e.g. C0493, Cardinal"
                  maxLength={64}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="req-msg">Message</label>
                <textarea
                  id="req-msg"
                  className={styles.formTextarea}
                  value={reqMsg}
                  onChange={e => setReqMsg(e.target.value)}
                  placeholder="Describe what you'd like to show your customer…"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                />
              </div>

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={reqStatus === 'sending'}
              >{reqStatus === 'sending' ? 'Sending…' : 'Send Request'}</button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
