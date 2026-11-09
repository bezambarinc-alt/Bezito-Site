const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const col = await c.query(`SELECT collection, count(*) FROM products WHERE active GROUP BY collection ORDER BY 2 DESC`)
  console.log('=== COLLECTIONS ===')
  col.rows.forEach(r => console.log(`${r.collection} — ${r.count}`))
  for (const term of ['easyfit','easy fit','stretch','extent','silvet','bookend','book end','enhancer','baguette','black diamond']) {
    const r = await c.query(`SELECT slug, name, category, collection FROM products WHERE active AND (name ILIKE $1 OR slug ILIKE $1 OR coalesce(description,'') ILIKE $1) LIMIT 12`, [`%${term}%`])
    console.log(`\n=== "${term}" (${r.rowCount}) ===`)
    r.rows.forEach(x => console.log(`  ${x.slug} | ${x.name} | ${x.category} | ${x.collection}`))
  }
  await c.end()
})().catch(e => { console.error(e.message); process.exit(1) })
