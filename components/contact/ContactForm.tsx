'use client'

import { useActionState, useState } from 'react'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import { INQUIRY_INTENTS, APPOINTMENT_INTENTS } from '@/lib/data/inquiry-constants'
import styles from './ContactForm.module.css'

const initialState: InquiryState = { status: 'idle' }

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const [intent, setIntent] = useState<string>(INQUIRY_INTENTS[0])
  const showDate = APPOINTMENT_INTENTS.has(intent)

  if (state.status === 'success') {
    return (
      <div className={styles.success}>
        <h2>Thank you.</h2>
        <p>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="pageSlug" value="contact" />

      <div className={styles.row}>
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
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Phone <i>(optional)</i></span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label className={styles.field}>
          <span>How may we help?</span>
          <select name="intent" value={intent} onChange={(e) => setIntent(e.target.value)}>
            {INQUIRY_INTENTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>
      </div>

      {showDate && (
        <label className={styles.field}>
          <span>Preferred date</span>
          <input name="preferredDate" type="date" />
        </label>
      )}

      <label className={styles.field}>
        <span>Message</span>
        <textarea name="message" rows={5} />
      </label>

      {state.status === 'error' && state.message && <p className={styles.formErr}>{state.message}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  )
}
