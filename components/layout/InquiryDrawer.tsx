'use client'

import { useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { usePathname } from 'next/navigation'
import { useDrawers } from './DrawerContext'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import {
  INQUIRY_INTENTS,
  INTENT_HEADINGS,
  APPOINTMENT_INTENTS,
  HIDE_MESSAGE_INTENTS,
  MESSAGE_REQUIRED_INTENTS,
  DATE_REQUIRED_INTENTS,
} from '@/lib/data/inquiry-constants'
import styles from './InquiryDrawer.module.css'

const initialState: InquiryState = { status: 'idle' }

interface InquiryPrefill {
  intent?: string
  title?: string
  sku?: string
  fromConcierge?: boolean
}

interface FormProps {
  prefill: InquiryPrefill
  pathname: string
  onClose: () => void
}

function InquiryForm({ prefill, pathname, onClose }: FormProps) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const [intent, setIntent] = useState<string>(prefill.intent ?? '')

  const showDate    = APPOINTMENT_INTENTS.has(intent)
  const hideMessage = HIDE_MESSAGE_INTENTS.has(intent)
  const msgRequired  = MESSAGE_REQUIRED_INTENTS.has(intent)
  const dateRequired = DATE_REQUIRED_INTENTS.has(intent)
  const success      = state.status === 'success'

  return (
    <div className={styles.body}>
      <h2 id="inq-heading" className={styles.heading}>{INTENT_HEADINGS[intent] || 'Connect with the Atelier'}</h2>
      <p className={styles.subhead}>
        {intent === 'Authorized Retailers'
          ? 'Bez Ambar is available through a select network of authorized retail partners worldwide. Share your location and we\'ll connect you directly.'
          : 'We respond personally within one business day.'}
      </p>

      {success ? (
        <div className={styles.success}>
          <p>{state.message}</p>
          <button className={styles.submit} onClick={onClose}>Close</button>
        </div>
      ) : (
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="sku"        value={prefill.sku   ?? ''} />
          <input type="hidden" name="pieceTitle"  value={prefill.title ?? ''} />
          <input type="hidden" name="pageSlug"    value={pathname.slice(1)} />

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

          {/* Message */}
          {!hideMessage && (
            <label className={styles.field}>
              <span className={styles.label}>
                Message {!msgRequired && <span className={styles.optional}>(optional)</span>}
              </span>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                name="message"
                rows={3}
                required={msgRequired}
                placeholder="Tell us what you have in mind…"
              />
              {state.fieldErrors?.message && <em className={styles.err}>{state.fieldErrors.message}</em>}
            </label>
          )}

          {/* Preferred Date — appointments only */}
          {showDate && (
            <label className={styles.field}>
              <span className={styles.label}>
                Preferred Date {!dateRequired && <span className={styles.optional}>(optional)</span>}
              </span>
              <input
                className={styles.input}
                name="preferredDate"
                type="text"
                required={dateRequired}
                placeholder="e.g. Mon or Tue afternoon"
              />
              {state.fieldErrors?.preferredDate && <em className={styles.err}>{state.fieldErrors.preferredDate}</em>}
            </label>
          )}

          <p className={styles.privacy}>Your enquiry is private and handled directly by Bez&rsquo;s team.</p>

          {state.status === 'error' && state.message && (
            <p className={styles.formErr} role="alert">{state.message}</p>
          )}

          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send Inquiry'}
          </button>
          <p className={styles.privacy}>By submitting, you agree to our <a href="/privacy-policy">Privacy Policy</a>.</p>
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
  )
}

/** Right-panel slide-in inquiry form. Matches Astro #inquiry-drawer / .ba-drawer */
export default function InquiryDrawer() {
  const { active, close, openConcierge, inquiryPrefill } = useDrawers()
  const pathname = usePathname()
  const open = active === 'inquiry'
  const [openKey, setOpenKey] = useState(0)

  // Bump key each time the drawer opens → InquiryForm remounts with fresh state,
  // so a second product inquiry never shows the previous submission's success screen.
  useEffect(() => {
    if (open) setOpenKey((k) => k + 1)
  }, [open])

  const showBack = !!inquiryPrefill.fromConcierge

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
        inert={!open}
      >
        <div className={styles.panel}>
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
            <button className={styles.close} onClick={close} aria-label="Close inquiry panel">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
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

          {/* Keyed so the form remounts (fresh state) on every open */}
          <InquiryForm
            key={openKey}
            prefill={inquiryPrefill}
            pathname={pathname ?? ''}
            onClose={close}
          />
        </div>
      </aside>
    </>
  )
}
