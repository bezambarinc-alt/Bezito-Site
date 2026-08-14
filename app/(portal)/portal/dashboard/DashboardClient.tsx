'use client'

import { useState } from 'react'
import styles from './dashboard.module.css'

interface PortalPage {
  slug: string
  title: string
  doc_type: 'showcase' | 'proposal'
  status: string
  customer_pin: string | null
  pin_expires_at: string | null
  updated_at: string
}

interface Props {
  pages: PortalPage[]
  clientName: string
}

export default function DashboardClient({ pages, clientName }: Props) {
  const proposals = pages.filter(p => p.doc_type === 'proposal')
  const showcases  = pages.filter(p => p.doc_type === 'showcase')

  const [pinState, setPinState] = useState<Record<string, string | null>>(
    Object.fromEntries(pages.map(p => [p.slug, p.customer_pin])),
  )
  const [pinExpiry, setPinExpiry] = useState<Record<string, string | null>>(
    Object.fromEntries(pages.map(p => [p.slug, p.pin_expires_at])),
  )
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Request form state
  const [reqSku, setReqSku]       = useState('')
  const [reqMsg, setReqMsg]       = useState('')
  const [reqStatus, setReqStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function generatePin(slug: string) {
    setLoading(l => ({ ...l, [slug]: true }))
    try {
      const res = await fetch(`/api/portal/pages/${slug}/pin`, { method: 'POST' })
      if (res.ok) {
        const d = await res.json()
        setPinState(s => ({ ...s, [slug]: d.pin }))
        setPinExpiry(s => ({ ...s, [slug]: d.expires }))
      }
    } finally {
      setLoading(l => ({ ...l, [slug]: false }))
    }
  }

  async function revokePin(slug: string) {
    setLoading(l => ({ ...l, [slug]: true }))
    try {
      const res = await fetch(`/api/portal/pages/${slug}/pin`, { method: 'DELETE' })
      if (res.ok) {
        setPinState(s => ({ ...s, [slug]: null }))
        setPinExpiry(s => ({ ...s, [slug]: null }))
      }
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
              window.location.href = '/portal/login'
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
                const expiry = pinExpiry[p.slug]
                const busy   = loading[p.slug]
                const isLive = p.status === 'live'

                return (
                  <div key={p.slug} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardTitle}>{p.title}</span>
                      <span className={`${styles.badge} ${isLive ? styles.badgeLive : styles.badgeDraft}`}>
                        {isLive ? 'Live' : p.status}
                      </span>
                    </div>

                    {pin ? (
                      <div className={styles.pinRow}>
                        <span className={styles.pinLabel}>Access code</span>
                        <span className={styles.pin}>{pin}</span>
                        <span className={styles.pinExpiry}>{fmtExpiry(expiry)}</span>
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
          <p className={styles.sectionSub}>Tell us what you'd like and we'll build it for you.</p>

          {reqStatus === 'sent' ? (
            <p className={styles.success}>Request received — we'll be in touch.</p>
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
