'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import {
  INQUIRY_INTENTS,
  APPOINTMENT_INTENTS,
  HIDE_MESSAGE_INTENTS,
  MESSAGE_REQUIRED_INTENTS,
  DATE_REQUIRED_INTENTS,
  LOCATION_INTENTS,
  COUNTRIES,
  US_STATES,
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

  // Location fields — Authorized Retailers only
  const [countryVal, setCountryVal] = useState('United States')
  const [cityVal,    setCityVal]    = useState('')
  const [stateVal,   setStateVal]   = useState('')

  useEffect(() => {
    if (state.status === 'success') {
      saveProfile({ name: nameVal, email: emailVal, phone: phoneVal })
    }
  }, [state.status, nameVal, emailVal, phoneVal])

  const showDate     = APPOINTMENT_INTENTS.has(intent)
  const hideMessage  = HIDE_MESSAGE_INTENTS.has(intent)
  const msgRequired  = MESSAGE_REQUIRED_INTENTS.has(intent)
  const dateRequired = DATE_REQUIRED_INTENTS.has(intent)
  const showLocation = LOCATION_INTENTS.has(intent)
  const isUS         = countryVal === 'United States'

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
            className={state.fieldErrors?.name ? styles.inputErr : undefined}
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
            className={state.fieldErrors?.email ? styles.inputErr : undefined}
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

      {showLocation && (
        <>
          <label className={styles.field}>
            <span>Country <i>(optional)</i></span>
            <select
              name="country"
              value={countryVal}
              onChange={e => setCountryVal(e.target.value)}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          {isUS && (
            <div className={styles.row}>
              <label className={styles.field}>
                <span>City <i>(optional)</i></span>
                <input
                  name="city"
                  type="text"
                  value={cityVal}
                  onChange={e => setCityVal(e.target.value)}
                  placeholder="Your city"
                />
              </label>
              <label className={styles.field}>
                <span>State <i>(optional)</i></span>
                <select
                  name="state"
                  value={stateVal}
                  onChange={e => setStateVal(e.target.value)}
                >
                  <option value="">Select…</option>
                  {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                </select>
              </label>
            </div>
          )}
        </>
      )}

      {showDate && (
        <label className={styles.field}>
          <span>Preferred date {!dateRequired && <i>(optional)</i>}</span>
          <input
            className={state.fieldErrors?.preferredDate ? styles.inputErr : undefined}
            name="preferredDate"
            type="date"
            required={dateRequired}
          />
          {state.fieldErrors?.preferredDate && <em className={styles.err}>{state.fieldErrors.preferredDate}</em>}
        </label>
      )}

      {!hideMessage && (
        <label className={styles.field}>
          <span>Message {!msgRequired && <i>(optional)</i>}</span>
          <textarea
            className={state.fieldErrors?.message ? styles.inputErr : undefined}
            name="message"
            rows={5}
            required={msgRequired}
          />
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
