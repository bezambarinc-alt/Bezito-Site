const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const t = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
  console.log('TABLES:', t.rows.map(r=>r.table_name).join(', '))
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='archive' ORDER BY ordinal_position`)
  console.log('ARCHIVE COLS:', cols.rows.map(r=>r.column_name).join(', '))
  for (const term of ['easyfit','stretch','silvet','bookend','enhancer','black diamond','baguette']) {
    const r = await c.query(`SELECT slug, title FROM archive WHERE slug ILIKE $1 OR coalesce(title,'') ILIKE $1 LIMIT 15`, [`%${term}%`])
    console.log(`\n--- archive "${term}" (${r.rowCount}) ---`)
    r.rows.forEach(x => console.log(`  ${x.slug} | ${x.title}`))
  }
  await c.end()
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
