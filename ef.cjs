const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const r = await c.query(`SELECT * FROM archive WHERE slug='r07896-easyfit'`)
  console.log(JSON.stringify(r.rows[0], null, 1))
  await c.end()
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
