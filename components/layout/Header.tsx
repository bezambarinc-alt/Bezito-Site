'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './Header.module.css'

/**
 * Fixed, transparent header that inverts to a solid dark bar once the visitor
 * scrolls past the first viewport of dark hero content.
 */
export default function Header() {
  const { openMenu, openSearch, openConcierge } = useDrawers()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <button className={styles.iconBtn} aria-label="Open menu" onClick={openMenu}>
          <span className={styles.hamburger} aria-hidden />
          <span className={styles.menuLabel}>Menu</span>
        </button>

        <Link href="/" className={styles.wordmark} aria-label="Bez Ambar — home">
          BEZ AMBAR
        </Link>

        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="Search" onClick={openSearch}>
            <SearchIcon />
          </button>
          <button className={styles.iconBtn} aria-label="Concierge" onClick={openConcierge}>
            <BellIcon />
          </button>
          <Link href="/contact" className={styles.contactLink}>Contact</Link>
        </div>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}
