'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import {
  INQUIRY_INTENTS,
  APPOINTMENT_INTENTS,
  HIDE_MESSAGE_INTENTS,
  MESSAGE_REQUIRED_INTENTS,
  DATE_REQUIRED_INTENTS,
} from '@/lib/data/inquiry-constants'
import { readProfile, saveProfile } from '@/lib/user-profile'
import styles from './ContactForm.module.css'

const initialState: InquiryState = { status: 'idle' }

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const [intent, setIntent] = useState<string>(INQUIRY_INTENTS[0])

  // Identity fields — pre-filled from sessionStorage, saved on successful submit
  const [nameVal,  setNameVal]  = useState(() => readProfile().name)
  const [emailVal, setEmailVal] = useState(() => readProfile().email)
  const [phoneVal, setPhoneVal] = useState(() => readProfile().phone)

  useEffect(() => {
    if (state.status === 'success') {
      saveProfile({ name: nameVal, email: emailVal, phone: phoneVal })
    }
  }, [state.status, nameVal, emailVal, phoneVal])

  const showDate    = APPOINTMENT_INTENTS.has(intent)
  const hideMessage = HIDE_MESSAGE_INTENTS.has(intent)
  const msgRequired  = MESSAGE_REQUIRED_INTENTS.has(intent)
  const dateRequired = DATE_REQUIRED_INTENTS.has(intent)

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
          <input
            name="name"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            required
            autoComplete="name"
          />
          {state.fieldErrors?.name && <em className={styles.err}>{state.fieldErrors.name}</em>}
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={emailVal}
            onChange={e => setEmailVal(e.target.value)}
            required
            autoComplete="email"
          />
          {state.fieldErrors?.email && <em className={styles.err}>{state.fieldErrors.email}</em>}
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Phone <i>(optional)</i></span>
          <input
            name="phone"
            type="tel"
            value={phoneVal}
            onChange={e => setPhoneVal(e.target.value)}
            autoComplete="tel"
          />
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
          <span>Preferred date {!dateRequired && <i>(optional)</i>}</span>
          <input
            name="preferredDate"
            type="text"
            required={dateRequired}
            placeholder="e.g. Mon or Tue afternoon"
          />
          {state.fieldErrors?.preferredDate && <em className={styles.err}>{state.fieldErrors.preferredDate}</em>}
        </label>
      )}

      {!hideMessage && (
        <label className={styles.field}>
          <span>Message {!msgRequired && <i>(optional)</i>}</span>
          <textarea name="message" rows={5} required={msgRequired} />
          {state.fieldErrors?.message && <em className={styles.err}>{state.fieldErrors.message}</em>}
        </label>
      )}

      {state.status === 'error' && state.message && <p className={styles.formErr}>{state.message}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send Inquiry'}
      </button>
      <p className={styles.disclosure}>By submitting, you agree to our <a href="/privacy-policy">Privacy Policy</a>.</p>
    </form>
  )
}
