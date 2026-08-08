'use client'

import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import type { InquiryIntent } from '@/lib/data/inquiry-constants'
import styles from './ConciergeDrawer.module.css'

export default function ConciergeDrawer() {
  const { active, close, openInquiryDrawer } = useDrawers()
  const open = active === 'concierge'
  const [apptOpen, setApptOpen] = useState(false)
  const [svcOpen,  setSvcOpen]  = useState(false)

  // Typed to InquiryIntent (or '' for Atelier Chat's no-preset) so any string
  // that isn't a valid Zod intent is a COMPILE error — the duplication that
  // caused the submission bug can't come back silently.
  function toInquiry(intent: InquiryIntent | '') {
    close()
    openInquiryDrawer({ intent, fromConcierge: true })
  }

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ''}`} onClick={close} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Contact Us"
        aria-hidden={!open}
      >
        <div className={styles.panel}>
          <button className={styles.close} onClick={close} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>

          <h2 className={styles.heading}>Contact Us</h2>

          <ul className={styles.list} role="list">

            {/* Atelier Chat */}
            <li>
              <button className={styles.row} onClick={() => toInquiry('')}>
                <span className={styles.rowIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3.5l2.5 2.5 2.5-2.5H15a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.rowLabel}>Atelier Chat</span>
                <span className={styles.rowChevron} aria-hidden>›</span>
              </button>
            </li>

            {/* Call Us */}
            <li>
              <a href="tel:2136299191" className={styles.row}>
                <span className={styles.rowIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 2.5c-.3 0-.5.1-.7.3L2.1 4c-.8.8-.8 2 0 2.9 1.3 2 3 3.7 5 5 1 .7 2.3.7 3.1-.1l1.2-1.2c.4-.4.4-1 0-1.4L9.8 7.6c-.4-.4-1-.4-1.4 0l-.5.5c-.2.2-.4.2-.6 0C6.5 7.4 5.8 6.7 5.4 6c-.2-.2-.2-.4 0-.6l.5-.5c.4-.4.4-1 0-1.4L4.7 2.8c-.2-.2-.4-.3-.7-.3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.rowLabel}>Call Us</span>
                <span className={styles.rowChevron} aria-hidden>›</span>
              </a>
            </li>

            {/* Book an Appointment — expandable */}
            <li className={`${styles.expandWrap} ${apptOpen ? styles.expandOpen : ''}`}>
              <button
                className={styles.row}
                onClick={() => setApptOpen((v) => !v)}
                aria-expanded={apptOpen}
              >
                <span className={styles.rowIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M2 8h14" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M6 2v3M12 2v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    <circle cx="6.5" cy="12" r=".9" fill="currentColor" />
                    <circle cx="9"   cy="12" r=".9" fill="currentColor" />
                    <circle cx="11.5" cy="12" r=".9" fill="currentColor" />
                  </svg>
                </span>
                <span className={styles.rowLabel}>Book an Appointment</span>
                <span className={`${styles.rowChevron} ${apptOpen ? styles.chevronOpen : ''}`} aria-hidden>›</span>
              </button>
              <ul className={styles.subList} role="list">
                <li>
                  <button className={`${styles.row} ${styles.rowSub}`} onClick={() => toInquiry('In Person Appointment')}>
                    <span className={styles.rowLabel}>In Person</span>
                    <span className={styles.rowChevron} aria-hidden>›</span>
                  </button>
                </li>
                <li>
                  <button className={`${styles.row} ${styles.rowSub}`} onClick={() => toInquiry('Virtual Appointment')}>
                    <span className={styles.rowLabel}>Virtual</span>
                    <span className={styles.rowChevron} aria-hidden>›</span>
                  </button>
                </li>
              </ul>
            </li>

            {/* Services — expandable */}
            <li className={`${styles.expandWrap} ${svcOpen ? styles.expandOpen : ''}`}>
              <button
                className={styles.row}
                onClick={() => setSvcOpen((v) => !v)}
                aria-expanded={svcOpen}
              >
                <span className={styles.rowIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M13.5 2.5a3 3 0 00-2.8 4l-6.5 6.5a1.5 1.5 0 002.1 2.1l6.5-6.5a3 3 0 004-2.8 3 3 0 00-.4-1.5l-1.9 1.9-1.5-1.5 1.9-1.9a3 3 0 00-1.4-.3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.rowLabel}>Services</span>
                <span className={`${styles.rowChevron} ${svcOpen ? styles.chevronOpen : ''}`} aria-hidden>›</span>
              </button>
              <ul className={styles.subList} role="list">
                <li>
                  <button className={`${styles.row} ${styles.rowSub}`} onClick={() => toInquiry('Repair & Cleaning')}>
                    <span className={styles.rowLabel}>Repair &amp; Cleaning</span>
                    <span className={styles.rowChevron} aria-hidden>›</span>
                  </button>
                </li>
                <li>
                  <button className={`${styles.row} ${styles.rowSub}`} onClick={() => toInquiry('Ring Resizing')}>
                    <span className={styles.rowLabel}>Ring Resizing</span>
                    <span className={styles.rowChevron} aria-hidden>›</span>
                  </button>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </aside>
    </>
  )
}
