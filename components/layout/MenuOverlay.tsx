'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './MenuOverlay.module.css'

// ── Nav data ──────────────────────────────────────────────────────────────────

type NavItem =
  | { kind: 'link';   label: string; href: string; external?: true }
  | { kind: 'expand'; label: string; id: string }
  | { kind: 'soon';   label: string }

interface SubCol    { id: string; items: NavItem[] }
interface SubSubCol { id: string; items: NavItem[] }

const ROOT: NavItem[] = [
  { kind: 'expand', label: 'Collection',       id: 'collection' },
  { kind: 'expand', label: 'Manufacture',      id: 'manufacture' },
  { kind: 'expand', label: 'Service',          id: 'service' },
  { kind: 'expand', label: 'Editorial',        id: 'editorial' },
  { kind: 'expand', label: 'Resources',        id: 'resources' },
  { kind: 'expand', label: 'Signature Pieces', id: 'signature' },
]

const SUB_COLS: SubCol[] = [
  {
    id: 'collection',
    items: [
      { kind: 'expand', label: 'Bloom Collection',  id: 'bloom' },
      { kind: 'expand', label: 'Rings',             id: 'rings' },
      { kind: 'expand', label: 'Engagement Rings',  id: 'engagement-rings' },
      { kind: 'expand', label: 'Wedding Bands',     id: 'wedding-bands' },
      { kind: 'expand', label: 'Earrings',          id: 'earrings' },
      { kind: 'expand', label: 'Pendants',          id: 'pendants' },
      { kind: 'expand', label: 'Necklaces',         id: 'necklaces' },
      { kind: 'expand', label: 'Bracelets',         id: 'bracelets' },
    ],
  },
  {
    id: 'manufacture',
    items: [
      { kind: 'link', label: 'The Inventor',        href: '/about-bez-ambar' },
      { kind: 'link', label: 'The Bez Ambar Story', href: '/the-story' },
      { kind: 'link', label: 'Our Story',           href: '/our-story' },
      { kind: 'link', label: 'Press',               href: '/press' },
    ],
  },
  {
    id: 'service',
    items: [
      { kind: 'link', label: 'Contact',            href: '/contact' },
      { kind: 'link', label: 'Bespoke Inquiry',    href: '/contact?type=bespoke' },
      { kind: 'link', label: 'Repairs & Cleaning', href: '/contact?type=repairs' },
      { kind: 'link', label: 'Warranty',           href: '/warranty' },
    ],
  },
  {
    id: 'editorial',
    items: [
      { kind: 'link', label: 'Journal',           href: '/journal' },
      { kind: 'link', label: 'Diamond Education', href: '/diamond-education' },
      { kind: 'link', label: 'Video Gallery',     href: '/video-gallery' },
    ],
  },
  {
    id: 'resources',
    items: [
      { kind: 'link', label: 'Ring Size Chart', href: '/ring-size-chart' },
      { kind: 'link', label: 'Catalogs',        href: '/catalogs' },
    ],
  },
  {
    id: 'signature',
    items: [
      { kind: 'link', label: '30-Carat Flex',    href: 'https://bezito.co/page/30-carat-flex',    external: true },
      { kind: 'link', label: 'Flex Bracelets',   href: 'https://bezito.co/page/flex-bracelets',   external: true },
      { kind: 'link', label: 'Elysian Cut',      href: 'https://bezito.co/page/elysian-cut',      external: true },
      { kind: 'link', label: 'Cascata',          href: 'https://bezito.co/page/cascata',          external: true },
      { kind: 'link', label: 'Crossover Ashoka', href: 'https://bezito.co/page/crossover-ashoka', external: true },
      { kind: 'link', label: 'Heart Ruby',       href: 'https://bezito.co/page/heart-ruby-v2',    external: true },
      { kind: 'link', label: 'Saul Ring',        href: 'https://bezito.co/page/saul-ring',        external: true },
    ],
  },
]

const SUB_SUB_COLS: SubSubCol[] = [
  {
    id: 'bloom',
    items: [
      { kind: 'link', label: 'The Calla · ref. C0728', href: '/calla' },
      { kind: 'link', label: 'Camélia · ref. B9792',   href: '/camelia' },
    ],
  },
  {
    id: 'rings',
    items: [
      { kind: 'link', label: 'Fancy Yellow Three-Stone · ref. C0536',   href: '/fancy-yellow-three-stone' },
      { kind: 'link', label: 'Fancy Deep Brownish Yellow · ref. 1C36',  href: '/fancy-deep-brownish-yellow-cushion' },
      { kind: 'link', label: 'Fancy Very Pink Oval · ref. C0747',       href: '/fancy-very-pink-oval' },
    ],
  },
  { id: 'engagement-rings', items: [{ kind: 'soon', label: 'In production' }] },
  { id: 'wedding-bands',    items: [{ kind: 'soon', label: 'In production' }] },
  { id: 'earrings',         items: [{ kind: 'soon', label: 'In production' }] },
  { id: 'pendants',         items: [{ kind: 'soon', label: 'In production' }] },
  {
    id: 'necklaces',
    items: [
      { kind: 'link', label: 'The Single Row · ref. IN100',           href: '/single-row' },
      { kind: 'link', label: 'The Baguette Line · ref. IN101',        href: '/baguette-line' },
      { kind: 'link', label: 'The Pear Shaped Necklace · ref. C0508', href: '/pear-shaped-necklace' },
    ],
  },
  {
    id: 'bracelets',
    items: [
      { kind: 'link', label: 'The Double Row Asscher · ref. 5FLX33ASCH2', href: '/double-row-asscher-flex' },
      { kind: 'link', label: 'Emerald Cut Stretch · ref. 5FLX40ECNS',     href: '/emerald-cut-stretch-bracelet' },
      { kind: 'link', label: 'Single Row Asscher · ref. 5FLX33ASC',       href: '/single-row-asscher-cut' },
      { kind: 'link', label: 'Blue Sapphire Flex · ref. 5FLX30R',         href: '/blue-sapphire-single-row-flex' },
    ],
  },
]

// ── Item renderer ─────────────────────────────────────────────────────────────

function NavItemRow({
  item,
  isActive,
  onClick,
  onClose,
}: {
  item: NavItem
  isActive?: boolean
  onClick?: () => void
  onClose: () => void
}) {
  if (item.kind === 'link') {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={`${styles.item} ${item.external ? styles.external : ''}`}
      >
        {item.label}
      </Link>
    )
  }
  if (item.kind === 'expand') {
    return (
      <button
        type="button"
        className={`${styles.item} ${styles.hasSub} ${isActive ? styles.active : ''}`}
        onClick={onClick}
      >
        {item.label}
      </button>
    )
  }
  return <span className={`${styles.item} ${styles.soon}`}>{item.label}</span>
}

// ── MenuOverlay ───────────────────────────────────────────────────────────────

export default function MenuOverlay() {
  const { active, close } = useDrawers()
  const open = active === 'menu'

  const [level1, setLevel1] = useState<string | null>(null)
  const [level2, setLevel2] = useState<string | null>(null)

  function handleClose() {
    setLevel1(null)
    setLevel2(null)
    close()
  }

  function selectLevel1(id: string) {
    if (level1 === id) return
    setLevel1(id)
    setLevel2(null)
  }

  const overlayClass = [
    styles.overlay,
    open   ? styles.open      : '',
    level1 ? styles.hasSub    : '',
    level2 ? styles.hasSubSub : '',
  ].filter(Boolean).join(' ')

  const activeSub    = SUB_COLS.find((c) => c.id === level1)
  const activeSubSub = SUB_SUB_COLS.find((c) => c.id === level2)

  return (
    <>
      {/* Dark scrim — Astro .menu-backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Left drawer — Astro .menu-overlay */}
      <nav className={overlayClass} aria-hidden={!open} aria-label="Main menu">
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close menu">
          ×
        </button>
        <div className={styles.logo}>BEZ AMBAR</div>

        {/* Column 1 — root */}
        <ul className={styles.col}>
          <li>
            <Link href="/" onClick={handleClose} className={`${styles.item} ${styles.homeItem}`}>
              Home
            </Link>
          </li>
          {ROOT.map((item) =>
            item.kind === 'expand' ? (
              <li key={item.id}>
                <NavItemRow
                  item={item}
                  isActive={level1 === item.id}
                  onClick={() => selectLevel1(item.id)}
                  onClose={handleClose}
                />
              </li>
            ) : null,
          )}
        </ul>

        {/* Column 2 — sub (shown when level1 is set) */}
        {activeSub && (
          <ul className={styles.col}>
            {activeSub.items.map((item, i) => (
              <li key={item.kind === 'expand' ? item.id : i}>
                <NavItemRow
                  item={item}
                  isActive={item.kind === 'expand' && level2 === item.id}
                  onClick={item.kind === 'expand' ? () => setLevel2(item.id) : undefined}
                  onClose={handleClose}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Column 3 — sub-sub (shown when level2 is set) */}
        {activeSubSub && (
          <ul className={styles.col}>
            {activeSubSub.items.map((item, i) => (
              <li key={i}>
                <NavItemRow item={item} onClose={handleClose} />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  )
}
