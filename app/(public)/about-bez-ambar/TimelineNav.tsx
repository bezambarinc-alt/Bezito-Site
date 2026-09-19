'use client'

/**
 * TimelineNav — sticky left-hand year navigation for the About timeline
 * (About page copy of the-story's StoryNav, pointing at About's CSS module).
 *   - Lists all chapter years
 *   - Highlights the active year on scroll (IntersectionObserver on #year-<year>)
 *   - Click scrolls smoothly to that chapter
 */

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface TimelineNavProps {
  years: string[]
}

export default function TimelineNav({ years }: TimelineNavProps) {
  const [active, setActive] = useState(years[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          const year = visible[0].target.getAttribute('data-year')
          if (year) setActive(year)
        }
      },
      {
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
