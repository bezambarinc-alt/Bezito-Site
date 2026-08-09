/**
 * blog.ts — SERVER-ONLY data layer for the blog.
 * Queries the Neon `blog_posts` table (populated by the import route).
 *
 * ⚠️  Import ONLY in Server Components or Route Handlers.
 *     Client-safe types live in blog-constants.ts.
 */
import 'server-only'
import { sql } from '@/lib/db'
import type { BlogPost, BlogCard } from './blog-constants'

interface BlogRow {
  slug: string
  title: string
  date: string
  updated_date: string | null
  category: string
  excerpt: string
  hero_image: string | null
  hero_video: string | null
  hero_image_alt: string | null
  author: string
  status: string
  schema_type: string | null
  schema_faq: boolean
  body: string
}

function mapRow(r: BlogRow): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    date: r.date,
    updatedDate: r.updated_date,
    category: r.category,
    excerpt: r.excerpt,
    heroImage: r.hero_image,
    heroVideo: r.hero_video,
    heroImageAlt: r.hero_image_alt,
    author: r.author,
    status: r.status,
    schemaType: r.schema_type,
    schemaFaq: r.schema_faq,
    body: r.body,
  }
}

/** All live posts as lightweight cards for the index (no body). */
export async function getBlogCards(): Promise<BlogCard[]> {
  const rows = await sql<Omit<BlogRow, 'body'>>(
    `SELECT slug, title, date, updated_date, category, excerpt,
            hero_image, hero_video, hero_image_alt, author, status,
            schema_type, schema_faq
       FROM blog_posts
      WHERE status = 'live'
      ORDER BY date DESC, display_order ASC`,
  )
  return rows.map(r => ({
    slug: r.slug,
    title: r.title,
    date: r.date,
    category: r.category,
    excerpt: r.excerpt,
    heroImage: r.hero_image,
    heroImageAlt: r.hero_image_alt,
  }))
}

/** One post by slug (full body). Returns null if missing or not live. */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const rows = await sql<BlogRow>(
    `SELECT slug, title, date, updated_date, category, excerpt,
            hero_image, hero_video, hero_image_alt, author, status,
            schema_type, schema_faq, body
       FROM blog_posts
      WHERE slug = $1 AND status = 'live'
      LIMIT 1`,
    [slug],
  )
  return rows[0] ? mapRow(rows[0]) : null
}

/** All live slugs — for generateStaticParams. */
export async function getBlogSlugs(): Promise<string[]> {
  const rows = await sql<{ slug: string }>(
    `SELECT slug FROM blog_posts WHERE status = 'live' ORDER BY date DESC`,
  )
  return rows.map(r => r.slug)
}
