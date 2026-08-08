import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * TEMP one-shot migration — creates the `blog_posts` table.
 * Idempotent (IF NOT EXISTS). DELETE this route after the blog is live.
 *
 * Schema mirrors the Astro blog content-collection frontmatter:
 *   slug (PK), title, date, updated_date, category, excerpt,
 *   hero_image (url), hero_video (url), hero_image_alt, author, status,
 *   schema_type, schema_faq, body (markdown TEXT), display_order.
 *
 * Media = URL strings only (Cloudinary). No blobs in the DB.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        slug            text PRIMARY KEY,
        title           text NOT NULL,
        date            date NOT NULL,
        updated_date    date,
        category        text NOT NULL,
        excerpt         text NOT NULL,
        hero_image      text,
        hero_video      text,
        hero_image_alt  text,
        author          text NOT NULL DEFAULT 'Bez Ambar',
        status          text NOT NULL DEFAULT 'live',
        schema_type     text,
        schema_faq      boolean NOT NULL DEFAULT false,
        body            text NOT NULL,
        display_order   integer NOT NULL DEFAULT 0,
        created_at      timestamptz NOT NULL DEFAULT now(),
        updated_at      timestamptz NOT NULL DEFAULT now()
      )
    `)
    // Helpful indexes for the index page (category filter + date sort).
    await sql(`CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts (category)`)
    await sql(`CREATE INDEX IF NOT EXISTS blog_posts_date_idx ON blog_posts (date DESC)`)
    await sql(`CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status)`)

    out.created = true
    const cols = await sql<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'blog_posts' ORDER BY ordinal_position`,
    )
    out.columns = cols
    const [{ count }] = await sql<{ count: string }>(`SELECT count(*)::text AS count FROM blog_posts`)
    out.rowCount = count
  } catch (e) {
    out.error = String((e as Error)?.message ?? e)
  }
  return NextResponse.json(out)
}
