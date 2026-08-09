import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * TEMP import route — upserts a batch of blog posts into blog_posts.
 * POST { posts: BlogImportRow[] }  (protected by a shared secret header)
 * DELETE this route after the blog content is fully migrated.
 *
 * Media (hero_image / hero_video) are Cloudinary URL strings only.
 */
export const dynamic = 'force-dynamic'

interface BlogImportRow {
  slug: string
  title: string
  date: string
  updatedDate?: string | null
  category: string
  excerpt: string
  heroImage?: string | null
  heroVideo?: string | null
  heroImageAlt?: string | null
  author?: string
  status?: string
  schemaType?: string | null
  schemaFaq?: boolean
  body: string
  displayOrder?: number
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-import-secret')
  if (!secret || secret !== process.env.BEZITO_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { posts } = (await req.json()) as { posts: BlogImportRow[] }
  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: 'no posts' }, { status: 400 })
  }

  const results: { slug: string; ok: boolean; error?: string }[] = []
  for (const p of posts) {
    try {
      if (!p.slug || !p.title || !p.date || !p.category || !p.excerpt || !p.body) {
        throw new Error('missing required field (slug/title/date/category/excerpt/body)')
      }
      if (p.heroImage && !p.heroImageAlt) {
        throw new Error('heroImage requires heroImageAlt')
      }
      if (!p.heroImage && !p.heroVideo) {
        throw new Error('post must have heroImage or heroVideo')
      }
      await sql(
        `INSERT INTO blog_posts
           (slug, title, date, updated_date, category, excerpt,
            hero_image, hero_video, hero_image_alt, author, status,
            schema_type, schema_faq, body, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now())
         ON CONFLICT (slug) DO UPDATE SET
           title=$2, date=$3, updated_date=$4, category=$5, excerpt=$6,
           hero_image=$7, hero_video=$8, hero_image_alt=$9, author=$10, status=$11,
           schema_type=$12, schema_faq=$13, body=$14, display_order=$15, updated_at=now()`,
        [
          p.slug, p.title, p.date, p.updatedDate ?? null, p.category, p.excerpt,
          p.heroImage ?? null, p.heroVideo ?? null, p.heroImageAlt ?? null,
          p.author ?? 'Bez Ambar', p.status ?? 'live',
          p.schemaType ?? null, p.schemaFaq ?? false, p.body, p.displayOrder ?? 0,
        ],
      )
      results.push({ slug: p.slug, ok: true })
    } catch (e) {
      results.push({ slug: p.slug, ok: false, error: String((e as Error)?.message ?? e) })
    }
  }

  const okCount = results.filter(r => r.ok).length
  return NextResponse.json({ imported: okCount, total: posts.length, results })
}
