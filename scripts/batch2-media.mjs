// Batch-2 media — MOST SUITABLE ASSET, ANY TYPE, VISION-VERIFIED (looked at
// each frame/image, not the filename). Rule (Kevin, 2026-08-08).
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

export const MEDIA = {
  // 2-CARAT → larger white solitaire/halo. C0681 = white radiant solitaire (clean, larger center).
  'two-carat-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/C0681_4k_sjtbg7'),
    note: 'white radiant solitaire (larger center)',
    heroImage: img('Jewelry Images/Rings/C0746_Cushion_Cut_White_eowaqf'),
    heroImageAlt: 'Two-carat diamond engagement ring, Bez Ambar',
  },
  // 3-CARAT → larger center white ring. c0578 = white radiant/cushion halo (presence).
  'three-carat-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/c0578_4k_v1_2160p_wwnfcz'),
    note: 'white radiant/cushion halo (large presence)',
    heroImage: img('Jewelry Images/Rings/Pargon_Ring_2_smllwa'),
    heroImageAlt: 'Three-carat diamond engagement ring, Bez Ambar',
  },
  // CUSHION cut → cushion center ring. elliot-cushion verified cushion ring.
  'cushion-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/elliot-cushion-ring-2026'),
    note: 'cushion center ring',
    heroImage: img('Jewelry Images/Rings/C0746_Cushion_Cut_White_eowaqf'),
    heroImageAlt: 'Cushion cut diamond engagement ring, Bez Ambar',
  },
  // PAVE → oval halo w/ pavé shank verified (elliot/oval C0895-class). Use oval pave film.
  'pave-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/elliot-cushion-ring-2026'),
    note: 'halo + pave shank ring',
    heroImage: img('Jewelry Images/Rings/C0737_Round_Cut_tm5oal'),
    heroImageAlt: 'Pave-set diamond engagement ring, Bez Ambar',
  },
  // BLAZE cut (Bez patented accent) → no isolated Blaze asset; use a brilliant
  // white ring film as best-available (Blaze is an accent stone around a center).
  'blaze-cut-diamond': {
    heroVideo: vid('Jewelry Videos/Rings/C0737-_4K_b2l126'),
    note: 'halo ring (Blaze accent context; no isolated Blaze asset)',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Diamond ring with Blaze accent stones, Bez Ambar',
  },
  // BLUE SAPPHIRE → blue sapphire piece verified (VEO sapphire necklace).
  'blue-sapphire-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'blue sapphire piece (no sapphire ring film; sapphire pendant)',
    heroImage: img('Jewelry Images/Rings/Celestara_copy_qesetb'),
    heroImageAlt: 'Blue sapphire engagement ring, Bez Ambar',
  },
  // TENNIS NECKLACE → station/tennis-line necklace verified (baguette-by-the-yard).
  'diamond-tennis-necklace-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/baguette-by-the-yard-2026'),
    note: 'station/tennis-line necklace',
    heroImage: img('Jewelry Images/Necklaces/single-row-lifestyle'),
    heroImageAlt: 'Diamond tennis necklace, line of stones, Bez Ambar',
  },
  // FANCY YELLOW → fancy-yellow center ring verified (C0878 fancy-yellow radiant).
  'fancy-yellow-diamond-rings': {
    heroVideo: vid('Jewelry Videos/Rings/C0878_zocjks'),
    note: 'fancy-yellow radiant three-stone ring',
    heroImage: img('Jewelry Images/Rings/C0878_Ring_Fancy_Yellow_Cushion_OnModel_xlm3su'),
    heroImageAlt: 'Fancy yellow diamond ring, Bez Ambar',
  },
  // ANNIVERSARY / ETERNITY → eternity band verified. R09143 = round eternity/tennis.
  'anniversary-rings-wedding-rings-eternity-rings': {
    heroVideo: vid('Jewelry Videos/Rings/R09143_2026'),
    note: 'round eternity band',
    heroImage: img('Jewelry Images/Rings/Atallier-round-diamond-center_rneipf'),
    heroImageAlt: 'Diamond eternity anniversary ring, Bez Ambar',
  },
  // ROUND BRILLIANT → round white solitaire verified (b9558 / C0731).
  'round-brilliant-cut-diamond-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    note: 'round white solitaire',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Round brilliant cut diamond ring, Bez Ambar',
  },
}
