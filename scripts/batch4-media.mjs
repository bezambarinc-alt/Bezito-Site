// Batch-4 media (the 20-batch) — MOST SUITABLE ASSET, ANY TYPE, VISION-VERIFIED.
// Where a gemstone has NO dedicated asset (aquamarine/morganite/tanzanite/garnet/
// opal/amethyst), pick best-available by COLOR FAMILY + shape, flagged in note.
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

export const MEDIA = {
  // TENSION-SET → clean white solitaire (tension look ~ floating stone). C0728.
  'tension-set-diamond-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_epjtts'),
    note: 'white solitaire (tension-set analog)',
    heroImage: img('Jewelry Images/Rings/C0728_Pear_Cut_rjliml'),
    heroImageAlt: 'Tension-set diamond ring, Bez Ambar',
  },
  // PEAR-SHAPED EARRINGS → drop/pear earrings verified (C0670 triad drop, pear).
  'pear-shaped-diamond-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0670-triad-drop'),
    note: 'pear drop earrings',
    heroImage: img('Jewelry Images/Earrings/pear_emerald_drop_earring'),
    heroImageAlt: 'Pear-shaped diamond earrings, Bez Ambar',
  },
  // DIAMOND HOOPS → hoop earrings verified (3hoop30rb round hoops).
  'diamond-hoop-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/3hoop30rb-2026'),
    note: 'diamond hoop earrings',
    heroImage: img('Jewelry Images/Earrings/C0366-corona-rounds-top'),
    heroImageAlt: 'Diamond hoop earrings, Bez Ambar',
  },
  // DIAMOND DROP EARRINGS → drop earrings verified (C0670 triad drop).
  'diamond-drop-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0670-triad-drop'),
    note: 'diamond drop earrings',
    heroImage: img('Jewelry Images/Earrings/model_for_drop_down_earrings_bfb2zz'),
    heroImageAlt: 'Diamond drop earrings, Bez Ambar',
  },
  // CHANDELIER EARRINGS → no true chandelier; best-available = most elaborate drop
  // earrings (R09059 halo studs / triad drop). Flagged.
  'chandelier-diamond-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0670-triad-drop'),
    note: 'elaborate drop earrings (chandelier stand-in; no chandelier asset)',
    heroImage: img('Jewelry Images/Earrings/goldberg-giant-earrings-2_ew5gj1'),
    heroImageAlt: 'Chandelier diamond earrings, Bez Ambar',
  },
  // RUBY GEMSTONE → red ruby ring verified (C0867).
  'ruby-gemstone-buying-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0867_ev3hlv'),
    note: 'red ruby ring',
    heroImage: img('Jewelry Images/Rings/RUBY_WITH_PEAR_HALO_joqxqi'),
    heroImageAlt: 'Ruby gemstone jewelry, Bez Ambar',
  },
  // SAPPHIRE ENGAGEMENT → blue sapphire ring verified (ceylon-sapphire pear 3-stone).
  'sapphire-engagement-rings-yes-no': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'blue sapphire piece (ceylon sapphire ring image hero)',
    heroImage: img('Jewelry Images/Rings/ceylon-sapphire-1130-hero'),
    heroImageAlt: 'Blue sapphire engagement ring, Bez Ambar',
  },
  // AQUAMARINE → no aquamarine asset; best-available blue-family = blue sapphire ring.
  'aquamarine-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/fiona_aqua_nekclace_v2_1080p_musicn_mv9va5'),
    note: 'aqua/blue piece (fiona aqua necklace; no aquamarine ring asset)',
    heroImage: img('Jewelry Images/Rings/ceylon-sapphire-1130-hero'),
    heroImageAlt: 'Aquamarine engagement ring, Bez Ambar',
  },
  // MORGANITE → no morganite asset; best-available pink-family = fancy pink oval ring.
  'morganite-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/Pink_Oval_Ring_C0747_2026_1080p'),
    note: 'pink oval ring (morganite stand-in; no morganite asset)',
    heroImage: img('Jewelry Images/Rings/C0747_Fancy_Very_Pink_Oval_top'),
    heroImageAlt: 'Morganite engagement ring, Bez Ambar',
  },
  // TANZANITE → no tanzanite asset; best-available blue/violet = sapphire piece.
  'tanzanite-jewelry-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'blue/violet piece (tanzanite stand-in; no tanzanite asset)',
    heroImage: img('Jewelry Images/Rings/Lindiy_Ring_Sapphire_Mustard_4000x4000_Radial_qdidm7'),
    heroImageAlt: 'Tanzanite jewelry, Bez Ambar',
  },
  // GARNET → no garnet asset; best-available red-family = ruby ring.
  'garnet-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0867_ev3hlv'),
    note: 'red gem ring (garnet stand-in; no garnet asset)',
    heroImage: img('Jewelry Images/Rings/Ruby-ring-with-flower_pr0ylm'),
    heroImageAlt: 'Garnet engagement ring, Bez Ambar',
  },
  // OPAL → no opal asset; best-available = a colorful/iridescent piece. Use a
  // fancy-color ring as neutral stand-in. Flagged.
  'opal-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0747_Fancy_Very_Pink_Oval_2026_1080p'),
    note: 'fancy-color ring (opal stand-in; no opal asset)',
    heroImage: img('Jewelry Images/Rings/Pink-Ice_luevbt'),
    heroImageAlt: 'Opal engagement ring, Bez Ambar',
  },
  // AMETHYST → no amethyst asset; best-available purple/violet = sapphire radial.
  'amethyst-jewelry-buying-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'purple/violet piece (amethyst stand-in; no amethyst asset)',
    heroImage: img('Jewelry Images/Rings/Lindiy_Ring_Sapphire_Mustard_4000x4000_Radial_qdidm7'),
    heroImageAlt: 'Amethyst jewelry, Bez Ambar',
  },
  // RETURN OF PEAR → pear ring verified (C0728 pear solitaire).
  'the-return-of-pear-shaped-diamond-rings': {
    heroVideo: vid('Jewelry Videos/Rings/C0728_4K_1_smndkz'),
    note: 'pear solitaire ring',
    heroImage: img('Jewelry Images/Rings/C0728_Pear_Cut_rjliml'),
    heroImageAlt: 'Pear-shaped diamond ring, Bez Ambar',
  },
  // BLACK DIAMOND → black/dark rounds verified (B5671 black rounds bracelet).
  'black-diamond-jewelry': {
    heroVideo: vid('Jewelry Videos/Bracelets/B5671_-_website_hqryhf'),
    note: 'black diamond bracelet (B5671 black rounds)',
    heroImage: img('Jewelry Images/Bracelets/B5671_Bracelet_Black_Rounds_ModelHand_aeajqu'),
    heroImageAlt: 'Black diamond jewelry, Bez Ambar',
  },
  // CHOCOLATE BROWN → brown ring verified (C0752 deep-brown cushion) — finally the
  // RIGHT home for the brown 3-stone that was miscast on the 1-carat post.
  'chocolate-brown-diamond-rings': {
    heroVideo: vid('Jewelry Videos/Rings/c0752-ring-2026'),
    note: 'chocolate-brown cushion ring (C0752 — correct home for the brown piece)',
    heroImage: img('Jewelry Images/Rings/C0752_Fancy_Deep_Brownish_Yellow_Cushion_top'),
    heroImageAlt: 'Chocolate brown diamond ring, Bez Ambar',
  },
  // FANCY INTENSE BLUE → blue diamond/sapphire piece. Sapphire ring best-available.
  'fancy-intense-blue-diamond-ring': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'fancy blue piece (no blue diamond ring film; sapphire ring image)',
    heroImage: img('Jewelry Images/Rings/ceylon-sapphire-1130-hero'),
    heroImageAlt: 'Fancy intense blue diamond ring, Bez Ambar',
  },
}
