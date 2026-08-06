'use client'

/**
 * StoryNav — sticky left-hand year navigation.
 * Matches Astro's .story-year-nav behavior:
 *   - Lists all chapter years
 *   - Highlights the active year as user scrolls (IntersectionObserver on [data-year] elements)
 *   - Click scrolls smoothly to that chapter
 *
 * Uses native IntersectionObserver directly (no extra dep needed here).
 * react-intersection-observer is used in ScrollSpyTabs where the hook form is more ergonomic.
 */

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface StoryNavProps {
  years: string[]
}

export default function StoryNav({ years }: StoryNavProps) {
  const [active, setActive] = useState(years[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the chapter that's most visible in the middle band of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          const year = visible[0].target.getAttribute('data-year')
          if (year) setActive(year)
        }
      },
      {
        // Centered band — only counts sections that cross through the middle 40% of viewport
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      }
    )

    years.forEach((year) => {
      const el = document.getElementById(`year-${year}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [years])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, year: string) {
    e.preventDefault()
    const el = document.getElementById(`year-${year}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className={styles.yearNav} aria-label="Jump to year in timeline">
      <div className={styles.navTitle}>Timeline</div>
      <ol className={styles.navList} role="list">
        {years.map((year) => (
          <li key={year}>
            <a
              href={`#year-${year}`}
              className={`${styles.navItem} ${active === year ? styles.navActive : ''}`}
              aria-current={active === year ? 'location' : undefined}
              onClick={(e) => handleClick(e, year)}
            >
              {year}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
