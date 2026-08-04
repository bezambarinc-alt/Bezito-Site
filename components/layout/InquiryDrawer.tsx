'use client'

import { useActionState, useEffect, useState } from 'react'
import { useDrawers } from './DrawerContext'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import styles from './InquiryDrawer.module.css'

const INTENTS = [
  'In Person Appointment',
  'Virtual Appointment',
  'Commission a Piece',
  'A Piece from the Collection',
  'Repair & Cleaning',
  'Ring Resizing',
] as const

const APPOINTMENT_INTENTS = new Set(['In Person Appointment', 'Virtual Appointment'])

const initialState: InquiryState = { status: 'idle' }

/** Right-panel slide-in inquiry form. Submits via the submitInquiry Server Action. */
export default function InquiryDrawer() {
  const { active, close, inquiryPrefill } = useDrawers()
  const open = active === 'inquiry'
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const [intent, setIntent] = useState<string>(inquiryPrefill.intent ?? INTENTS[0])

  useEffect(() => {
    if (open && inquiryPrefill.intent) setIntent(inquiryPrefill.intent)
  }, [open, inquiryPrefill.intent])

  const showDate = APPOINTMENT_INTENTS.has(intent)
  const success = state.status === 'success'

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ''}`} onClick={close} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Make an inquiry"
        aria-hidden={!open}
      >
        <div className={styles.head}>
          <p className={styles.eyebrow}>Private Inquiry</p>
          <button className={styles.close} onClick={close} aria-label="Close inquiry">✕</button>
        </div>

        {inquiryPrefill.title && (
          <p className={styles.piece}>
            Regarding <span>{inquiryPrefill.title}</span>
            {inquiryPrefill.sku ? ` · ${inquiryPrefill.sku}` : ''}
          </p>
        )}

        {success ? (
          <div className={styles.success}>
            <h2>Thank you.</h2>
            <p>{state.message}</p>
            <button className={styles.submit} onClick={close}>Close</button>
          </div>
        ) : (
          <form action={formAction} className={styles.form}>
            <input type="hidden" name="sku" value={inquiryPrefill.sku ?? ''} />
            <input type="hidden" name="pieceTitle" value={inquiryPrefill.title ?? ''} />

            <label className={styles.field}>
              <span>Name</span>
              <input name="name" required autoComplete="name" />
              {state.fieldErrors?.name && <em className={styles.err}>{state.fieldErrors.name}</em>}
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
              {state.fieldErrors?.email && <em className={styles.err}>{state.fieldErrors.email}</em>}
            </label>

            <label className={styles.field}>
              <span>Phone <i>(optional)</i></span>
              <input name="phone" type="tel" autoComplete="tel" />
            </label>

            <label className={styles.field}>
              <span>How may we help?</span>
              <select name="intent" value={intent} onChange={(e) => setIntent(e.target.value)}>
                {INTENTS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </label>

            {showDate && (
              <label className={styles.field}>
                <span>Preferred date</span>
                <input name="preferredDate" type="date" />
              </label>
            )}

            <label className={styles.field}>
              <span>Message <i>(optional)</i></span>
              <textarea name="message" rows={4} />
            </label>

            {state.status === 'error' && state.message && (
              <p className={styles.formErr}>{state.message}</p>
            )}

            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </aside>
    </>
  )
}
