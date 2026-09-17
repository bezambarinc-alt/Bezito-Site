'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import { getCategoryLabel } from '@/lib/data/categories'
import styles from './MenuOverlay.module.css'
import { parseProductName } from '@/lib/product-name'

// ── Types ──────────────────────────────────────────────────────────────────────

type NavEntry =
  | { kind: 'link';       label: string; href: string }
  | { kind: 'expand';     label: string; id: string }
  | { kind: 'expand-cat'; label: string; cat: string }
  | { kind: 'action';     label: string; target: 'concierge' | 'inquiry'; intent?: string }
  | { kind: 'soon';       label: string }
  | { kind: 'label';      text: string }
  | { kind: 'divider' }

interface SubCol { id: string; items: NavEntry[] }

const RING_SHAPES = [
  'Round', 'Oval', 'Emerald Cut', 'Radiant', 'Cushion',
  'Pear', 'Princess', 'Marquise', 'Asscher', 'Heart',
]

// ── Root items ─────────────────────────────────────────────────────────────────

const ROOT: NavEntry[] = [
  { kind: 'expand', label: 'On the Bench', id: 'jewelry' },
  { kind: 'expand', label: 'Presentations', id: 'presentations' },
  { kind: 'link',   label: 'Archive',      href: '/archive' },
  { kind: 'expand', label: 'Journal',      id: 'journal' },
  { kind: 'expand', label: 'Atelier',      id: 'atelier' },
  { kind: 'action', label: 'Service',      target: 'concierge' },
]

// ── MenuOverlay ────────────────────────────────────────────────────────────────

interface Props {
  categories?: string[]
  categoryProducts?: Record<string, { slug: string; name: string; stoneShape?: string | null }[]>
  collections?: string[]
}

export default function MenuOverlay({ categories = [], categoryProducts = {}, collections = [] }: Props) {
  const { active, close, openConcierge, openInquiryDrawer } = useDrawers()
  const open = active === 'menu'
  const [sub, setSub] = useState<string | null>(null)
  const [tertiary, setTertiary] = useState<string | null>(null)
  const [shape, setShape] = useState<string | null>(null)

  // Build the jewelry sub-column dynamically from Neon data.
  // Each category is now an expand-cat item — clicking it opens a product list.
  const jewelryItems: NavEntry[] = categories.map(cat => ({
    kind: 'expand-cat' as const,
    label: getCategoryLabel(cat),
    cat,
  }))

  const subCols: SubCol[] = [
    { id: 'jewelry', items: jewelryItems },
    {
      id: 'presentations',
      items: [
        { kind: 'link', label: 'The Elysian Band', href: '/presentations/elysian-band' },
      ],
    },
    {
      id: 'journal',
      items: [
        { kind: 'link', label: 'The Blog',  href: '/blog' },
        { kind: 'link', label: 'Instagram', href: '/journal' },
      ],
    },
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
    setTertiary(null)
    setShape(null)
    close()
  }

  function handleExpand(id: string) {
    if (sub === id) {
      setSub(null)
      setTertiary(null)
      setShape(null)
    } else {
      setSub(id)
      setTertiary(null)
      setShape(null)
    }
  }

  function handleBackFromSub() {
    setSub(null)
    setTertiary(null)
    setShape(null)
  }

  function handleExpandCat(cat: string) {
    setTertiary(tertiary === cat ? null : cat)
    setShape(null)
  }

  function handleAction(target: 'concierge' | 'inquiry', intent?: string) {
    handleClose()
    if (target === 'concierge') openConcierge()
    if (target === 'inquiry')   openInquiryDrawer(intent ? { intent } : {})
  }

  const activeSub = subCols.find((c) => c.id === sub)
  const tertiaryProducts = tertiary ? (categoryProducts[tertiary] ?? []) : []
  const shapedProducts = shape
    ? tertiaryProducts.filter(p => (p.stoneShape ?? '').toLowerCase() === shape.toLowerCase())
    : []

  const overlayClass = [
    styles.overlay,
    open      ? styles.open        : '',
    sub       ? styles.hasSub      : '',
    tertiary  ? styles.hasTertiary : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Backdrop scrim */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Slide-in nav */}
      <nav className={overlayClass} aria-hidden={!open} aria-label="Main menu">
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close menu">
          ×
        </button>
        <Link href="/" className={styles.logo} onClick={handleClose}>BEZ AMBAR</Link>

        {/* Column 1 — root */}
        <ul className={styles.col}>
          {ROOT.map((item, i) => {
            if (item.kind === 'expand') return (
              <li key={i}>
                <button
                  type="button"
                  className={`${styles.item} ${styles.itemExpand} ${sub === item.id ? styles.itemActive : ''}`}
                  onClick={() => handleExpand(item.id)}
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

        {/* Column 2 — sub */}
        {activeSub && (
          <ul className={styles.col}>
            <li className={styles.backItem}>
              <button type="button" className={styles.backBtn} onClick={handleBackFromSub}>
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
              if (item.kind === 'expand-cat') return (
                <li key={i}>
                  <button
                    type="button"
                    className={`${styles.item} ${styles.itemExpand} ${tertiary === item.cat ? styles.itemActive : ''}`}
                    onClick={() => handleExpandCat(item.cat)}
                  >
                    {item.label}
                  </button>
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

        {/* Column 3 — shapes (rings) or products (other categories) */}
        {tertiary && (
          <ul className={styles.col}>
            <li className={styles.backItem}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => {
                  if (tertiary === 'rings' && shape !== null) {
                    setShape(null)
                  } else {
                    setTertiary(null)
                  }
                }}
              >
                ← Back
              </button>
            </li>
            <li>
              <Link
                href={`/jewelry/${tertiary}`}
                onClick={handleClose}
                className={`${styles.item} ${styles.viewAll}`}
              >
                View All {getCategoryLabel(tertiary)}
              </Link>
            </li>
            <li className={styles.divider} aria-hidden />

            {tertiary === 'rings' && shape === null ? (
              // Shape selector
              RING_SHAPES.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={`${styles.item} ${styles.itemExpand}`}
                    onClick={() => setShape(s)}
                  >
                    {s}
                  </button>
                </li>
              ))
            ) : tertiary === 'rings' && shape !== null ? (
              // Rings filtered by shape
              shapedProducts.length > 0 ? (
                shapedProducts.map((p, i) => {
                  const { title, variant } = parseProductName(p.name)
                  return (
                    <li key={i}>
                      <Link
                        href={`/jewelry/${tertiary}/${p.slug}`}
                        onClick={handleClose}
                        className={styles.item}
                      >
                        {title}
                        {variant && <span className={styles.itemVariant}>{variant}</span>}
                      </Link>
                    </li>
                  )
                })
              ) : (
                <li className={styles.shapeItem}>No pieces found</li>
              )
            ) : (
              // Default: product list for all other categories
              tertiaryProducts.map((p, i) => {
                const { title, variant } = parseProductName(p.name)
                return (
                  <li key={i}>
                    <Link
                      href={`/jewelry/${tertiary}/${p.slug}`}
                      onClick={handleClose}
                      className={styles.item}
                    >
                      {title}
                      {variant && <span className={styles.itemVariant}>{variant}</span>}
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        )}
      </nav>
    </>
  )
}
