'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

// ── Types ───────────────────────────────────────────────────────────────────

type NavLink = { href: string; label: string; exact?: boolean }

type NavSection = {
  section: true
  key: string
  label: string
  defaultOpen?: boolean
  children: NavLink[]
}

type NavEntry = NavLink | NavSection

// ── Navigation definition ────────────────────────────────────────────────────
//
// Two collapsible sections — Products and Clients.
// Templates is scoped: ?scope=product shows only product layouts,
// ?scope=client shows only proposal + client showcase layouts.
// Sections are independent — each has its own open/closed state.

const NAV: NavEntry[] = [
  { href: '/admin',           label: 'Overview', exact: true },
  { href: '/admin/analytics', label: 'Analytics' },

  {
    section: true,
    key: 'products',
    label: 'Products',
    defaultOpen: true,
    children: [
      { href: '/admin/products',              label: 'Catalog'    },
      { href: '/admin/templates?scope=product', label: 'Templates'  },
    ],
  },

  {
    section: true,
    key: 'clients',
    label: 'Clients',
    defaultOpen: true,
    children: [
      { href: '/admin/clients',                label: 'Users',     exact: true },
      { href: '/admin/pages?type=proposal',    label: 'Proposals'  },
      { href: '/admin/pages?type=showcase',    label: 'Pages'      },
      { href: '/admin/templates?scope=client', label: 'Templates'  },
      { href: '/admin/clients/requests',       label: 'Requests'   },
    ],
  },

  { href: '/admin/leads',    label: 'Leads'    },
  { href: '/admin/settings', label: 'Settings' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  const hrefPath = href.split('?')[0]
  if (exact) return currentPath === hrefPath
  return currentPath.startsWith(hrefPath)
}

// ── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    >
      <path
        d="M3 2.5L5.5 5 3 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminNav() {
  const path = usePathname() ?? ''

  // Track open/closed state for each collapsible section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    NAV.forEach(item => {
      if ('section' in item) defaults[item.key] = item.defaultOpen ?? true
    })
    return defaults
  })

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      {NAV.map((item, i) => {
        // ── Collapsible section ──────────────────────────────────────────────
        if ('section' in item) {
          const isOpen    = openSections[item.key] ?? true
          const anyActive = item.children.some(c => isActive(c.href, path, c.exact))

          return (
            <div key={item.key} className={styles.navSection}>
              <button
                className={`${styles.navSectionHeader} ${anyActive ? styles.navSectionActive : ''}`}
                onClick={() => toggleSection(item.key)}
                aria-expanded={isOpen}
                aria-controls={`nav-section-${item.key}`}
                type="button"
              >
                <span className={styles.navSectionLabel}>{item.label}</span>
                <Chevron open={isOpen} />
              </button>

              <div
                id={`nav-section-${item.key}`}
                className={`${styles.navSectionBody} ${isOpen ? styles.navSectionBodyOpen : ''}`}
              >
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`${styles.navSub} ${isActive(child.href, path, child.exact) ? styles.navActive : ''}`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        }

        // ── Flat link ────────────────────────────────────────────────────────
        return (
          <Link
            key={i}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href, path, item.exact) ? styles.navActive : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
