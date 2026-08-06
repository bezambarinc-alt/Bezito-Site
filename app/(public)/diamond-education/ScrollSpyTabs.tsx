'use client'

/**
 * ScrollSpyTabs — sticky tab bar that highlights the active section
 * as the user scrolls through the Diamond Education page.
 *
 * Uses react-intersection-observer's `useInView` per section (cleaner
 * than a raw IntersectionObserver loop). Content remains RSC/server-rendered.
 *
 * Pattern: each tab is an anchor link (<a href="#section-id">).
 * Clicking scrolls to the section. Scrolling through sections
 * updates the active tab via IntersectionObserver.
 */

import { useState, useEffect } from 'react'
import styles from './page.module.css'

const TABS = [
  { id: 'four-cs',  label: 'The 4Cs'  },
  { id: 'cut',      label: 'Cut'       },
  { id: 'color',    label: 'Color'     },
  { id: 'clarity',  label: 'Clarity'   },
  { id: 'carat',    label: 'Carat'     },
  { id: 'shapes',   label: 'Shapes'    },
  { id: 'anatomy',  label: 'Anatomy'   },
]

export default function ScrollSpyTabs() {
  const [active, setActive] = useState(TABS[0].id)
  // Flag to suppress observer during programmatic scrolls
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling) return

        // Pick the section with the highest intersection ratio in the band
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      {
        // Centered viewport band — only the section currently being read
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      }
    )

    TABS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [scrolling])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    setActive(id)
    setScrolling(true)

    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Re-enable observer after scroll settles (~800ms)
      setTimeout(() => setScrolling(false), 800)
    }
  }

  return (
    <nav
      className={styles.tabBar}
      aria-label="Diamond education sections"
    >
      <div className={styles.tabBarInner}>
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`${styles.tab} ${active === id ? styles.tabActive : ''}`}
            aria-current={active === id ? 'location' : undefined}
            onClick={(e) => handleClick(e, id)}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
