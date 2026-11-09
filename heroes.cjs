const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const r = await c.query(`SELECT hero_image, hero_image_alt, count(*) n, string_agg(slug,', ') s FROM blog_posts WHERE status='live' GROUP BY 1,2 ORDER BY n DESC`)
  r.rows.forEach(x => console.log(`[${x.n}] ${x.hero_image}\n    alt=${x.hero_image_alt}\n    used: ${x.s}\n`))
  await c.end()
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
