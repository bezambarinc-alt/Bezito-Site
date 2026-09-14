/**
 * Static data for the top-20 WooCommerce legacy product pages.
 * Keyed by the original WooCommerce /shop/ slug.
 * Images are served from Cloudinary — named by the upload script:
 *   {slugify(sku)}-{slugify(internalName)}-{n:02d}  (or sku-only / name-only fallbacks)
 */

const CDN = 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/Jewelry%20Images/Legacy/woocommerce-archive'

export interface LegacyProduct {
  slug: string
  name: string
  sku: string | null
  category: string
  categoryLabel: string
  description: string
  imageUrl: string
  specs: { label: string; body: string }[]
}

const PRODUCTS: LegacyProduct[] = [
  {
    slug: 'cosmic-fire-engagement-ring-fancy-yellow-radiant-cut',
    name: 'Cosmic Fire',
    sku: 'ARCDT-RD',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Cosmic Fire frames a radiant cut center stone in a ring of Blaze® cut diamonds, with pavé set along the full length of the shank. Made in Los Angeles. Setting priced separately from the center stone.',
    imageUrl: `${CDN}/arcdt-rd-cosmic-fire-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Radiant cut center · Blaze® cut and pavé diamond halo' },
      { label: 'Metal', body: '18k White Gold · Rose Gold · Yellow Gold · Platinum' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'a-baguette-diamond-eternity-band',
    name: 'Random Set Baguette Eternity Band',
    sku: '2RND-BG-MX4',
    category: 'bands',
    categoryLabel: 'Bands',
    description:
      'The Random Set eternity band wraps the finger in a medley of precision cut baguette diamonds arranged in alternating orientations across four rows. A signature archive piece from Bez Ambar.',
    imageUrl: `${CDN}/2rnd-bg-mx4-random-set-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Precision baguette diamonds · alternating set' },
      { label: 'Metal', body: '18k White Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'fancy-brown-diamond-frame-fire-ring-black-blaze',
    name: 'Black Frame of Fire Ring',
    sku: 'EQXLZB',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Black Frame of Fire Ring holds a radiant cut center stone in a frame of black Blaze® cut diamonds, set in 18k yellow gold with a pavé diamond shank. The mounting accommodates different center stone sizes, shapes, and colors.',
    imageUrl: `${CDN}/eqxlzb-black-frame-of-fire-ring-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Radiant cut center · black Blaze® frame · pavé shank' },
      { label: 'Metal', body: '18k Yellow Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'stretchable-baguette-diamond-eternity-band',
    name: 'EasyFit Baguette Band',
    sku: '2FLX42BG',
    category: 'bands',
    categoryLabel: 'Bands',
    description:
      'The EasyFit baguette eternity band stretches over the knuckle without resizing — each piece engineered with a flex mechanism and set with precision cut baguette diamonds. From the Bez Ambar EasyFit Collection.',
    imageUrl: `${CDN}/2flx42bg-easyfit-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Precision baguette diamonds' },
      { label: 'Metal', body: '18k White Gold' },
      { label: 'Collection', body: 'EasyFit — stretch fit, no resizing required' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'jacket-of-fire-diamond-stud-earrings',
    name: 'Jacket of Fire',
    sku: '3ROF24J',
    category: 'earrings',
    categoryLabel: 'Earrings',
    description:
      'The Jacket of Fire encircles a round diamond stud in a ring of Blaze® cut diamonds, transforming a solitaire into a full halo earring. Worn over existing stud earrings as an enhancer jacket.',
    imageUrl: `${CDN}/3rof24j-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Blaze® cut diamond halo' },
      { label: 'Metal', body: 'Platinum · 18k White Gold' },
      { label: 'Wear', body: 'Earring enhancer — worn over existing studs' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '20-carat-diamond-ring-from-bez-ambar',
    name: 'Karen · Emerald 20ct',
    sku: '1KRN-20Ct',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Karen three stone ring sets an emerald cut center stone between two large trapezoid side diamonds, available in platinum, white, yellow, or rose gold. Setting priced separately from the center stone.',
    imageUrl: `${CDN}/1krn-20ct-karen-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Emerald cut center · trapezoid side diamonds' },
      { label: 'Metal', body: 'Platinum · 18k White Gold · Yellow Gold · Rose Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'quadrillion-and-baguette-diamonds-wedding-band',
    name: 'Quadrillion & Baguette Band',
    sku: 'SIGMA135',
    category: 'bands',
    categoryLabel: 'Bands',
    description:
      'An 18k yellow gold band alternating Quadrillion® cut diamonds and precision baguettes in a continuous channel around the finger. 1.8 carats total weight, 4.41mm band width.',
    imageUrl: `${CDN}/sigma135-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Quadrillion® cut diamonds · precision baguettes · 1.8ct TW' },
      { label: 'Metal', body: '18k Yellow Gold · White Gold available' },
      { label: 'Band Width', body: '4.41mm' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'tulip-trio-engagement-ring-round-diamonds',
    name: 'Tulip Trio',
    sku: null,
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Tulip Trio engagement ring features a round brilliant center stone flanked by two smaller side stones on a double row pavé curved shank set in 18k white gold. The mounting accommodates different center stone shapes, sizes, and colors.',
    imageUrl: `${CDN}/tulip-trio-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Round brilliant center · round side stones · double row pavé shank' },
      { label: 'Metal', body: '18k White Gold' },
      { label: 'Collection', body: 'Bridal Trio' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '18k-white-gold-ring-fire-round-center',
    name: 'Ring of Fire · Round',
    sku: '1ROF24VS',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Ring of Fire holds a round diamond center in a full halo of Blaze® cut diamonds, available in platinum, white, rose, or yellow gold. Setting priced separately from the center stone.',
    imageUrl: `${CDN}/1rof24vs-small-ring-of-fire-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Round diamond center · Blaze® cut diamond halo' },
      { label: 'Metal', body: 'Platinum · 18k White Gold · Rose Gold · Yellow Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'confetti-melody-baguette-diamond-band',
    name: 'Confetti Melody',
    sku: '2CONML1',
    category: 'bands',
    categoryLabel: 'Bands',
    description:
      'The Confetti Melody band traces a path of pink pavé diamonds intersecting a wave of round and baguette diamonds across the full width of the band. From the Confetti Crosswalk Collection.',
    imageUrl: `${CDN}/2conml1-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Baguette diamonds · round diamonds · pink pavé' },
      { label: 'Metal', body: '18k White Gold' },
      { label: 'Collection', body: 'Confetti Crosswalk' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '11-stone-15-carat-emerald-cut-diamond-wedding-band',
    name: 'Diamond Eternity Band',
    sku: '2ETE150',
    category: 'bands',
    categoryLabel: 'Bands',
    description:
      'The Diamond Eternity Band sets eleven precision cut emerald cut diamonds across a platinum channel, each selected for consistency of cut and proportion. Designed and handmade in Los Angeles.',
    imageUrl: `${CDN}/2ete150-diamond-eternity-01.jpg`,
    specs: [
      { label: 'Stone', body: '11 × emerald cut diamonds · matched for cut and proportion' },
      { label: 'Metal', body: 'Platinum' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '5-carat-blue-diamond-pear-shape-engagement-ring',
    name: '5ct Blue Pear Three Stone Ring',
    sku: '1TRIO-5BDPR',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'A three stone engagement ring built around a pear shape blue diamond center, flanked by two matching pear shape white diamonds on a platinum shank. Setting priced separately from the center stone.',
    imageUrl: `${CDN}/1trio-5bdpr-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Pear shape blue diamond center · pear shape diamond sides' },
      { label: 'Metal', body: 'Platinum' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'split-shank-ruby-and-diamond-engagement-ring',
    name: 'Ruby Blossom Ring',
    sku: 'OC2PT3RU',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Ruby Blossom Ring features a six-arm split shank set with pavé diamonds and natural rubies, framing a round diamond center. Available in platinum, rose, or yellow gold; setting priced separately.',
    imageUrl: `${CDN}/oc2pt3ru-ruby-blossom-ring-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Round diamond center · pavé diamonds · natural rubies' },
      { label: 'Metal', body: 'Platinum · 18k Rose Gold · Yellow Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '8-carat-marquise-diamond-engagement-ring',
    name: 'Karen · Marquise 8ct',
    sku: '1KRN-8CT',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Karen marquise three stone ring pairs a marquise cut center stone with two matching pear shape side diamonds on a platinum shank. A collector configuration; contact for pricing.',
    imageUrl: `${CDN}/1krn-8ct-karen-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Marquise cut center · pear shape side diamonds' },
      { label: 'Metal', body: 'Platinum' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Collector piece. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'fancy-blue-diamond-cushion-cut-engagement-ring',
    name: 'Tulip Ring · Cushion',
    sku: 'TLP29PV-RD-1',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Tulip Ring holds a cushion cut center stone in a field of Blaze® cut diamonds with delicate pavé set throughout the shank. Available in platinum, 18k white, rose, and yellow gold; setting priced separately.',
    imageUrl: `${CDN}/tlp29pv-rd-1-tulip-ring-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Cushion cut center · Blaze® cut and pavé diamonds' },
      { label: 'Metal', body: 'Platinum · 18k White Gold · Rose Gold · Yellow Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '20-carat-d-flawless-emerald-engagement-ring',
    name: 'Custom Emerald Ring',
    sku: 'CUSTOMEM',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'A one-of-a-kind ring designed for a specific large emerald cut center stone, modifiable to hold smaller stones in platinum or 18k gold. Contact for pricing; center stone priced separately.',
    imageUrl: `${CDN}/customem-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Emerald cut center · accommodates varied sizes and stones' },
      { label: 'Metal', body: 'Platinum · 18k White Gold · Yellow Gold · Rose Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Custom one-of-a-kind piece. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'emerald-cut-diamond-and-emerald-baguette-three-stone-engagement-ring',
    name: 'Ayla',
    sku: '1C3SBG-EM',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Ayla three stone ring sets an emerald cut center stone between two precision cut emerald baguettes — a study in parallel lines and step-cut proportion. Available in yellow, white, or rose gold; setting priced separately.',
    imageUrl: `${CDN}/1c3sbg-em-ayla-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Emerald cut center · emerald cut baguette sides' },
      { label: 'Metal', body: '18k Yellow Gold · White Gold · Rose Gold' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: 'three-stone-ring-emerald-center-trapezoids',
    name: 'Trio Ring',
    sku: 'TRIOTRAP',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'The Trio Ring sets an emerald cut center stone between two precision cut trapezoid diamonds in a platinum or 18k gold mounting. The design accommodates different center stone shapes, sizes, and colors.',
    imageUrl: `${CDN}/triotrap-trio-ring-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Emerald cut center · trapezoid side diamonds' },
      { label: 'Metal', body: 'Platinum · 18k White Gold · Yellow Gold · Rose Gold' },
      { label: 'Collection', body: 'Trio Engagement Rings' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
  {
    slug: '10-carat-radiant-pink-diamond-engagement-ring',
    name: 'Ring of Fire · Pink',
    sku: '1ROF-PK10RD',
    category: 'rings',
    categoryLabel: 'Rings',
    description:
      'A radiant cut pink diamond set in a full frame of Blaze® cut diamonds, from the Ring of Fire series. Setting priced separately from the center stone; contact for pricing.',
    imageUrl: `${CDN}/1rof-pk10rd-01.jpg`,
    specs: [
      { label: 'Stone', body: 'Radiant cut pink diamond center · Blaze® cut diamond frame' },
      { label: 'Metal', body: 'Platinum · 18k White Gold' },
      { label: 'Collection', body: 'Ring of Fire' },
      { label: 'Made In', body: 'Los Angeles' },
      { label: 'Inquiry', body: 'Setting only. Presented privately by appointment. Reference this piece when you inquire.' },
    ],
  },
]

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]))

export function getLegacyProductBySlug(slug: string): LegacyProduct | undefined {
  return BY_SLUG.get(slug)
}

export function getAllLegacySlugs(): string[] {
  return PRODUCTS.map((p) => p.slug)
}

export default PRODUCTS
