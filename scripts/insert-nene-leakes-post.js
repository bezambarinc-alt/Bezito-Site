#!/usr/bin/env node
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const post = {
  slug: 'nene-leakes-engagement-ring',
  title: "NeNe Leakes' Engagement Ring — Designed by Bez Ambar",
  status: 'live',
  category: 'celebrity',
  author: 'Bez Ambar',
  excerpt: "NeNe Leakes' stunning engagement ring was designed by Bez Ambar — a brilliant-cut radiant diamond set in platinum. Explore the story behind this celebrity piece.",
  body: `<p>When NeNe Leakes, the beloved star of <em>The Real Housewives of Atlanta</em>, said yes, the ring on her finger was a Bez Ambar original. The Los Angeles–based designer — known for his exacting standards and one-of-a-kind cuts — crafted the radiant-diamond engagement ring that made headlines when the couple announced their engagement.</p>

<h2>The Ring</h2>
<p>At the heart of the piece is a large, high-clarity radiant-cut diamond — a shape Bez Ambar has helped define over decades at the bench. The radiant combines the brilliance of a round with the architectural geometry of an emerald cut, producing a stone that throws light in every direction. Set in platinum with a clean, tailored mounting, the ring lets the diamond speak.</p>

<h2>Bez Ambar and Celebrity Commissions</h2>
<p>Bez Ambar has long worked with clients who require discretion alongside extraordinary craftsmanship. His Beverly Hills atelier draws collectors, entertainers, and private buyers who want something made — not merely selected from a case. Each piece originates as a hand-drawn design, progressing through CAD modeling and hand-finishing before it reaches the client.</p>

<p>NeNe's ring exemplifies that process: a stone chosen for its optical performance, a setting built to disappear around it, and a finished piece that photographs as well as it wears in person.</p>

<h2>About Radiant-Cut Diamonds</h2>
<p>The radiant cut is one of the most versatile shapes in fine jewelry. Its trimmed corners eliminate the chip risk of a true rectangle, while its 70-facet arrangement rivals the round brilliant for fire and scintillation. For a celebrity who lives in front of cameras, the choice is strategic as much as aesthetic.</p>

<p>Bez Ambar keeps a curated selection of radiant-cut diamonds at his Beverly Hills studio. Each stone is individually graded and viewed in person before it enters inventory.</p>

<h2>Commission Your Own</h2>
<p>Interested in a custom engagement ring? <a href="/contact">Reach out to the studio</a> to begin the conversation. Bez Ambar works with clients worldwide and accepts a limited number of bespoke commissions each year.</p>`,
}

try {
  const existing = await pool.query(`SELECT slug FROM blog_posts WHERE slug = $1`, [post.slug])
  if (existing.rows.length > 0) {
    console.log(`Post already exists: ${post.slug}`)
    process.exit(0)
  }

  await pool.query(
    `INSERT INTO blog_posts (slug, title, status, category, author, excerpt, body, date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())`,
    [post.slug, post.title, post.status, post.category, post.author, post.excerpt, post.body]
  )
  console.log(`Inserted: ${post.slug}`)
} finally {
  await pool.end()
}
