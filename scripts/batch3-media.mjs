// Batch-3 media — MOST SUITABLE ASSET, ANY TYPE, VISION-VERIFIED (looked at
// each frame/image, not the filename). Rule (Kevin, 2026-08-08).
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

export const MEDIA = {
  // HALF-CARAT → small clean white solitaire (round). b9558/C0731 verified solitaire.
  'half-carat-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    note: 'round white solitaire (petite)',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Half-carat diamond engagement ring, Bez Ambar',
  },
  // 5-CARAT → largest-presence white ring. c0578 white radiant/cushion halo (biggest presence).
  '5-carat-diamond-ring': {
    heroVideo: vid('Jewelry Videos/Rings/c0578_4k_v1_2160p_wwnfcz'),
    note: 'white radiant/cushion halo (max presence)',
    heroImage: img('Jewelry Images/Rings/Pargon_Ring_2_smllwa'),
    heroImageAlt: 'Five-carat diamond ring, Bez Ambar',
  },
  // MARQUISE → no true marquise ring asset. Best-available = pear solitaire
  // (elongated fancy shape, closest silhouette). C0728 pear.
  'marquise-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_1_smndkz'),
    note: 'pear solitaire (marquise stand-in; no marquise asset)',
    heroImage: img('Jewelry Images/Rings/C0728_Pear_Cut_rjliml'),
    heroImageAlt: 'Marquise cut diamond engagement ring, Bez Ambar',
  },
  // RADIANT → white radiant solitaire verified (C0681 radiant).
  'radiant-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/C0681_4k_sjtbg7'),
    note: 'white radiant solitaire',
    heroImage: img('Jewelry Images/Rings/c0895-fancy-yellow-radiant-top-square'),
    heroImageAlt: 'Radiant cut diamond engagement ring, Bez Ambar',
  },
  // HEART → no true heart ring asset; best-available = heart PENDANT (heart shape
  // is the accurate signal). 20crt heart-shaped diamond pendant image.
  'heart-shaped-diamond-ring': {
    heroVideo: vid('Jewelry Videos/Pendants/c0346-hd'),
    note: 'heart pendant (heart-shape stand-in; no heart ring asset)',
    heroImage: img('Jewelry Images/Pendants/20_crt_Heart_Shaped_Diamond_eq7pwp'),
    heroImageAlt: 'Heart shaped diamond jewelry, Bez Ambar',
  },
  // SOLITAIRE → the definitive plain white solitaire (C0728 pear pave solitaire / b9558).
  'solitaire-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_epjtts'),
    note: 'white solitaire',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Solitaire diamond engagement ring, Bez Ambar',
  },
  // SPLIT-SHANK → split-shank ring verified (C0367 Reverie = halo/three-stone split-shank).
  'split-shank-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/C0367-reverie-hd'),
    note: 'split-shank halo ring',
    heroImage: img('Jewelry Images/Rings/C0367-REVERIE-Top'),
    heroImageAlt: 'Split-shank diamond engagement ring, Bez Ambar',
  },
  // DIAMOND PENDANT → pendant verified (C0799 round diamond pendant).
  'diamond-pendant-necklaces': {
    heroVideo: vid('Jewelry Videos/Pendants/C0799_HD_b0hcxl'),
    note: 'diamond pendant',
    heroImage: img('Jewelry Images/Pendants/C0799_Round_Pendant_Fancy_yellow_Cushion_on_model'),
    heroImageAlt: 'Diamond pendant necklace, Bez Ambar',
  },
  // ETERNITY BRACELET → eternity/tennis bracelet verified (Asscher double-row / C0754).
  'diamond-eternity-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/asscher-cut-double-row-bracelet-c0754-2026'),
    note: 'eternity bracelet',
    heroImage: img('Jewelry Images/Bracelets/C0754_Bracelet_Asscher_OnHand_kqsow7'),
    heroImageAlt: 'Diamond eternity bracelet, Bez Ambar',
  },
  // EMERALD ENGAGEMENT (emerald-cut / green emerald) → green emerald center ring
  // (verified 4k_C0721 green emerald).
  'should-you-buy-emerald-engagement-rings': {
    heroVideo: vid('Jewelry Videos/Rings/4k_C0721_cwwztv'),
    note: 'green emerald center ring',
    heroImage: img('Jewelry Images/Rings/emerald-trapez-diamond-ring'),
    heroImageAlt: 'Emerald engagement ring, Bez Ambar',
  },
}
