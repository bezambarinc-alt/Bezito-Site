// migrate-legacy-blog-images.js
// Downloads legacy BezAmbar-OldSite images (fetch-type, not stored in account)
// and re-uploads them as upload-type assets in the active Jewelry Images/ folder.
// Then updates the DB with the new paths.
// node --env-file=.env.local scripts/migrate-legacy-blog-images.js

'use strict'
const fs = require('fs')
const crypto = require('crypto')
const { Pool } = require('pg')

const CREDS = JSON.parse(fs.readFileSync('/home/bezito/.openclaw/credentials/cloudinary.json', 'utf8'))
const { cloud_name, api_key, api_secret } = CREDS
const CLD_BASE = `https://api.cloudinary.com/v1_1/${cloud_name}`
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function sign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return crypto.createHash('sha1').update(str + api_secret).digest('hex')
}

async function cldUploadUrl(imageUrl, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const sigParams = { public_id: publicId, timestamp }
  const signature = sign(sigParams)
  const form = new URLSearchParams({
    file: imageUrl,
    public_id: publicId,
    timestamp: String(timestamp),
    api_key,
    signature,
  })
  const r = await fetch(`${CLD_BASE}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const text = await r.text()
  try { return JSON.parse(text) } catch { return { error: { message: text.slice(0, 200) } } }
}

const CLD_IMG = 'https://res.cloudinary.com/dlg2mou53/image/upload'
const LEGACY = `${CLD_IMG}/f_auto,q_auto,w_900`
const HERO_URL = (path) => `${CLD_IMG}/c_fill,ar_16:9,g_auto,w_1400/${encodeURIComponent(path)}`
const INLINE_URL = (path) => `${CLD_IMG}/e_trim/c_limit,w_1400/${encodeURIComponent(path)}`

const MOVES = [
  {
    srcUrl: `${LEGACY}/BezAmbar-OldSite/2018/09/diamond-and-baguette-band-with-ring-enchancers.jpg`,
    to: 'Jewelry Images/Rings/diamond-baguette-ring-enhancers',
    label: 'ring-enhancers hero',
  },
  {
    srcUrl: `${LEGACY}/BezAmbar-OldSite/2018/09/blue-diamond-and-baguette-band.jpg`,
    to: 'Jewelry Images/Rings/blue-diamond-baguette-ring-enhancers',
    label: 'ring-enhancers inline (blue)',
  },
  {
    srcUrl: `${LEGACY}/BezAmbar-OldSite/2018/09/pink-diamond-and-baguette-band.jpg`,
    to: 'Jewelry Images/Rings/pink-diamond-baguette-ring-enhancers',
    label: 'ring-enhancers inline (pink)',
  },
  {
    srcUrl: `${LEGACY}/BezAmbar-OldSite/2020/03/3-Row-Princess-Cut-Diamond-Stretchable-Bracelet.jpg`,
    to: 'Jewelry Images/Bracelets/3-row-princess-cut-stretch-bracelet',
    label: 'stretch-band inline',
  },
]

async function run() {
  const results = {}

  // Step 1: upload each image to the active Cloudinary folder
  for (const m of MOVES) {
    const result = await cldUploadUrl(m.srcUrl, m.to)
    if (result.error) {
      console.error(`FAILED  ${m.label}: ${result.error.message}`)
      results[m.label] = null
    } else {
      console.log(`UPLOADED  ${m.label}: public_id=${result.public_id}`)
      results[m.label] = result.public_id
    }
  }

  // Step 2: update ring-enhancers-and-guards
  if (results['ring-enhancers hero']) {
    const enhRow = await pool.query('SELECT body FROM blog_posts WHERE slug = $1', ['ring-enhancers-and-guards'])
    let enhBody = enhRow.rows[0].body

    // Replace old legacy paths in body with new encoded paths
    enhBody = enhBody
      .replace(
        /BezAmbar-OldSite%2F2018%2F09%2Fblue-diamond-and-baguette-band\.jpg|BezAmbar-OldSite\/2018\/09\/blue-diamond-and-baguette-band\.jpg/g,
        encodeURIComponent('Jewelry Images/Rings/blue-diamond-baguette-ring-enhancers')
      )
      .replace(
        /BezAmbar-OldSite%2F2018%2F09%2Fpink-diamond-and-baguette-band\.jpg|BezAmbar-OldSite\/2018\/09\/pink-diamond-and-baguette-band\.jpg/g,
        encodeURIComponent('Jewelry Images/Rings/pink-diamond-baguette-ring-enhancers')
      )

    await pool.query(
      'UPDATE blog_posts SET hero_image = $1, body = $2 WHERE slug = $3',
      [
        HERO_URL('Jewelry Images/Rings/diamond-baguette-ring-enhancers'),
        enhBody,
        'ring-enhancers-and-guards',
      ]
    )
    console.log('DB UPDATED: ring-enhancers-and-guards')
  }

  // Step 3: update stretch-band-rings
  if (results['stretch-band inline']) {
    const stretchRow = await pool.query('SELECT body FROM blog_posts WHERE slug = $1', ['stretch-band-rings'])
    let stretchBody = stretchRow.rows[0].body

    stretchBody = stretchBody.replace(
      /BezAmbar-OldSite%2F2020%2F03%2F3-Row-Princess-Cut-Diamond-Stretchable-Bracelet\.jpg|BezAmbar-OldSite\/2020\/03\/3-Row-Princess-Cut-Diamond-Stretchable-Bracelet\.jpg/g,
      encodeURIComponent('Jewelry Images/Bracelets/3-row-princess-cut-stretch-bracelet')
    )

    await pool.query(
      'UPDATE blog_posts SET body = $1 WHERE slug = $2',
      [stretchBody, 'stretch-band-rings']
    )
    console.log('DB UPDATED: stretch-band-rings')
  }

  await pool.end()
  console.log('Done.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
