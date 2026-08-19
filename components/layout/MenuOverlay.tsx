'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import { getCategoryLabel } from '@/lib/data/categories'
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
  { kind: 'expand', label: 'Collections',      id: 'jewelry' },
  { kind: 'link',   label: 'Jewelry Archive', href: '/archive' },
  { kind: 'link',   label: 'Journal',         href: '/journal' },
  { kind: 'expand', label: 'Atelier',         id: 'atelier' },
  { kind: 'action', label: 'Service',         target: 'concierge' },
]

// ── MenuOverlay ────────────────────────────────────────────────────────────────

interface Props {
  /** Active categories from Neon — drives Browse section. */
  categories?: string[]
}

export default function MenuOverlay({ categories = [] }: Props) {
  const { active, close, openConcierge, openInquiryDrawer } = useDrawers()
  const open = active === 'menu'
  const [sub, setSub] = useState<string | null>(null)

  // Build the jewelry sub-column dynamically from Neon data.
  const jewelryItems: NavEntry[] = [
    { kind: 'label' as const, text: 'Collections' },
    ...categories.map(cat => ({
      kind: 'link' as const,
      label: getCategoryLabel(cat),
      href: `/jewelry/${cat}`,
    })),
  ]

  const subCols: SubCol[] = [
    { id: 'jewelry', items: jewelryItems },
    {
      id: 'atelier',
      items: [
        { kind: 'link',  label: 'About Bez Ambar',   href: '/about-bez-ambar' },
        { kind: 'link',  label: 'Elysian Cut™',      href: '/elysian-cut' },
        { kind: 'divider' },
        { kind: 'label', text: 'Resources' },
        { kind: 'link',  label: 'Diamond Education', href: '/diamond-education' },
        { kind: 'link',  label: 'Ring Size Guide',   href: '/ring-size-chart' },
      ],
    },
  ]

  function handleClose() {
    setSub(null)
    close()
  }

  function handleAction(target: 'concierge' | 'inquiry', intent?: string) {
    handleClose()
    if (target === 'concierge') openConcierge()
    if (target === 'inquiry')   openInquiryDrawer(intent ? { intent } : {})
  }

  const activeSub = subCols.find((c) => c.id === sub)

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
