'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

const NAV = [
  { href: '/admin',             label: 'Overview'     },
  { href: '/admin/products',    label: 'Products'     },
  { href: '/admin/leads',       label: 'Leads'        },
  { href: '/admin/generations', label: 'Generations'  },
  { href: '/admin/settings',    label: 'Settings'     },
]

export default function AdminNav() {
  const path = usePathname()
  return (
    <nav className={styles.nav}>
      {NAV.map(({ href, label }) => {
        const active = href === '/admin' ? path === '/admin' : (path ?? '').startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${active ? styles.navActive : ''}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
