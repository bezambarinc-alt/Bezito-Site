'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './MenuOverlay.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────

type NavEntry =
  | { kind: 'link';    label: string; href: string }
  | { kind: 'expand';  label: string; id: string }
  | { kind: 'action';  label: string; target: 'concierge' | 'inquiry'; intent?: string }
  | { kind: 'soon';    label: string }
  | { kind: 'label';   text: string }
  | { kind: 'divider' }

interface SubCol { id: string; items: NavEntry[] }

// ── Root items (matches live bezambar-web2026.vercel.app exactly) ─────────────

const ROOT: NavEntry[] = [
  { kind: 'expand', label: 'Jewelry',     id: 'jewelry' },
  { kind: 'expand', label: 'Atelier',     id: 'atelier' },
  { kind: 'link',   label: 'Blog',        href: '/blog' },
  { kind: 'link',   label: 'The Archive', href: '/archive' },
  { kind: 'action', label: 'Service',     target: 'concierge' },
]

// ── Sub-columns ────────────────────────────────────────────────────────────────

const SUB_COLS: SubCol[] = [
  {
    id: 'jewelry',
    items: [
      { kind: 'label',  text: 'Collections' },
      { kind: 'link',   label: 'Bloom Collection',   href: '/collection/bloom' },
      { kind: 'soon',   label: 'Dentelle Collection' },
      { kind: 'divider' },
      { kind: 'label',  text: 'Browse' },
      { kind: 'link',   label: 'Rings',         href: '/jewelry/rings' },
      { kind: 'link',   label: 'Bands',          href: '/jewelry/wedding-bands' },
      { kind: 'link',   label: 'Bracelets',      href: '/jewelry/bracelets' },
      { kind: 'link',   label: 'Earrings',       href: '/jewelry/earrings' },
      { kind: 'link',   label: 'Necklaces',      href: '/jewelry/necklaces' },
      { kind: 'link',   label: 'Pendants',       href: '/jewelry/pendants' },
      { kind: 'divider' },
      { kind: 'label',  text: 'From the Atelier' },
      { kind: 'link',   label: 'The Heart Ruby',    href: '/jewelry/bracelets/heart-ruby' },
      { kind: 'link',   label: 'The 30-Carat Flex', href: '/jewelry/bracelets/30-carat-flex' },
      { kind: 'link',   label: 'Elysian Band',      href: '/jewelry/wedding-bands/elysian-band-50' },
      { kind: 'soon',   label: 'Cascata' },
      { kind: 'soon',   label: 'Crossover Ashoka®' },
    ],
  },
  {
    id: 'atelier',
    items: [
      { kind: 'link',  label: 'About Bez Ambar',  href: '/about-bez-ambar' },
      { kind: 'link',  label: 'Elysian Cut™',     href: '/elysian-cut' },
      { kind: 'link',  label: 'Journal',          href: '/journal' },
      { kind: 'divider' },
      { kind: 'label', text: 'Resources' },
      { kind: 'link',  label: 'Diamond Education', href: '/diamond-education' },
      { kind: 'link',  label: 'Ring Size Guide',   href: '/ring-size-chart' },
    ],
  },
]

// ── MenuOverlay ────────────────────────────────────────────────────────────────

export default function MenuOverlay() {
  const { active, close, openConcierge, openInquiryDrawer } = useDrawers()
  const open   = active === 'menu'
  const [sub, setSub] = useState<string | null>(null)

  function handleClose() {
    setSub(null)
    close()
  }

  function handleAction(target: 'concierge' | 'inquiry', intent?: string) {
    handleClose()
    if (target === 'concierge') openConcierge()
    if (target === 'inquiry')   openInquiryDrawer(intent ? { intent } : {})
  }

  const activeSub = SUB_COLS.find((c) => c.id === sub)

  const overlayClass = [
    styles.overlay,
    open ? styles.open   : '',
    sub  ? styles.hasSub : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Backdrop scrim */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Slide-in nav — matches Astro .menu-overlay */}
      <nav className={overlayClass} aria-hidden={!open} aria-label="Main menu">
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close menu">
          ×
        </button>
        {/* Logo links back to home and closes menu — Astro uses <a> not <div> */}
        <Link href="/" className={styles.logo} onClick={handleClose}>BEZ AMBAR</Link>

        {/* Column 1 — root */}
        <ul className={styles.col}>
          {ROOT.map((item, i) => {
            if (item.kind === 'expand') return (
              <li key={i}>
                <button
                  type="button"
                  className={`${styles.item} ${styles.itemExpand} ${sub === item.id ? styles.itemActive : ''}`}
                  onClick={() => setSub(sub === item.id ? null : item.id)}
                >
                  {item.label}
                </button>
              </li>
            )
            if (item.kind === 'link') return (
              <li key={i}>
                <Link href={item.href} onClick={handleClose} className={styles.item}>
                  {item.label}
                </Link>
              </li>
            )
            if (item.kind === 'action') return (
              <li key={i}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => handleAction(item.target, item.intent)}
                >
                  {item.label}
                </button>
              </li>
            )
            return null
          })}

          {/* CTA items — bottom of root col, matches Astro .menu-cta-item */}
          <li className={styles.ctaItem}>
            <button
              type="button"
              className={styles.ctaBtn}
              onClick={() => { handleClose(); openInquiryDrawer({ intent: 'consultation' }) }}
            >
              Arrange a Private Consultation
            </button>
          </li>
          <li className={styles.ctaItem}>
            <button
              type="button"
              className={styles.conciergeBtn}
              onClick={() => { handleClose(); openConcierge() }}
            >
              Atelier Concierge
            </button>
          </li>
        </ul>

        {/* Column 2 — sub (expands drawer width) */}
        {activeSub && (
          <ul className={styles.col}>
            {/* Back button — matches Astro .menu-back */}
            <li className={styles.backItem}>
              <button type="button" className={styles.backBtn} onClick={() => setSub(null)}>
                ← Back
              </button>
            </li>

            {activeSub.items.map((item, i) => {
              if (item.kind === 'label') return (
                <li key={i} className={styles.sectionLabel}>{item.text}</li>
              )
              if (item.kind === 'divider') return (
                <li key={i} className={styles.divider} aria-hidden />
              )
              if (item.kind === 'link') return (
                <li key={i}>
                  <Link href={item.href} onClick={handleClose} className={styles.item}>
                    {item.label}
                  </Link>
                </li>
              )
              if (item.kind === 'soon') return (
                <li key={i}>
                  <span className={`${styles.item} ${styles.itemSoon}`}>{item.label}</span>
                </li>
              )
              if (item.kind === 'action') return (
                <li key={i}>
                  <button
                    type="button"
                    className={styles.item}
                    onClick={() => handleAction(item.target, item.intent)}
                  >
                    {item.label}
                  </button>
                </li>
              )
              return null
            })}
          </ul>
        )}
      </nav>
    </>
  )
}
