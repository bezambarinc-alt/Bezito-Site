'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

type FlatItem = { href: string; label: string; exact?: boolean }
type GroupItem = { group: true; label: string; children: FlatItem[] }
type NavEntry  = FlatItem | GroupItem

const NAV: NavEntry[] = [
  { href: '/admin',            label: 'Overview',  exact: true },
  { href: '/admin/analytics',  label: 'Analytics'  },
  { href: '/admin/products',   label: 'Products'   },
  {
    group: true,
    label: 'Clients',
    children: [
      { href: '/admin/clients',              label: 'Users',     exact: true },
      { href: '/admin/pages?type=proposal',  label: 'Proposals'  },
      { href: '/admin/pages?type=showcase',  label: 'Pages'      },
      { href: '/admin/templates',            label: 'Templates'  },
      { href: '/admin/clients/requests',     label: 'Requests'   },
    ],
  },
  { href: '/admin/leads',       label: 'Leads'       },
  { href: '/admin/settings',    label: 'Settings'    },
  { href: '/admin/generations', label: 'Generations' },
]

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  const hrefPath = href.split('?')[0]               // strip query params
  if (exact) return currentPath === hrefPath
  return currentPath.startsWith(hrefPath)
}

export default function AdminNav() {
  const path = usePathname() ?? ''

  return (
    <nav className={styles.nav}>
      {NAV.map((item, i) => {
        if ('group' in item) {
          const anyActive = item.children.some(c => isActive(c.href, path, c.exact))
          return (
            <div key={i} className={styles.navGroup}>
              <span className={`${styles.navGroupLabel} ${anyActive ? styles.navGroupActive : ''}`}>
                {item.label}
              </span>
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
