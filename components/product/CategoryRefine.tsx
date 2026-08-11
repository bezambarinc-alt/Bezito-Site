'use client'

/**
 * CategoryRefine — editorial metal refinement for category pages.
 *
 * Design reference: Patek Philippe / Van Cleef — horizontal typographic
 * selectors, no checkboxes, no price, no counts. A thin gold line marks
 * the active refinement. Multi-metal pieces ("18K white gold or platinum")
 * appear only under All — keeps each filtered view pure.
 */

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import styles from './CategoryRefine.module.css'
import type { Product } from '@/types/products'

interface Props {
  products: Product[]
  category: string
}

/** Normalize raw metal string to a single display label, or null for multi-metal */
function normalizeMetal(raw: string): string | null {
  if (!raw) return null
  const s = raw.toLowerCase().trim()

  // Multi-metal → only shown under All
  if (s.includes(' or ') || s.includes(',') || s.includes(' and ') || s.includes('·')) return null

  if (s.includes('yellow') || s === '18k gold' || s === 'gold') return 'Yellow Gold'
  if (s.includes('rose'))    return 'Rose Gold'
  if (s.includes('white gold')) return 'White Gold'
  if (s.includes('platinum')) return 'Platinum'
  if (s.includes('to be confirmed')) return null

  return null
}

const METAL_ORDER = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum']

export default function CategoryRefine({ products, category }: Props) {
  const [active, setActive] = useState<string | null>(null)

  // Derive metals present in this category — only show filter when >1 option exists
  const metals = useMemo(() => {
    const seen = new Set<string>()
    for (const p of products) {
      const m = normalizeMetal(p.specs.metal ?? '')
      if (m) seen.add(m)
    }
    return METAL_ORDER.filter((m) => seen.has(m))
  }, [products])

  const showFilter = metals.length > 1

  const filtered = useMemo(() => {
    if (!active) return products
    return products.filter((p) => normalizeMetal(p.specs.metal ?? '') === active)
  }, [products, active])

  return (
    <>
      {showFilter && (
        <div className={styles.bar}>
          <nav className={styles.pills} aria-label="Refine by metal">
            <button
              className={`${styles.pill} ${!active ? styles.pillActive : ''}`}
              onClick={() => setActive(null)}
            >
              All
            </button>
            {metals.map((m) => (
              <button
                key={m}
                className={`${styles.pill} ${active === m ? styles.pillActive : ''}`}
                onClick={() => setActive(active === m ? null : m)}
              >
                {m}
              </button>
            ))}
          </nav>
        </div>
      )}

      <section className="ba-product-grid">
        {filtered.map((p, i) => (
          <div
            key={p.sku}
            className={styles.card}
            style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
          >
            <ProductCard product={p} category={category} />
          </div>
        ))}

        {filtered.length === 0 && active && (
          <p className={styles.empty}>
            No pieces in {active} — <button onClick={() => setActive(null)} className={styles.emptyReset}>view all</button>
          </p>
        )}
      </section>
    </>
  )
}
