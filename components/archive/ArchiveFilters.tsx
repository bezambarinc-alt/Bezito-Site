'use client'

import { useState } from 'react'
import styles from './ArchiveFilters.module.css'

const SHAPES = ['Round', 'Princess', 'Emerald', 'Cushion', 'Pear', 'Oval', 'Asscher']
const TYPES = ['Rings', 'Bracelets', 'Necklaces', 'Earrings']

/** Filter panel for the archive. Client-side selection state; wiring to the
 * grid query is a later milestone (URL params + DB filter). */
export default function ArchiveFilters() {
  const [active, setActive] = useState<Set<string>>(new Set())

  function toggle(tag: string) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  return (
    <aside className={styles.panel} aria-label="Archive filters">
      <FilterGroup title="Shape" tags={SHAPES} active={active} onToggle={toggle} />
      <FilterGroup title="Type" tags={TYPES} active={active} onToggle={toggle} />
    </aside>
  )
}

function FilterGroup({
  title,
  tags,
  active,
  onToggle,
}: {
  title: string
  tags: string[]
  active: Set<string>
  onToggle: (tag: string) => void
}) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className={styles.tags}>
        {tags.map((t) => (
          <li key={t}>
            <button
              className={`${styles.tag} ${active.has(t) ? styles.on : ''}`}
              aria-pressed={active.has(t)}
              onClick={() => onToggle(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
