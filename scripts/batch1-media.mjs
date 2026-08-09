// Batch-1 media — MOST SUITABLE ASSET, ANY TYPE (ring/bracelet/necklace),
// video or image. Every pick VISION-VERIFIED (I looked at the frame/image, not
// the filename). Rule (Kevin, 2026-08-08): best match by appearance; type-true
// where the post is about a specific piece type (tennis→bracelet, flex→bracelet).
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`
const vposter = (id) => `${CLOUD}/video/upload/so_1,c_fill,ar_16:9,w_1400/${encodeURI(id)}.jpg`

export const MEDIA = {
  // 1-CARAT solitaire → round WHITE SOLITAIRE single-stone (verified C0731).
  'why-a-1-carat-diamond': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    ring: 'round white solitaire',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'One-carat round brilliant diamond solitaire ring, Bez Ambar',
  },
  // TENNIS BRACELET → actual single-row round-brilliant tennis bracelet
  // (verified C0722_5FLX34R = textbook single-row tennis line).
  'diamond-tennis-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/C0722_5FLX34R_4k_vuejsf'),
    ring: 'single-row round tennis bracelet',
    heroImage: img('Jewelry Images/Bracelets/B5671_Bracelet_Black_Rounds_ModelHand_aeajqu'),
    heroImageAlt: 'Diamond tennis bracelet, single row of round brilliants, Bez Ambar',
  },
  // EMERALD gemstone → ring with GREEN EMERALD center (verified 4k_C0721 green).
  'emerald-gemstone-buying-guide': {
    heroVideo: vid('Jewelry Videos/Rings/4k_C0721_cwwztv'),
    ring: 'green emerald center ring',
    heroImage: img('Jewelry Images/Rings/emerald-trapez-diamond-ring'),
    heroImageAlt: 'Emerald center ring, vivid green gemstone, Bez Ambar',
  },
  // RUBY engagement RING → red ruby RING (verified C0867 ruby ring).
  'ruby-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0867_ev3hlv'),
    ring: 'red ruby halo ring',
    heroImage: img('Jewelry Images/Rings/RUBY_WITH_PEAR_HALO_joqxqi'),
    heroImageAlt: 'Ruby engagement ring, red center with diamond halo, Bez Ambar',
  },
  // OVAL engagement → oval center ring (verified C0747 oval + Pargon oval white).
  'oval-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/Pink_Oval_Ring_C0747_2026_1080p'),
    ring: 'oval center ring',
    heroImage: img('Jewelry Images/Rings/Pargon_ring_2.5_carat_center_1_b8zl0o'),
    heroImageAlt: 'Oval cut diamond engagement ring, Bez Ambar',
  },
  // FLEX bracelet (Bez's own line) → actual multi-row round-brilliant Flex
  // bracelet (verified B5993 = multi-row flex, most sparkle).
  'diamond-flex-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/Multi_Row_Round_Diamond_Bracelet_B5993_2026_1080p_with_effects'),
    ring: 'multi-row round Flex bracelet',
    heroImage: img('Jewelry Images/Bracelets/5FLX40-on-black'),
    heroImageAlt: 'Diamond Flex bracelet by Bez Ambar',
  },
  // HALO setting → round WHITE HALO (verified C0737 halo).
  'halo-ring-setting': {
    heroVideo: vid('Jewelry Videos/Rings/C0737-_4K_b2l126'),
    ring: 'round white halo',
    heroImage: img('Jewelry Images/Rings/C0737_Round_Cut_tm5oal'),
    heroImageAlt: 'Halo diamond ring setting, round brilliant center, Bez Ambar',
  },
  // THREE-STONE → white three-stone ring (verified C0746 white cushion 3-stone;
  // The_Staircase film = emerald-cut three-stone).
  'three-stone-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/The_Staircase_ring_hsegrw'),
    ring: 'white three-stone ring',
    heroImage: img('Jewelry Images/Rings/C0746_Cushion_Cut_White_eowaqf'),
    heroImageAlt: 'Three-stone diamond engagement ring, Bez Ambar',
  },
  // PRINCESS/SQUARE cut → no true princess ring; best square-facet stand-in is
  // the Asscher/square-emerald SINGLE-ROW bracelet (verified square facets
  // read closest to princess/square). Type differs but stone-shape is the
  // accurate signal for a "square cut" article.
  'princess-cut-diamond-ring-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/asscher-cut-single-row-bracelet-c0755-2026'),
    ring: 'Asscher/square-cut (best square stand-in; no true princess asset)',
    heroImage: img('Jewelry Images/Bracelets/C0754_Bracelet_Asscher_OnHand_kqsow7'),
    heroImageAlt: 'Square-cut diamond jewelry, Bez Ambar',
  },
  // ROSE CUT → no true rose-cut asset. Best-available = clean classic white
  // solitaire still (C0728 pear) — image, since no rose-cut video exists.
  'rose-cut-diamond-rings-by-bez-ambar': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_1_smndkz'),
    ring: 'white solitaire (rose-cut stand-in; no rose-cut asset)',
    heroImage: img('Jewelry Images/Rings/C0728_Pear_Cut_rjliml'),
    heroImageAlt: 'Rose cut style diamond ring, Bez Ambar',
  },
}
