'use client'

import { useActionState, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useDrawers } from './DrawerContext'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import {
  INQUIRY_INTENTS,
  APPOINTMENT_INTENTS,
  HIDE_MESSAGE_INTENTS,
} from '@/lib/data/inquiry-constants'
import styles from './InquiryDrawer.module.css'

const initialState: InquiryState = { status: 'idle' }

/** Right-panel slide-in inquiry form. Matches Astro #inquiry-drawer / .ba-drawer */
export default function InquiryDrawer() {
  const { active, close, openConcierge, inquiryPrefill } = useDrawers()
  const pathname = usePathname()
  const open = active === 'inquiry'
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const [intent, setIntent] = useState<string>(inquiryPrefill.intent ?? '')

  useEffect(() => {
    if (open) setIntent(inquiryPrefill.intent ?? '')
  }, [open, inquiryPrefill.intent])

  const showDate    = APPOINTMENT_INTENTS.has(intent)
  const hideMessage = HIDE_MESSAGE_INTENTS.has(intent)
  const showBack    = !!inquiryPrefill.fromConcierge
  const success     = state.status === 'success'

  function handleBack() {
    close()
    openConcierge()
  }

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ''}`} onClick={close} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inq-heading"
        aria-hidden={!open}
      >
        {/* Back + Close bar */}
        <div className={styles.bar}>
          {showBack ? (
            <button className={styles.backBtn} onClick={handleBack} aria-label="Back to concierge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}
          <button className={styles.close} onClick={close} aria-label="Close inquiry panel">✕</button>
        </div>

        {/* Context panel — "Inquiring about <piece>" */}
        {inquiryPrefill.title && (
          <div className={styles.context}>
            <p className={styles.contextLabel}>Inquiring about</p>
            <p className={styles.contextTitle}>
              {inquiryPrefill.title}
              {inquiryPrefill.sku ? ` · ${inquiryPrefill.sku}` : ''}
            </p>
          </div>
        )}

        <div className={styles.body}>
          <h2 id="inq-heading" className={styles.heading}>Connect with the Atelier</h2>
          <p className={styles.subhead}>We respond personally within one business day.</p>

          {success ? (
            <div className={styles.success}>
              <p>{state.message}</p>
              <button className={styles.submit} onClick={close}>Close</button>
            </div>
          ) : (
            <form action={formAction} className={styles.form}>
              <input type="hidden" name="sku"       value={inquiryPrefill.sku   ?? ''} />
              <input type="hidden" name="pieceTitle" value={inquiryPrefill.title ?? ''} />
              <input type="hidden" name="pageSlug"   value={(pathname ?? '').slice(1)} />

              {/* Row 1: Name + Email */}
              <div className={styles.formRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Your Name</span>
                  <input
                    className={styles.input}
                    name="name"
                    type="text"
                    placeholder="First and Last"
                    required
                    autoComplete="name"
                  />
                  {state.fieldErrors?.name && <em className={styles.err}>{state.fieldErrors.name}</em>}
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Email Address</span>
                  <input
                    className={styles.input}
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                  />
                  {state.fieldErrors?.email && <em className={styles.err}>{state.fieldErrors.email}</em>}
                </label>
              </div>

              {/* Row 2: Phone + How Can We Help */}
              <div className={styles.formRow}>
                <label className={styles.field}>
                  <span className={styles.label}>
                    Phone <span className={styles.optional}>(optional)</span>
                  </span>
                  <input
                    className={styles.input}
                    name="phone"
                    type="tel"
                    placeholder="(xxx) xxx-xxxx"
                    autoComplete="tel"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>How Can We Help</span>
                  <select
                    className={`${styles.input} ${styles.select}`}
                    name="intent"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    required
                  >
                    <option value="">Select…</option>
                    {INQUIRY_INTENTS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Message — hidden for resize */}
              {!hideMessage && (
                <label className={styles.field}>
                  <span className={styles.label}>
                    Message <span className={styles.optional}>(optional)</span>
                  </span>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    name="message"
                    rows={3}
                    placeholder="Tell us what you have in mind…"
                  />
                </label>
              )}

              {/* Preferred Date — appointments only */}
              {showDate && (
                <label className={styles.field}>
                  <span className={styles.label}>
                    Preferred Date <span className={styles.optional}>(optional)</span>
                  </span>
                  <input
                    className={styles.input}
                    name="preferredDate"
                    type="text"
                    placeholder="e.g. Mon or Tue afternoon"
                  />
                </label>
              )}

              <p className={styles.privacy}>Your enquiry is private and handled directly by Bez's team.</p>

              {state.status === 'error' && state.message && (
                <p className={styles.formErr} role="alert">{state.message}</p>
              )}

              <button className={styles.submit} type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send Inquiry'}
              </button>
            </form>
          )}

          {/* Contact block — always visible */}
          <div className={styles.contact}>
            <hr className={styles.contactRule} />
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Tel</span>
              <a href="tel:2136299191" className={styles.contactValue}>(213) 629-9191</a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Atelier</span>
              <span className={styles.contactValue}>
                611 Wilshire Blvd<br />Los Angeles, CA 90017
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
