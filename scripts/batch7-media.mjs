// Batch-7 media (art-deco/vintage/colored-diamond/old-cut/princess/earrings) — VISION-VERIFIED.
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

const PINK_ARTDECO = img('Jewelry Images/Rings/C0367-REVERIE-Top')          // pink art-deco halo split-shank
const VINTAGE_YELLOW = img('Jewelry Images/Legacy/fancy-colored-diamond-jewelry') // fancy-yellow vintage
const BLUE_DIAMOND = img('Jewelry Images/Legacy/fancy-intense-blue-diamond-ring')  // intense blue 3-stone
const CROSSOVER = img('Jewelry Images/Rings/crossover-ashoka-yellow-stack')  // crossover/unusual
const YELLOW_EARR = img('Jewelry Images/Earrings/C0513_Fancy_Yellow_Earrings_top')

export const MEDIA = {
  'art-deco-engagement-rings': {
    heroVideo: vid('Jewelry Videos/Rings/C0367-reverie-hd'), note: 'art-deco pink halo split-shank',
    heroImage: PINK_ARTDECO, heroImageAlt: 'Art Deco engagement ring, Bez Ambar',
  },
  'vintage-antique-engagement-rings': {
    heroVideo: null, note: 'fancy-yellow vintage ring',
    heroImage: VINTAGE_YELLOW, heroImageAlt: 'Vintage antique engagement ring, Bez Ambar',
  },
  'engagement-rings-for-women-heirloom-or-new': {
    heroVideo: vid('Jewelry Videos/Rings/C0367-reverie-hd'), note: 'heirloom-style halo ring',
    heroImage: PINK_ARTDECO, heroImageAlt: 'Heirloom or new engagement ring, Bez Ambar',
  },
  'promise-ring-vs-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'), note: 'delicate solitaire',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'), heroImageAlt: 'Promise ring vs engagement ring, Bez Ambar',
  },
  'when-to-upgrade-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/c0578_4k_v1_2160p_wwnfcz'), note: 'larger upgrade ring',
    heroImage: img('Jewelry Images/Rings/Pargon_Ring_2_smllwa'), heroImageAlt: 'Upgrading an engagement ring, Bez Ambar',
  },
  'right-hand-diamond-ring-guide': {
    heroVideo: null, note: 'crossover/right-hand statement ring',
    heroImage: CROSSOVER, heroImageAlt: 'Right-hand diamond ring, Bez Ambar',
  },
  'unusual-engagement-rings-round-crossover': {
    heroVideo: null, note: 'crossover/unusual ring',
    heroImage: CROSSOVER, heroImageAlt: 'Unusual round crossover engagement ring, Bez Ambar',
  },
  'is-a-pink-diamond-engagement-ring-right-for-you': {
    heroVideo: vid('Jewelry Videos/Rings/C0747-hd-2026'), note: 'pink diamond ring',
    heroImage: img('Jewelry Images/Rings/C0747_Fancy_Very_Pink_Oval_top'), heroImageAlt: 'Pink diamond engagement ring, Bez Ambar',
  },
  'fancy-colored-diamond-jewelry': {
    heroVideo: null, note: 'fancy-colored diamond piece',
    heroImage: VINTAGE_YELLOW, heroImageAlt: 'Fancy colored diamond jewelry, Bez Ambar',
  },
  'blue-diamond-rings': {
    heroVideo: null, note: 'intense blue diamond ring',
    heroImage: BLUE_DIAMOND, heroImageAlt: 'Blue diamond ring, Bez Ambar',
  },
  'blue-diamond-ring-vs-blue-sapphire-diamond-ring': {
    heroVideo: null, note: 'blue diamond vs sapphire',
    heroImage: BLUE_DIAMOND, heroImageAlt: 'Blue diamond vs blue sapphire ring, Bez Ambar',
  },
  // OLD MINE / OLD EUROPEAN → antique cushion/round; best-available cushion white.
  'old-mine-cut-old-european-cut': {
    heroVideo: vid('Jewelry Videos/Rings/elliot-cushion-ring-2026'), note: 'antique cushion (old-cut analog)',
    heroImage: img('Jewelry Images/Rings/C0746_Cushion_Cut_White_eowaqf'), heroImageAlt: 'Old mine and old European cut diamonds, Bez Ambar',
  },
  // QUADRILLION → Bez's square cut. Quadrillion loose stone verified square.
  'quadrillion-cut-different-princess-cut': {
    heroVideo: null, note: 'Quadrillion square stone',
    heroImage: img('Jewelry Images/Stones/Quadrillion_owciyv'), heroImageAlt: 'Quadrillion cut vs princess cut, Bez Ambar',
  },
  // PRINCESS INVENTOR → Bez's story; square cut. Quadrillion/asscher square.
  'princess-cut-diamond-inventor': {
    heroVideo: vid('Jewelry Videos/Bracelets/asscher-cut-single-row-bracelet-c0755-2026'), note: 'square cut (princess inventor)',
    heroImage: img('Jewelry Images/Stones/Quadrillion_owciyv'), heroImageAlt: 'Princess cut diamond inventor Bez Ambar',
  },
  // PRINCESS EARRINGS → square-cut earrings; best-available fancy-yellow studs.
  'princess-cut-diamond-earrings': {
    heroVideo: vid('Jewelry Videos/Earrings/R09059_4k_final_diylja'), note: 'square/radiant stud earrings',
    heroImage: YELLOW_EARR, heroImageAlt: 'Princess cut diamond earrings, Bez Ambar',
  },
  // CUSHION EARRINGS (video) → cushion earring. Legacy cushion earring image.
  'cushion-cut-diamond-earrings-video': {
    heroVideo: vid('Jewelry Videos/Earrings/C0863_an0qj1'), note: 'cushion/radiant stud earrings',
    heroImage: img('Jewelry Images/Legacy/cushion-cut-diamond-earring-of-fire'), heroImageAlt: 'Cushion cut diamond earrings, Bez Ambar',
  },
  // STUDS → stud earrings verified (R09059 studs).
  'choosing-your-diamond-earrings-studs': {
    heroVideo: vid('Jewelry Videos/Earrings/R09059_4k_final_diylja'), note: 'diamond stud earrings',
    heroImage: img('Jewelry Images/Earrings/R09059-top'), heroImageAlt: 'Choosing diamond stud earrings, Bez Ambar',
  },
  // OVAL EARRINGS → drop/oval earrings.
  'oval-diamond-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0670-triad-drop'), note: 'oval/drop earrings',
    heroImage: img('Jewelry Images/Earrings/model_for_drop_down_earrings_bfb2zz'), heroImageAlt: 'Oval diamond earrings, Bez Ambar',
  },
  // ROSE GOLD EARRINGS → warm-metal earrings; best-available fancy-yellow (warm) studs.
  'rose-gold-diamond-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0513_HD_juellw'), note: 'warm-gold earrings (rose-gold analog)',
    heroImage: YELLOW_EARR, heroImageAlt: 'Rose gold diamond earrings, Bez Ambar',
  },
}
