const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const r = await c.query(`SELECT slug,category,date FROM blog_posts WHERE status='live' ORDER BY slug`)
  r.rows.forEach(x => console.log(x.slug, '|', x.category))
  console.log('TOTAL', r.rows.length)
  await c.end()
})().catch(e => { console.error(e.message); process.exit(1) })
