const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const r = await c.query(`SELECT slug,title,excerpt,category,date,hero_image,hero_image_alt,schema_type,schema_faq,body FROM blog_posts WHERE slug=$1`, [process.argv[2]])
  const p = r.rows[0]
  if (!p) { console.log('NOT FOUND'); await c.end(); return }
  console.log('SLUG:', p.slug); console.log('TITLE:', p.title); console.log('EXCERPT:', p.excerpt)
  console.log('CAT:', p.category, '| DATE:', p.date, '| FAQ:', p.schema_faq, '| TYPE:', p.schema_type)
  console.log('HERO:', p.hero_image); console.log('ALT:', p.hero_image_alt)
  console.log('----BODY----'); console.log(p.body)
  await c.end()
})().catch(e => { console.error(e.message); process.exit(1) })
