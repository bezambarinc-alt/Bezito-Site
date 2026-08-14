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

interface ClientPage {
  slug: string
  title: string
}

interface Props {
  templateIds: string[]
  templates: TemplateMeta[]
  activeId: string
  products: Product[]
  clientPages: ClientPage[]
}

export default function TemplatesClient({ templates, activeId, products, clientPages }: Props) {
  const [activating, setActivating] = useState<string | null>(null)
  const [activeNow, setActiveNow] = useState(activeId)
  const [selectedProduct, setSelectedProduct]   = useState<string>(products[0]?.slug ?? '')
  const [selectedClientPage, setClientPage]     = useState<string>(clientPages[0]?.slug ?? '')
  const [previewMode, setPreviewMode]           = useState<'product' | 'client'>('product')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Build the preview URL for a template + product (Draft Mode)
  function productPreviewUrl(templateId: string): string {
    const product = products.find(p => p.slug === selectedProduct)
    if (!product) return '#'
    const category = (product.category ?? 'jewelry').toLowerCase()
    const slug = encodeURIComponent(product.slug)
    return `/api/draft?template=${templateId}&slug=/jewelry/${encodeURIComponent(category)}/${slug}`
  }

  // Build the preview URL for a client showcase page (admin bypass via ?tpl=)
  function clientPreviewUrl(templateId: string): string {
    if (!selectedClientPage) return '#'
    return `/preview/${encodeURIComponent(selectedClientPage)}?tpl=${encodeURIComponent(templateId)}`
  }

  function previewUrl(templateId: string): string {
    return previewMode === 'client' ? clientPreviewUrl(templateId) : productPreviewUrl(templateId)
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
      {/* Preview bar — toggle between product + client page */}
      <div className={styles.previewBar}>
        <label className={styles.previewLabel}>Preview with</label>
        <div className={styles.previewToggle}>
          <button
            className={`${styles.previewToggleBtn} ${previewMode === 'product' ? styles.previewToggleActive : ''}`}
            onClick={() => setPreviewMode('product')}
          >Product</button>
          <button
            className={`${styles.previewToggleBtn} ${previewMode === 'client' ? styles.previewToggleActive : ''}`}
            onClick={() => setPreviewMode('client')}
            disabled={clientPages.length === 0}
            title={clientPages.length === 0 ? 'No live showcase pages yet' : undefined}
          >Client page</button>
        </div>

        {previewMode === 'product' && (
          <select
            className={styles.previewSelect}
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
          >
            {products.map(p => (
              <option key={p.slug} value={p.slug}>{p.name} ({p.sku})</option>
            ))}
          </select>
        )}

        {previewMode === 'client' && (
          <select
            className={styles.previewSelect}
            value={selectedClientPage}
            onChange={e => setClientPage(e.target.value)}
          >
            {clientPages.map(p => (
              <option key={p.slug} value={p.slug}>{p.title} ({p.slug})</option>
            ))}
          </select>
        )}
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
