import type { MetadataRoute } from 'next'
import { sql } from '@/lib/db'
import { RETAILERS } from '@/lib/data/retailers'

/**
 * Dynamic sitemap — generated at build time with 24h ISR refresh.
 * Pulls products + blog posts from Neon; retailers from static data;
 * everything else is hardcoded. Degrades gracefully if DB is down.
 */
export const revalidate = 86400 // 24 hours

const BASE = 'https://bezambar.com'

type Freq = MetadataRoute.Sitemap[number]['changeFrequency']

const STATIC_ROUTES: Array<{ path: string; priority: number; freq: Freq }> = [
  { path: '/',                      priority: 1.0, freq: 'weekly'  },
  { path: '/about-bez-ambar',       priority: 0.8, freq: 'monthly' },
  { path: '/elysian-cut',           priority: 0.8, freq: 'monthly' },
  { path: '/collection/bloom',      priority: 0.85, freq: 'weekly' },
  { path: '/archive',               priority: 0.75, freq: 'monthly' },
  { path: '/journal',               priority: 0.7, freq: 'weekly'  },
  { path: '/blog',                  priority: 0.7, freq: 'weekly'  },
  { path: '/contact',               priority: 0.7, freq: 'yearly'  },
  { path: '/diamond-education',     priority: 0.7, freq: 'monthly' },
  { path: '/jewelry/rings',         priority: 0.8, freq: 'weekly'  },
  { path: '/jewelry/engagement-rings', priority: 0.8, freq: 'weekly' },
  { path: '/jewelry/wedding-bands', priority: 0.75, freq: 'weekly' },
  { path: '/jewelry/bracelets',     priority: 0.75, freq: 'weekly' },
  { path: '/jewelry/earrings',      priority: 0.75, freq: 'weekly' },
  { path: '/jewelry/necklaces',     priority: 0.75, freq: 'weekly' },
  { path: '/jewelry/pendants',      priority: 0.7, freq: 'weekly'  },
  { path: '/the-story',             priority: 0.6, freq: 'yearly'  },
  { path: '/ring-size-chart',       priority: 0.6, freq: 'yearly'  },
  { path: '/warranty',              priority: 0.4, freq: 'yearly'  },
  { path: '/privacy-policy',        priority: 0.3, freq: 'yearly'  },
  { path: '/terms',                 priority: 0.3, freq: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static routes ────────────────────────────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }))

  // ── Retailers (SSG, from constants) ─────────────────────────────────────
  const retailerEntries: MetadataRoute.Sitemap = RETAILERS.map((r) => ({
    url: `${BASE}/retailers/${r.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as Freq,
    priority: 0.6,
  }))

  // ── Products (Neon DB) ───────────────────────────────────────────────────
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const rows = await sql<{ sku: string; category: string | null; synced_at: string | null }>(
      `SELECT sku, category, synced_at
         FROM products
        WHERE active = true
        ORDER BY sort_order ASC, name ASC`,
    )
    productEntries = rows.map((r) => ({
      url: `${BASE}/jewelry/${(r.category ?? 'jewelry').toLowerCase()}/${r.sku}`,
      lastModified: r.synced_at ? new Date(r.synced_at) : now,
      changeFrequency: 'weekly' as Freq,
      priority: 0.7,
    }))
  } catch {
    // DB unavailable at build time — skip, static routes still ship
  }

  // ── Blog posts (Neon DB) ─────────────────────────────────────────────────
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const rows = await sql<{ slug: string; updated_date: string | null; date: string | null }>(
      `SELECT slug, updated_date, date
         FROM blog_posts
        WHERE published = true
        ORDER BY date DESC`,
    )
    blogEntries = rows.map((r) => ({
      url: `${BASE}/blog/${r.slug}`,
      lastModified: r.updated_date
        ? new Date(r.updated_date)
        : r.date
        ? new Date(r.date)
        : now,
      changeFrequency: 'monthly' as Freq,
      priority: 0.6,
    }))
  } catch {
    // blog_posts table may not exist yet
  }

  return [...staticEntries, ...retailerEntries, ...productEntries, ...blogEntries]
}
