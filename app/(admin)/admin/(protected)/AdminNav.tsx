'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

// ── Types ───────────────────────────────────────────────────────────────────

type NavLink    = { href: string; label: string; exact?: boolean }
type NavDivider = { divider: true }
type NavSection = { section: true; key: string; label: string; defaultOpen?: boolean; children: NavLink[] }
type NavEntry   = NavLink | NavSection | NavDivider

// ── Nav definition ───────────────────────────────────────────────────────────

const NAV: NavEntry[] = [
  { href: '/admin',           label: 'Overview', exact: true },
  { href: '/admin/analytics', label: 'Analytics' },

  {
    section: true, key: 'products', label: 'Products', defaultOpen: true,
    children: [
      { href: '/admin/products',               label: 'Catalog'   },
      { href: '/admin/templates?scope=product', label: 'Templates' },
    ],
  },

  {
    section: true, key: 'clients', label: 'Clients', defaultOpen: true,
    children: [
      { href: '/admin/clients',                label: 'Users',     exact: true },
      { href: '/admin/pages?type=proposal',    label: 'Proposals'  },
      { href: '/admin/pages?type=showcase',    label: 'Pages'      },
      { href: '/admin/templates?scope=client', label: 'Templates'  },
      { href: '/admin/clients/requests',       label: 'Requests'   },
    ],
  },

  { divider: true },
  { href: '/admin/leads',    label: 'Leads'    },
  { href: '/admin/settings', label: 'Settings' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function isActive(href: string, path: string, exact?: boolean): boolean {
  const base = href.split('?')[0]
  return exact ? path === base : path.startsWith(base)
}

// Small chevron — inherits currentColor so it reads as part of the label text.
// Opacity is kept low so it doesn't call more attention than the text itself.
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="8" height="8" viewBox="0 0 10 10"
      fill="none" aria-hidden
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    >
      <path d="M3 2.5L5.5 5 3 7.5" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminNav() {
  const path = usePathname() ?? ''

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV.filter((x): x is NavSection => 'section' in x)
         .map(x => [x.key, x.defaultOpen ?? true])
    )
  )

  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      {NAV.map((item, i) => {

        if ('section' in item) {
          const isOpen    = open[item.key] ?? true
          const anyActive = item.children.some(c => isActive(c.href, path, c.exact))
          return (
            <div key={item.key} className={styles.navSection}>
              {/* Section toggle — styled identically to navItem.
                  Chevron is the only indicator of collapsibility. */}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(o => ({ ...o, [item.key]: !o[item.key] }))}
                className={`${styles.navSectionHeader} ${anyActive ? styles.navActive : ''}`}
              >
                {item.label}
                <Chevron open={isOpen} />
              </button>
              <div className={`${styles.navSectionBody} ${isOpen ? styles.navSectionBodyOpen : ''}`}>
                {item.children.map(child => (
                  <Link key={child.href} href={child.href}
                    className={`${styles.navSub} ${isActive(child.href, path, child.exact) ? styles.navActive : ''}`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        }

        if ('divider' in item) {
          return <div key={i} className={styles.navDivider} aria-hidden />
        }

        return (
          <Link key={item.href} href={item.href}
            className={`${styles.navItem} ${isActive(item.href, path, item.exact) ? styles.navActive : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
