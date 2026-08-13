'use client'

import { useState } from 'react'
import styles from './templates.module.css'

interface TemplateMeta {
  id: string
  name: string
  description: string
  status: 'active' | 'draft'
}

interface Product {
  sku: string
  slug: string
  name: string
  category: string | null
}

interface Props {
  templateIds: string[]
  templates: TemplateMeta[]
  activeId: string
  products: Product[]
}

export default function TemplatesClient({ templates, activeId, products }: Props) {
  const [activating, setActivating] = useState<string | null>(null)
  const [activeNow, setActiveNow] = useState(activeId)
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.slug ?? '')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Build the preview URL for a template + product
  function previewUrl(templateId: string): string {
    const product = products.find(p => p.slug === selectedProduct)
    if (!product) return '#'
    const category = (product.category ?? 'jewelry').toLowerCase()
    const slug = encodeURIComponent(product.slug)
    const productPath = `/jewelry/${encodeURIComponent(category)}/${slug}`
    return `/api/draft?template=${templateId}&slug=${productPath}`
  }

  async function activate(id: string) {
    setMsg(null)
    setActivating(id)
    try {
      const res = await fetch('/api/admin/templates/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setActiveNow(id)
        setMsg({ text: `Template "${templates.find(t => t.id === id)?.name}" is now live ✓`, ok: true })
      } else {
        const d = await res.json()
        setMsg({ text: d.error || 'Failed to activate template', ok: false })
      }
    } finally {
      setActivating(null)
    }
  }

  return (
    <div>
      {/* Product picker for preview */}
      <div className={styles.previewBar}>
        <label className={styles.previewLabel}>Preview with product</label>
        <select
          className={styles.previewSelect}
          value={selectedProduct}
          onChange={e => setSelectedProduct(e.target.value)}
        >
          {products.map(p => (
            <option key={p.slug} value={p.slug}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>

      {msg && (
        <p className={`${styles.msg} ${msg.ok ? styles.msgOk : styles.msgErr}`}>{msg.text}</p>
      )}

      {/* Template cards */}
      <div className={styles.grid}>
        {templates.map(t => {
          const isActive = t.id === activeNow
          const isActivating = activating === t.id
          return (
            <div key={t.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardName}>{t.name}</div>
                  <div className={styles.cardDesc}>{t.description}</div>
                </div>
                <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeDraft}`}>
                  {isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              <div className={styles.cardActions}>
                {/* Preview — opens in new tab via Draft Mode */}
                <a
                  href={previewUrl(t.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.previewBtn}
                >
                  Preview →
                </a>

                {/* Set as default */}
                {!isActive && (
                  <button
                    onClick={() => activate(t.id)}
                    disabled={isActivating !== null}
                    className={styles.activateBtn}
                  >
                    {isActivating ? 'Activating…' : 'Set as Default'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.hint}>
        To add a new layout variant, tell Bezito what to change.
        It writes the TSX file, commits, and Vercel auto-deploys (~1 min).
        Then it appears here as a draft.
      </div>
    </div>
  )
}
