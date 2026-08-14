'use client'

import { useState } from 'react'
import styles from './templates.module.css'

interface TemplateMeta {
  id: string
  name: string
  description: string
  status: 'active' | 'draft'
  /** Page types this template is valid for — filters which cards show per tab. */
  scope: string[]
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

type ViewTab = 'product' | 'proposal' | 'showcase'

interface Props {
  templateIds: string[]
  templates: TemplateMeta[]
  activeIds: Record<ViewTab, string>   // active template per tab
  products: Product[]
  clientPages: ClientPage[]
}

export default function TemplatesClient({ templates, activeIds, products, clientPages }: Props) {
  const [tab, setTab]             = useState<ViewTab>('product')
  const [activeNow, setActiveNow] = useState(activeIds)
  const [activating, setActivating] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.slug ?? '')
  const [selectedPage, setSelectedPage]       = useState<string>(clientPages[0]?.slug ?? '')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  function previewUrl(templateId: string): string {
    if (tab === 'product') {
      const p = products.find(x => x.slug === selectedProduct)
      if (!p) return '#'
      const cat = (p.category ?? 'jewelry').toLowerCase()
      return `/api/draft?template=${templateId}&slug=/jewelry/${encodeURIComponent(cat)}/${encodeURIComponent(p.slug)}`
    }
    // proposal + showcase: use client preview bypass
    const slug = tab === 'showcase' ? selectedPage : (clientPages[0]?.slug ?? '')
    if (!slug) return '#'
    return `/preview/${encodeURIComponent(slug)}?tpl=${encodeURIComponent(templateId)}`
  }

  async function activate(templateId: string) {
    setMsg(null)
    setActivating(templateId)
    try {
      const res = await fetch('/api/admin/templates/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: templateId, scope: tab }),
      })
      if (res.ok) {
        setActiveNow(prev => ({ ...prev, [tab]: templateId }))
        setMsg({ text: `"${templates.find(t => t.id === templateId)?.name}" set as ${tab} default ✓`, ok: true })
      } else {
        const d = await res.json()
        setMsg({ text: d.error ?? 'Failed to activate', ok: false })
      }
    } finally {
      setActivating(null)
    }
  }

  const tabLabels: Record<ViewTab, string> = {
    product:  'Product pages',
    proposal: 'Proposals',
    showcase: 'Client showcase',
  }

  const currentActive = activeNow[tab]

  return (
    <div>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {(['product', 'proposal', 'showcase'] as ViewTab[]).map(t => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => { setTab(t); setMsg(null) }}
          >
            {tabLabels[t]}
            {activeNow[t] && (
              <span className={styles.tabMeta}>
                {templates.find(x => x.id === activeNow[t])?.name ?? activeNow[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Preview bar */}
      <div className={styles.previewBar}>
        <label className={styles.previewLabel}>Preview with</label>

        {tab === 'product' && (
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

        {tab === 'showcase' && (
          clientPages.length > 0 ? (
            <select
              className={styles.previewSelect}
              value={selectedPage}
              onChange={e => setSelectedPage(e.target.value)}
            >
              {clientPages.map(p => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          ) : (
            <span className={styles.previewEmpty}>No live showcase pages yet</span>
          )
        )}

        {tab === 'proposal' && (
          <span className={styles.previewEmpty}>Proposals are sent directly — no public preview URL. Assign a template per-page in the Pages panel.</span>
        )}
      </div>

      {msg && (
        <p className={`${styles.msg} ${msg.ok ? styles.msgOk : styles.msgErr}`}>{msg.text}</p>
      )}

      {/* Template cards — only those valid for the current tab scope */}
      <div className={styles.grid}>
        {templates.filter(t => t.scope.includes(tab)).map(t => {
          const isActive     = t.id === currentActive
          const isActivating = activating === t.id
          const canPreview   = tab !== 'proposal'

          return (
            <div key={t.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardName}>{t.name}</div>
                  <div className={styles.cardDesc}>{t.description}</div>
                </div>
                <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeDraft}`}>
                  {isActive ? `${tabLabels[tab]} default` : 'Not active'}
                </span>
              </div>

              <div className={styles.cardActions}>
                {canPreview && (
                  <a
                    href={previewUrl(t.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.previewBtn}
                  >
                    Preview →
                  </a>
                )}

                {!isActive && (
                  <button
                    onClick={() => activate(t.id)}
                    disabled={!!activating}
                    className={styles.activateBtn}
                  >
                    {isActivating ? 'Activating…' : `Set as ${tabLabels[tab]} default`}
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
