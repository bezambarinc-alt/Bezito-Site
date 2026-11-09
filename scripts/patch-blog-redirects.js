// patch-blog-redirects.js
// 1. Adds /blog/divine-cut-diamond → correct slug
// 2. Re-routes 71 /blog-index sources to specific posts/pages
// node scripts/patch-blog-redirects.js

'use strict'
const fs = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../redirects.ts')
let src = fs.readFileSync(FILE, 'utf8')

// ── Mapping: old source path → specific destination ────────────────────────
const MAP = {
  // Ring enhancers
  '/bez-ambars-ring-enhancers-bookend-bands': '/blog/ring-enhancers-and-guards',
  '/heart-shaped-silvet-ring-with-rubies': '/blog/ring-enhancers-and-guards',

  // Blaze
  '/bezambar-blaze-cut-diamonds': '/blog/blaze-cut-diamond',
  '/bamboo-engagement-ring-with-blaze': '/blog/blaze-cut-diamond',
  '/ring-of-light': '/blog/blaze-halo-setting-makes-diamond-look-bigger',

  // Princess cut / Bez Ambar brand
  '/bezambar-princess-cut-diamonds': '/blog/princess-cut-diamond-inventor',
  '/designer-diamond-rings-bez-ambars-finest-engagement-rings': '/blog/princess-cut-diamond-inventor',
  '/designer-engagement-rings-bez-ambar': '/blog/princess-cut-diamond-inventor',
  '/finest-designer-engagement-rings': '/blog/princess-cut-diamond-inventor',

  // Custom jewelry
  '/custom-jewelry-gold-jewelry': '/blog/custom-jewelry-design-process',
  '/custom-rings-diamonds-gemstones': '/blog/custom-jewelry-design-process',
  '/custom-rings-master-craftsman-create-dream-wedding-ring': '/blog/custom-jewelry-design-process',
  '/customized-engagement-ring-for-a-special-order': '/blog/custom-jewelry-design-process',
  '/design-your-own-diamond-ring-wedding-engagement': '/blog/custom-jewelry-design-process',
  '/handmade-jewelry-designs': '/blog/custom-jewelry-design-process',
  '/custom-diamond-necklace-designed-master-craftsmen': '/blog/custom-jewelry-design-process',

  // Ruby
  '/ruby-engagement-rings-custom-red-rubies-diamonds': '/blog/ruby-engagement-ring-guide',
  '/round-center-with-square-rubies': '/blog/ruby-engagement-ring-guide',

  // Wedding bands / eternity rings
  '/wedding-bands-for-women-eternity-rings': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/wedding-bands-stunning-fine-jewelry-his-hers': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/bridal-ring-sets-diamond-wedding-ring-sets': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/diamond-rings-wedding-rings': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/what-is-a-wedding-band': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/wedding-ring-designs': '/blog/anniversary-rings-wedding-rings-eternity-rings',
  '/engagement-rings-with-bands': '/blog/anniversary-rings-wedding-rings-eternity-rings',

  // LA / about
  '/unique-diamond-jewelry-los-angeles-ca': '/blog/the-los-angeles-diamond-district',
  '/engagement-rings-los-angeles-best-jewelry': '/blog/the-los-angeles-diamond-district',
  '/bez-ambar-unique-buying-experience-los-angeles': '/about-bez-ambar',
  '/sets-apart-designer-jewelry-rest': '/about-bez-ambar',
  '/bez-ambar-aura-collection-multi-colored-stone-rings': '/about-bez-ambar',
  '/stackable-rings-bez-ambar': '/about-bez-ambar',

  // EasyFit / stretch
  '/easyfit-ring-shanks': '/blog/stretch-band-rings',

  // Gold
  '/difference-yellow-gold-white-gold-rose-gold': '/blog/yellow-gold-vs-rose-gold-vs-white-gold',

  // Radiant
  '/radiant-cushion-cut-engagement-rings': '/blog/radiant-cut-diamond-engagement-ring',

  // Men's
  '/mens-unique-wedding-rings': '/blog/mens-diamond-rings',
  '/all-around-stag-bands': '/blog/mens-wedding-band-buying-guide',
  '/knife-edge-unique-wedding-rings': '/blog/mens-wedding-band-buying-guide',

  // Gemstones
  '/birthstones-month-gemstones-and-engagement-rings': '/blog/choosing-semi-precious-stones',
  '/natural-pink-sapphire-earrings': '/blog/sapphire-engagement-rings-yes-no',
  '/round-center-with-square-sapphires': '/blog/blue-sapphire-engagement-ring',

  // Bracelets
  '/bracelets-stunning-diamond-bracelet-designs': '/blog/diamond-tennis-bracelet-guide',

  // Solitaire / general engagement
  '/womens-diamond-engagement-rings': '/blog/solitaire-engagement-ring-guide',
  '/choose-engagement-ring-cut-setting-metal': '/blog/solitaire-engagement-ring-guide',
  '/designer-diamond-engagement-ring': '/blog/solitaire-engagement-ring-guide',
  '/designer-diamond-engagement-rings': '/blog/solitaire-engagement-ring-guide',
  '/designer-engagement-rings-wedding-bands': '/blog/solitaire-engagement-ring-guide',
  '/propose-to-partner-perfect-rings': '/blog/solitaire-engagement-ring-guide',
  '/wedding-engagement-rings-1st-time-buyers-guide': '/blog/solitaire-engagement-ring-guide',
  '/what-is-cathedral-engagement-ring-setting': '/blog/solitaire-engagement-ring-guide',

  // Halo
  '/unique-engagement-ring-settings': '/blog/halo-ring-setting',

  // Diamonds
  '/diamonds-made-valued': '/blog/diamonds-as-investment-guide',
  '/micro-pave-heart-pendant-accent-diamond-ring': '/blog/pave-engagement-ring-guide',

  // Baguette bands
  '/custom-three-row-wedding-bands-for-women': '/blog/baguette-diamond-bands-for-women',
  '/wide-band-diamond-rings': '/blog/baguette-diamond-bands-for-women',

  // Retailers (city/store pages)
  '/designer-engagement-rings-chicago': '/retailers',
  '/designer-engagement-rings-dallas': '/retailers',
  '/designer-engagement-rings-nashville-tn': '/retailers',
  '/genesis-diamonds-nashville': '/retailers',
  '/international-diamond-center': '/retailers',
  '/international-diamond-center-altamonte-springs': '/retailers',
  '/international-diamond-center-clearwater': '/retailers',
  '/international-diamond-center-orlando': '/retailers',
  '/international-diamond-center-savannah-ga': '/retailers',
  '/international-diamond-center-tampa': '/retailers',
  '/international-diamond-center-winter-park-fl': '/retailers',
  '/engagement-rings-boston': '/retailers',
  '/engagement-rings-houston': '/retailers',
  '/turgeon-raine': '/retailers',
  '/turgeon-raine-seattle': '/retailers',
  '/maurice-badler-fine-jewelry': '/retailers',
  '/badler-last-call': '/retailers',
}

let changed = 0
for (const [sourcePath, dest] of Object.entries(MAP)) {
  // Match both slash and non-slash variants
  for (const src_path of [sourcePath, sourcePath + '/']) {
    const pattern = `source: '${src_path}', destination: '/blog', permanent: true`
    const replacement = `source: '${src_path}', destination: '${dest}', permanent: true`
    if (src.includes(pattern)) {
      src = src.replaceAll(pattern, replacement)
      changed++
    } else {
      // Also check without trailing slash in source (some may not have twin)
      console.log(`  NOT FOUND: ${src_path}`)
    }
  }
}

// ── Add /blog/divine-cut-diamond redirect ─────────────────────────────────
// Insert near the top of the blog section — find the /blog/ section marker
// Actually simpler: insert right after the Bucket B section
const ANCHOR = `// MUST STAY LAST. Catches every /product-tag/*`
const DIVINE_RULE = `    { source: '/blog/divine-cut-diamond', destination: '/blog/bez-ambars-new-patented-design-divine-cut-diamond', permanent: true },
    { source: '/blog/divine-cut-diamond/', destination: '/blog/bez-ambars-new-patented-design-divine-cut-diamond', permanent: true },

    `
if (!src.includes('/blog/divine-cut-diamond')) {
  src = src.replace(ANCHOR, DIVINE_RULE + ANCHOR)
  console.log('  ADDED: /blog/divine-cut-diamond redirect')
}

fs.writeFileSync(FILE, src)
console.log(`\nDone — ${changed} rules updated, divine-cut-diamond added.`)
