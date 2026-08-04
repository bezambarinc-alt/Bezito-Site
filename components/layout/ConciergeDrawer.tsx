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

        <h2 className={styles.title}>How may we assist?</h2>

        <ul className={styles.list}>
          <li>
            <button onClick={() => toInquiry('A Piece from the Collection')}>
              <span className={styles.label}>Atelier Chat</span>
              <span className={styles.sub}>Speak with a jewelry specialist</span>
            </button>
          </li>
          <li>
            <a href="tel:+13102743333">
              <span className={styles.label}>Call Us</span>
              <span className={styles.sub}>+1 (310) 274-3333</span>
            </a>
          </li>
          <li>
            <a href="mailto:atelier@bezambar.com">
              <span className={styles.label}>Send Email</span>
              <span className={styles.sub}>atelier@bezambar.com</span>
            </a>
          </li>
          <li>
            <button onClick={() => setApptOpen((v) => !v)} aria-expanded={apptOpen}>
              <span className={styles.label}>Book an Appointment {apptOpen ? '−' : '+'}</span>
              <span className={styles.sub}>In person or virtual</span>
            </button>
            {apptOpen && (
              <ul className={styles.subList}>
                <li><button onClick={() => toInquiry('In Person Appointment')}>In Person Appointment</button></li>
                <li><button onClick={() => toInquiry('Virtual Appointment')}>Virtual Appointment</button></li>
                <li><button onClick={() => toInquiry('Commission a Piece')}>Commission a Piece</button></li>
              </ul>
            )}
          </li>
        </ul>
      </aside>
    </>
  )
}
