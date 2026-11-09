import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const posts = [
  {
    slug: 'halo-ring-setting',
    insertions: [
      { find: 'Surround a center stone with smaller diamonds and the eye', replace: 'Surround a <a href="/diamond-education">center stone</a> with smaller diamonds and the eye' },
      { find: 'A 1.00-carat diamond in a Blaze® halo reads closer to 1.40 carats.', replace: 'A 1.00-carat diamond in a <a href="/blog/blaze-halo-setting-makes-diamond-look-bigger">Blaze® halo</a> reads closer to 1.40 carats.' },
      { find: "Round brilliants and cushion cuts integrate most naturally with the halo’s geometry.", replace: 'Round brilliants and <a href="/blog/cushion-cut-diamond-engagement-ring">cushion cuts</a> integrate most naturally with the halo’s geometry.' },
    ],
  },
  {
    slug: 'princess-cut-diamond-earrings',
    insertions: [
      { find: "unlike the cushion cut’s rounded corners or the Asscher’s", replace: 'unlike the <a href="/blog/cushion-cut-diamond-earrings-video">cushion cut</a>’s rounded corners or the Asscher’s' },
      { find: 'is the most common for princess cut studs. Bezel settings are', replace: 'is the most common for <a href="/blog/choosing-your-diamond-earrings-studs">princess cut studs</a>. Bezel settings are' },
      { find: 'The Bez Ambar Ring of Fire halo design in earring form applies the same Blaze® principle', replace: 'The Bez Ambar <a href="/jewelry/earrings">Ring of Fire halo design</a> in earring form applies the same Blaze® principle' },
    ],
  },
  {
    slug: 'cushion-cut-diamond-earrings-video',
    insertions: [
      { find: 'Put it in a stud earring and walk across a room, and it becomes something else entirely.', replace: 'Put it in a <a href="/blog/choosing-your-diamond-earrings-studs">stud earring</a> and walk across a room, and it becomes something else entirely.' },
      { find: "Bez Ambar’s Ring of Fire cushion cut earrings carry this idea as far as it goes.", replace: 'Bez Ambar’s <a href="/jewelry/earrings">Ring of Fire cushion cut earrings</a> carry this idea as far as it goes.' },
    ],
  },
  {
    slug: 'choosing-your-diamond-earrings-studs',
    insertions: [
      { find: "Bez Ambar’s Ring of Fire stud earrings place a center stone inside", replace: 'Bez Ambar’s <a href="/jewelry/earrings">Ring of Fire stud earrings</a> place a center stone inside' },
      { find: 'Cushion and princess cuts require more care in selection because their larger open facets are less forgiving.', replace: '<a href="/blog/cushion-cut-diamond-earrings-video">Cushion and princess cuts</a> require more care in selection because their larger open facets are less forgiving.' },
    ],
  },
  {
    slug: 'unusual-engagement-rings-round-crossover',
    insertions: [
      { find: 'A round brilliant works naturally here because its symmetry does not compete', replace: 'A <a href="/cuts">round brilliant</a> works naturally here because its symmetry does not compete' },
      { find: 'The center stone should be chosen for the ring rather than the ring being built around', replace: 'The <a href="/diamond-education">center stone</a> should be chosen for the ring rather than the ring being built around' },
    ],
  },
  {
    slug: 'bez-ambars-new-patented-design-divine-cut-diamond',
    insertions: [
      { find: 'became the basis for what GIA now grades as Excellent cut.', replace: 'became the basis for what GIA now grades as <a href="/cuts">Excellent cut</a>.' },
      { find: 'The standard round brilliant uses a specific facet arrangement: a table, 8 bezel facets', replace: 'The standard round brilliant uses a specific <a href="/blog/diamond-anatomy-explained">facet arrangement</a>: a table, 8 bezel facets' },
      { find: 'A stone that performs across all three is a well-cut stone regardless of the specific facet architecture.', replace: 'A stone that performs across all three is a <a href="/diamond-education">well-cut stone</a> regardless of the specific facet architecture.' },
    ],
  },
  {
    slug: 'blaze-halo-setting-makes-diamond-look-bigger',
    insertions: [
      { find: 'A 1.00-carat round brilliant in G/VS2 might be priced at $6,000.', replace: 'A 1.00-carat <a href="/cuts">round brilliant</a> in G/VS2 might be priced at $6,000.' },
      { find: 'In a conventional pavé halo, small round diamonds sit in prong settings.', replace: 'In a conventional <a href="/blog/halo-ring-setting">pavé halo</a>, small round diamonds sit in prong settings.' },
      { find: 'is a higher-quality 1.00-carat stone in a Blaze® halo rather than a lower-quality', replace: 'is a higher-quality 1.00-carat stone in a <a href="/jewelry/rings">Blaze® halo</a> rather than a lower-quality' },
    ],
  },
]

let totalUpdated = 0, totalInsertions = 0

for (const post of posts) {
  const { rows } = await pool.query('SELECT body FROM blog_posts WHERE slug = $1', [post.slug])
  if (!rows.length) { console.log('MISSING:', post.slug); continue }

  let body = rows[0].body
  let applied = 0

  for (const ins of post.insertions) {
    const count = body.split(ins.find).length - 1
    if (count === 1) {
      body = body.replace(ins.find, ins.replace)
      applied++
    } else {
      console.log(`  ${count === 0 ? 'NOT FOUND' : `AMBIGUOUS(${count})`} [${post.slug}]: "${ins.find.slice(0, 50)}"`)
    }
  }

  await pool.query('UPDATE blog_posts SET body = $1, updated_at = NOW() WHERE slug = $2', [body, post.slug])
  console.log(`${post.slug} | ${applied}/${post.insertions.length} applied`)
  totalUpdated++
  totalInsertions += applied
}

await pool.end()
console.log(`\nDone: ${totalUpdated} posts updated, ${totalInsertions} insertions applied`)
