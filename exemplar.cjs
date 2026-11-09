const { Client } = require('pg'); const fs = require('fs')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const r = await c.query(`SELECT slug,title,excerpt,body FROM blog_posts WHERE slug IN ('mens-wedding-band-buying-guide','baguette-diamond-guide')`)
  let out = ''
  r.rows.forEach(p => { out += `\n\n########## EXEMPLAR: ${p.slug}\nTITLE: ${p.title}\nEXCERPT: ${p.excerpt}\nBODY:\n${p.body}\n` })
  fs.writeFileSync('/tmp/blog-style-exemplar.txt', out)
  console.log('written', out.length, 'chars')
  await c.end()
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
