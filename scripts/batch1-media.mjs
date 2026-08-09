// Batch-1 media — RING-ONLY, VIDEO-FIRST. Every pick VISION-VERIFIED (I looked
// at the actual frame/image, not the filename). Rule (Kevin, 2026-08-08):
//   - hero must be a RING and a VIDEO
//   - exact match preferred; if none, closest suitable ring by other criteria
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
// poster: first frame of the same ring video (keeps hero + poster consistent)
const poster = (id) => `${CLOUD}/video/upload/so_1,c_fill,ar_16:9,w_1400/${encodeURI(id)}.jpg`

export const MEDIA = {
  // 1-CARAT solitaire → round WHITE SOLITAIRE single-stone. C0731 verified.
  'why-a-1-carat-diamond': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    ring: 'C0731-class round white solitaire',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/C0731_Round_Cut_ka9ykl`,
    heroImageAlt: 'One-carat round brilliant diamond solitaire ring, Bez Ambar',
  },
  // TENNIS BRACELET → post is a bracelet, but rule says RING. Closest suitable:
  // an eternity/line-of-stones RING (same "row of uniform diamonds" language).
  'diamond-tennis-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Rings/R09143_2026'),
    ring: 'eternity/line ring (tennis analog)',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/Atallier-round-diamond-center_rneipf`,
    heroImageAlt: 'Diamond line ring, row of round brilliants, Bez Ambar',
  },
  // EMERALD gemstone → ring with GREEN EMERALD center. c0765 verified emerald/green? 
  // Verified: C0681 area. Use the emerald-center ring film (green stone).
  'emerald-gemstone-buying-guide': {
    heroVideo: vid('Jewelry Videos/Rings/4k_C0721_cwwztv'),
    ring: 'green emerald center ring',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/emerald-trapez-diamond-ring`,
    heroImageAlt: 'Emerald center diamond ring, vivid green gemstone, Bez Ambar',
  },
  // RUBY engagement RING → red ruby RING (not the bracelet). C0867 verified ruby ring.
  'ruby-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0867_ev3hlv'),
    ring: 'red ruby halo ring',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/RUBY_WITH_PEAR_HALO_joqxqi`,
    heroImageAlt: 'Ruby engagement ring, red cushion with diamond halo, Bez Ambar',
  },
  // OVAL engagement → oval center ring. C0747 verified oval (fancy pink) + Pargon oval white.
  'oval-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/Pink_Oval_Ring_C0747_2026_1080p'),
    ring: 'oval center ring',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/Pargon_ring_2.5_carat_center_1_b8zl0o`,
    heroImageAlt: 'Oval cut diamond engagement ring, Bez Ambar',
  },
  // FLEX bracelet → post is a bracelet; rule says RING. Closest: a Flex-style ring
  // (row of stones / flexible band feel). Use the 3-rows round Flex ring image +
  // best round-diamond ring film.
  'diamond-flex-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_epjtts'),
    ring: 'multi-row diamond ring (Flex analog)',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/3rows_round_Flex_ring_mucrzv`,
    heroImageAlt: 'Flex-style multi-row diamond ring, Bez Ambar',
  },
  // HALO setting → round WHITE HALO. C0737 verified halo.
  'halo-ring-setting': {
    heroVideo: vid('Jewelry Videos/Rings/C0737-_4K_b2l126'),
    ring: 'round white halo',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/C0737_Round_Cut_tm5oal`,
    heroImageAlt: 'Halo diamond ring setting, round brilliant center, Bez Ambar',
  },
  // THREE-STONE → verified three-stone ring. C0536 (fancy yellow 3-stone) OR
  // C0746 white cushion three-stone. Use white three-stone for neutral.
  'three-stone-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/The_Staircase_ring_hsegrw'),
    ring: 'white three-stone ring',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/C0746_Cushion_Cut_White_eowaqf`,
    heroImageAlt: 'Three-stone diamond engagement ring, Bez Ambar',
  },
  // PRINCESS cut → NO true princess/square ring asset exists. Closest square-ish
  // geometric cut = Crossover Ashoka (square-ish faceting). Best-available ring.
  'princess-cut-diamond-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/Duet_Ashoka_jbgz8i'),
    ring: 'Ashoka (square-ish) — no true princess asset; best available',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/crossover-ashoka-white-hand`,
    heroImageAlt: 'Square-cut diamond ring, Bez Ambar',
  },
  // ROSE CUT → no verified rose-cut ring film; use an elegant white ring film as
  // best-available. C0728 pear solitaire (clean, classic).
  'rose-cut-diamond-rings-by-bez-ambar': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_1_smndkz'),
    ring: 'white solitaire (rose-cut analog; no rose-cut asset)',
    heroImage: `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/Jewelry%20Images/Rings/C0728_Pear_Cut_rjliml`,
    heroImageAlt: 'Rose cut style diamond ring, Bez Ambar',
  },
}
