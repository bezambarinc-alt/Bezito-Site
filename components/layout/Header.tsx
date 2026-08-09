'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDrawers } from './DrawerContext'
import { useHeaderModeState } from './HeaderModeContext'
import styles from './Header.module.css'

/**
 * Fixed header → solid white on scroll. Icons match the Astro site exactly.
 * Scroll threshold: > 20px (matches Astro `.is-solid`).
 *
 * Mode is decided in ONE place — the layout's <HeaderRouteMode/> reads the
 * route against VISIBLE_HEADER_ROUTES (HeaderModeContext). Default is
 * 'transparent' (dark-hero pages); non-hero white routes get 'light' (ink).
 * No page tags itself.
 */
export default function Header() {
  const { openMenu, openSearch, openConcierge } = useDrawers()
  const [scrolled, setScrolled] = useState(false)
  const transparent = useHeaderModeState() === 'transparent'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20) // Astro: scrollY > 20
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      id="baHeader"
      className={`${styles.header} ${transparent ? styles.transparent : styles.light} ${scrolled ? styles.scrolled : ''}`}
    >
      {/* Left: hamburger + "Menu" label — no .inner wrapper, exact Astro structure */}
      <button className={styles.menuBtn} aria-label="Open menu" onClick={openMenu}>
        <HamburgerIcon />
        <span className={styles.menuLabel}>Menu</span>
      </button>

      {/* Center: wordmark — absolutely positioned same as Astro .ba-header__logo */}
      <Link href="/" className={styles.wordmark} aria-label="Bez Ambar — home">
        Bez Ambar
      </Link>

      {/* Right: search + concierge */}
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Search" onClick={openSearch}>
          <SearchIcon />
        </button>
        <button className={styles.iconBtn} aria-label="Concierge" onClick={openConcierge}>
          <ConciergeIcon />
        </button>
      </div>
    </header>
  )
}

// ── Icons — exact Astro SVGs ──────────────────────────────────────────────────

/** Hamburger: 3 SVG lines (22×14, stroke-width 1.5) — matches .ba-header__hamburger-icon */
function HamburgerIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
      <line x1="0" y1="1"  x2="22" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="7"  x2="22" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Search: 18×18 viewBox, circle cx=7.5 cy=7.5 r=5.5 — exact Astro .ba-header__icon */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="11.5" y1="11.5" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Concierge bell: hotel desk bell SVG — exact Astro icon (not a notification bell) */
function ConciergeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor" />
      <path d="M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M9 2C5.13 2 2 5.13 2 9v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
