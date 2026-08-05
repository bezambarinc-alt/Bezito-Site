'use client'

import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './ConciergeDrawer.module.css'

/** Right-panel concierge options. Book an Appointment expands to appointment types. */
export default function ConciergeDrawer() {
  const { active, close, openInquiryDrawer } = useDrawers()
  const open = active === 'concierge'
  const [apptOpen, setApptOpen] = useState(false)

  function toInquiry(intent: string) {
    close()
    openInquiryDrawer({ intent })
  }

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ''}`} onClick={close} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Concierge"
        aria-hidden={!open}
      >
        <div className={styles.head}>
          <p className={styles.eyebrow}>Concierge</p>
          <button className={styles.close} onClick={close} aria-label="Close concierge">✕</button>
        </div>

        <h2 className={styles.title}>Private Consultation</h2>
        <p className={styles.intro}>
          Meet with Bez or a senior advisor to discuss your vision — a piece from the collection, a bespoke commission, or a single extraordinary stone. Available in person at the LA atelier or by video call.
        </p>

        <ul className={styles.list}>
          <li>
            <button onClick={() => toInquiry('A Piece from the Collection')}>
              <span className={styles.label}>Send an Inquiry</span>
              <span className={styles.sub}>Request information or begin a commission</span>
            </button>
          </li>
          <li>
            <button onClick={() => setApptOpen((v) => !v)} aria-expanded={apptOpen}>
              <span className={styles.label}>Book an Appointment {apptOpen ? '−' : '+'}</span>
              <span className={styles.sub}>LA atelier · in person or video call</span>
            </button>
            {apptOpen && (
              <ul className={styles.subList}>
                <li><button onClick={() => toInquiry('In Person Appointment')}>In Person — 611 Wilshire Blvd, Los Angeles</button></li>
                <li><button onClick={() => toInquiry('Virtual Appointment')}>Video Call</button></li>
                <li><button onClick={() => toInquiry('Commission a Piece')}>Commission a Piece</button></li>
              </ul>
            )}
          </li>
          <li>
            <a href="tel:+13102743333">
              <span className={styles.label}>Call the Atelier</span>
              <span className={styles.sub}>+1 (310) 274-3333 · Mon–Fri 10am–6pm PT</span>
            </a>
          </li>
          <li>
            <a href="mailto:bez@bezambar.com">
              <span className={styles.label}>Email</span>
              <span className={styles.sub}>bez@bezambar.com</span>
            </a>
          </li>
        </ul>
      </aside>
    </>
  )
}
