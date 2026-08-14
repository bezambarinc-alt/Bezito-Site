'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

// ── Types ───────────────────────────────────────────────────────────────────

type NavLink = { href: string; label: string; exact?: boolean }
type NavDivider = { divider: true }

type NavSection = {
  section: true
  label: string
  /** href makes the section header a link (same as navItem). */
  href: string
  children: NavLink[]
}

type NavEntry = NavLink | NavSection | NavDivider

// ── Navigation definition ────────────────────────────────────────────────────
//
// All top-level items are Links — section headers included.
// No collapse, no chevron. Every item in the sidebar is the same type of
// control and speaks the same visual language.

const NAV: NavEntry[] = [
  { href: '/admin',           label: 'Overview', exact: true },
  { href: '/admin/analytics', label: 'Analytics' },

  {
    section: true,
    label:   'Products',
    href:    '/admin/products',
    children: [
      { href: '/admin/products',               label: 'Catalog'   },
      { href: '/admin/templates?scope=product', label: 'Templates' },
    ],
  },

  {
    section: true,
    label:   'Clients',
    href:    '/admin/clients',
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

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  const hrefPath = href.split('?')[0]
  if (exact) return currentPath === hrefPath
  return currentPath.startsWith(hrefPath)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminNav() {
  const path = usePathname() ?? ''

  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      {NAV.map((item, i) => {

        // ── Section header + always-visible sub-items ────────────────────────
        if ('section' in item) {
          // Section header is active when any child is active
          const anyChildActive = item.children.some(c => isActive(c.href, path, c.exact))
          // Section header itself is also active if the path matches it exactly
          const headerActive = anyChildActive || isActive(item.href, path, true)

          return (
            <div key={item.label} className={styles.navSection}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${headerActive ? styles.navActive : ''}`}
              >
                {item.label}
              </Link>

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
          )
        }

        // ── Divider ──────────────────────────────────────────────────────────
        if ('divider' in item) {
          return <div key={i} className={styles.navDivider} aria-hidden />
        }

        // ── Flat link ────────────────────────────────────────────────────────
        return (
          <Link
            key={item.href}
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
