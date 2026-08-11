'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './Footer.module.css'

// ── Social SVG icons — exact pixel match to Astro live site ──────────────────

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.188 2.516 7.789 6.153 9.32-.085-.745-.162-1.888.034-2.702.175-.74 1.17-4.96 1.17-4.96s-.298-.597-.298-1.481c0-1.387.806-2.425 1.807-2.425.853 0 1.266.64 1.266 1.407 0 .857-.547 2.14-.828 3.33-.235.995.498 1.805 1.476 1.805 1.771 0 3.135-1.866 3.135-4.559 0-2.384-1.715-4.05-4.163-4.05-2.836 0-4.502 2.126-4.502 4.327 0 .857.33 1.775.74 2.277a.3.3 0 01.07.285l-.275 1.12c-.044.18-.146.218-.336.132C5.985 15.882 5 13.997 5 12c0-2.21 1.628-4.997 5.996-4.997C15 7 18 9.476 18 13.07c0 4.002-2.52 7.218-6.024 7.218-1.177 0-2.285-.613-2.664-1.335l-.724 2.707c-.262.997-.97 2.246-1.44 3.007A10 10 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 7s-.3-2-1.2-2.8C19.6 3.1 18.4 3 17.8 3 14.6 2.9 12 2.9 12 2.9s-2.6 0-5.8.1c-.6.1-1.8.1-2 1.2C4 5 4 7 4 12s0 5 .2 6c.2 1.1 1.4 1.1 2 1.2 3.2.1 5.8.1 5.8.1s2.6 0 5.8-.1c.6-.1 1.8-.1 2-1.2C20 17 20 15 20 12s0-5-.2-5.8L22 7z" />
      <polygon points="10,9 10,15 16,12" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M8 11v6" />
      <path d="M8 8v.01" />
      <path d="M12 17v-6" />
      <path d="M16 17v-3a2 2 0 00-4 0" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className={styles.chevron} width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Collapsible nav column — accordion on mobile, static on desktop ───────────

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  function handleToggle() {
    // Toggle state always; CSS controls visibility on desktop
    // (desktop: pointer-events:none on .toggle, colLinks always visible)
    setOpen((o) => !o)
  }

  return (
    <div className={`${styles.col} ${open ? styles.colOpen : ''}`}>
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        onClick={handleToggle}
      >
        {title}
        <ChevronIcon />
      </button>
      <div className={styles.colLinks}>
        {children}
      </div>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

/**
 * Exact structural match to Astro .ba-footer:
 * - 5 columns: brand + Shop + Atelier + Service + Visit the Atelier
 * - SVG social icons (all 5 platforms, exact Astro URLs)
 * - Mobile accordion (toggle buttons + chevron)
 * - Correct legal links (/privacy-policy, /terms, /warranty)
 */
export default function Footer() {
  const { openConcierge } = useDrawers()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.cols}>

          {/* ── Brand column — always visible, no accordion ── */}
          <div className={styles.brand}>
            <p className={styles.wordmark}>Bez Ambar</p>
            <p className={styles.tagline}>Inventor of the Princess Cut</p>
            <p className={styles.estab}>Los Angeles · Est. 1979</p>
            <div className={styles.social}>
              <a
                href="https://www.instagram.com/bezambarjewelry/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.pinterest.com/bezambarinc/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className={styles.socialLink}
              >
                <PinterestIcon />
              </a>
              <a
                href="https://www.youtube.com/@BezAmbarInc/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className={styles.socialLink}
              >
                <YouTubeIcon />
              </a>
              <a
                href="https://www.tiktok.com/@bezambar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className={styles.socialLink}
              >
                <TikTokIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/bez-ambar-869936a/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.socialLink}
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* ── Shop — matches Astro Footer.astro exactly ── */}
          <FooterCol title="Shop">
            <Link href="/collection/bloom">Bloom Collection</Link>
            <Link href="/jewelry/rings">Rings</Link>
            <Link href="/jewelry/bands">Bands</Link>
            <Link href="/jewelry/bracelets">Bracelets</Link>
            <Link href="/jewelry/earrings">Earrings</Link>
            <Link href="/jewelry/necklaces">Necklaces</Link>
            <Link href="/jewelry/pendants">Pendants</Link>
          </FooterCol>

          {/* ── Discover — Astro calls this column "Discover" not "Atelier" ── */}
          <FooterCol title="Discover">
            <Link href="/about-bez-ambar">About Bez Ambar</Link>
            <Link href="/elysian-cut">Elysian Cut™</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/archive">The Archive</Link>
            <Link href="/diamond-education">Diamond Education</Link>
            <Link href="/ring-size-chart">Ring Size Guide</Link>
          </FooterCol>

          {/* ── Service ── */}
          <FooterCol title="Service">
            <button
              type="button"
              className={styles.inlineBtn}
              onClick={openConcierge}
            >
              Atelier Concierge
            </button>
            <Link href="/contact">Contact</Link>
            <Link href="/warranty">Warranty &amp; Policies</Link>
          </FooterCol>

          {/* ── Visit the Atelier ── */}
          <FooterCol title="Visit the Atelier">
            <address className={styles.address}>
              611 Wilshire Blvd<br />
              Los Angeles, CA 90017
            </address>
            <p className={styles.appt}>Private atelier · by appointment</p>
            <button
              type="button"
              className={styles.arrangeBtn}
              onClick={openConcierge}
            >
              Arrange a Visit ›
            </button>
          </FooterCol>

        </div>

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 Bez Ambar Inc. All rights reserved.</p>
          <nav className={styles.legal} aria-label="Legal">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/warranty">Warranty</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
