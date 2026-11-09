// update-bucket-b-media.js — adds videos and inline images to stretch + ring-enhancer posts
// node --env-file=.env.local scripts/update-bucket-b-media.js

const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const CLD = 'https://res.cloudinary.com/dlg2mou53'
const IMG = `${CLD}/image/upload/e_trim/c_limit,w_1400`
const HERO = (path) => `${CLD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${path}`
const VIDEO = (path) => `${CLD}/video/upload/${path}`

// Inline image block pattern matching existing posts
const inlineImg = (src, alt) =>
  `\n<figure><img src="${IMG}/${src}" alt="${alt}" loading="lazy"></figure>\n`

async function run() {
  // ── stretch-band-rings ──────────────────────────────────────────────────────
  const stretchResult = await pool.query(
    'SELECT body FROM blog_posts WHERE slug = $1',
    ['stretch-band-rings']
  )
  let stretchBody = stretchResult.rows[0].body

  // Add inline image in the Extent Collection section, after the opening <p>
  const extentInsertAfter = `<h2 id="the-extent">The Same Mechanism at Bracelet Scale</h2>`
  stretchBody = stretchBody.replace(
    extentInsertAfter,
    extentInsertAfter +
    inlineImg(
      'BezAmbar-OldSite/2020/03/3-Row-Princess-Cut-Diamond-Stretchable-Bracelet.jpg',
      '3-row princess cut diamond stretchable bracelet, Bez Ambar Extent collection'
    )
  )

  await pool.query(
    'UPDATE blog_posts SET body = $1, hero_video = $2 WHERE slug = $3 RETURNING slug',
    [
      stretchBody,
      VIDEO('Jewelry%20Videos/Bracelets/Emerald_Cut_Flex_Bracelet_C0834_2026_1080p'),
      'stretch-band-rings'
    ]
  )
  console.log('UPDATED: stretch-band-rings (hero_video + inline image)')

  // ── ring-enhancers-and-guards ───────────────────────────────────────────────
  const enhResult = await pool.query(
    'SELECT body FROM blog_posts WHERE slug = $1',
    ['ring-enhancers-and-guards']
  )
  let enhBody = enhResult.rows[0].body

  // Add blue diamond enhancer image after "Main Configurations" section heading
  const enhInsert1 = `<h2 id="types">What Each Enhancer Achieves</h2>`
  enhBody = enhBody.replace(
    enhInsert1,
    enhInsert1 +
    inlineImg(
      'BezAmbar-OldSite/2018/09/blue-diamond-and-baguette-band.jpg',
      'Wide diamond baguette band with blue diamond ring enhancers, Bez Ambar'
    )
  )

  // Add pink diamond enhancer image after the commissioning section heading
  const enhInsert2 = `<h2 id="commissioning">What to Bring to the Jeweler</h2>`
  enhBody = enhBody.replace(
    enhInsert2,
    enhInsert2 +
    inlineImg(
      'BezAmbar-OldSite/2018/09/pink-diamond-and-baguette-band.jpg',
      'Wide diamond baguette band with pink diamond ring enhancers, Bez Ambar'
    )
  )

  await pool.query(
    `UPDATE blog_posts SET
       body = $1,
       hero_image = $2
     WHERE slug = $3 RETURNING slug`,
    [
      enhBody,
      HERO('BezAmbar-OldSite/2018/09/diamond-and-baguette-band-with-ring-enchancers'),
      'ring-enhancers-and-guards'
    ]
  )
  console.log('UPDATED: ring-enhancers-and-guards (hero_image + 2 inline images)')

  await pool.end()
  console.log('Done.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
