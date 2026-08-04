'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './MenuOverlay.module.css'

/** Full-screen two-level navigation overlay, triggered by the header hamburger. */
export default function MenuOverlay() {
  const { active, close } = useDrawers()
  const [subOpen, setSubOpen] = useState(false)
  const open = active === 'menu'

  function handleClose() {
    setSubOpen(false)
    close()
  }

  return (
    <div
      className={`${styles.overlay} ${open ? styles.open : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      aria-hidden={!open}
    >
      <button className={styles.close} onClick={handleClose} aria-label="Close menu">✕</button>

      <div className={styles.panels}>
        <nav className={`${styles.rootPanel} ${subOpen ? styles.dimmed : ''}`} aria-label="Primary">
          <ul>
            <li>
              <button className={styles.rootLink} onClick={() => setSubOpen(true)}>
                Jewelry <span className={styles.chev}>→</span>
              </button>
            </li>
            <li><Link href="/collection/signature" onClick={handleClose} className={styles.rootLink}>Collections</Link></li>
            <li><Link href="/elysian-cut" onClick={handleClose} className={styles.rootLink}>The Elysian Cut</Link></li>
            <li><Link href="/about-bez-ambar" onClick={handleClose} className={styles.rootLink}>About Bez Ambar</Link></li>
            <li><Link href="/the-story" onClick={handleClose} className={styles.rootLink}>The Story</Link></li>
            <li><Link href="/journal" onClick={handleClose} className={styles.rootLink}>Journal</Link></li>
            <li><Link href="/archive" onClick={handleClose} className={styles.rootLink}>The Archive</Link></li>
            <li><Link href="/contact" onClick={handleClose} className={styles.rootLink}>Contact</Link></li>
          </ul>
        </nav>

        <nav className={`${styles.subPanel} ${subOpen ? styles.subOpen : ''}`} aria-label="Jewelry">
          <button className={styles.back} onClick={() => setSubOpen(false)}>← Back</button>

          <div className={styles.subGroup}>
            <h3 className={styles.subTitle}>Collections</h3>
            <ul>
              <li><Link href="/collection/signature" onClick={handleClose}>Signature</Link></li>
              <li><Link href="/collection/high-jewelry" onClick={handleClose}>High Jewelry</Link></li>
              <li><Link href="/collection/bridal" onClick={handleClose}>Bridal</Link></li>
            </ul>
          </div>

          <div className={styles.subGroup}>
            <h3 className={styles.subTitle}>Browse by Category</h3>
            <ul>
              <li><Link href="/jewelry/rings" onClick={handleClose}>Rings</Link></li>
              <li><Link href="/jewelry/bracelets" onClick={handleClose}>Bracelets</Link></li>
              <li><Link href="/jewelry/necklaces" onClick={handleClose}>Necklaces</Link></li>
              <li><Link href="/jewelry/earrings" onClick={handleClose}>Earrings</Link></li>
            </ul>
          </div>

          <div className={styles.subGroup}>
            <h3 className={styles.subTitle}>From the Atelier</h3>
            <ul>
              <li><Link href="/jewelry" onClick={handleClose}>New Arrivals</Link></li>
              <li><Link href="/contact" onClick={handleClose}>Commissions</Link></li>
              <li><Link href="/archive" onClick={handleClose}>The Archive</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}
