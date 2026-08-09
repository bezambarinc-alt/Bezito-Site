// Batch-8 media (final 26) — VISION-VERIFIED, most suitable asset any type.
// Gems w/o dedicated asset (alexandrite/aquamarine/morganite/tourmaline/semi-
// precious) use best-available by color family; brand/store posts use atelier/
// portrait scenes. All flagged in note.
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

const TENNIS_NECK = img('Jewelry Images/Necklaces/single-row-lifestyle')       // station/tennis line
const PENDANT = img('Jewelry Images/Pendants/C0799_Round_Pendant_Fancy_yellow_Cushion_on_model')
const BLUE = img('Jewelry Images/Rings/ceylon-sapphire-1130-hero')             // blue sapphire
const PINK = img('Jewelry Images/Rings/C0747_Fancy_Very_Pink_Oval_top')        // pink
const GREEN = img('Jewelry Images/Rings/emerald-trapez-diamond-ring')          // green
const ATELIER = img('Jewelry Images/Atelier/casting-atelier-2026')
const PORTRAIT = img('Jewelry Images/Atelier/designer-portrait-2026')
const LOUPE = img('Jewelry Images/Atelier/jeweler-loupe-2026')
const LOOSE_ROUND = img('Jewelry Images/Legacy/divine-stone-alone')

export const MEDIA = {
  // ALEXANDRITE (color-change, teal/purple) → no asset; blue/violet best-available.
  'alexandrite-color-change-gemstone-guide': {
    heroVideo: null, note: 'blue/violet stand-in (no alexandrite asset)',
    heroImage: BLUE, heroImageAlt: 'Alexandrite color-change gemstone, Bez Ambar',
  },
  'alexandrite-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/VEO_video_of_neklace_with_saphire_and_emerald_uvplyv'),
    note: 'blue/violet stand-in (no alexandrite asset)',
    heroImage: BLUE, heroImageAlt: 'Alexandrite engagement ring, Bez Ambar',
  },
  // AQUAMARINE (blue) → aqua necklace film / blue stand-in.
  'aquamarine-jewelry-buying-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/fiona_aqua_nekclace_v2_1080p_musicn_mv9va5'),
    note: 'aqua necklace (aquamarine analog)',
    heroImage: BLUE, heroImageAlt: 'Aquamarine jewelry, Bez Ambar',
  },
  // BUYER BEWARE (brand) → designer portrait / authenticity.
  'authentic-bez-ambar-buyer-beware': {
    heroVideo: null, note: 'designer portrait (brand authenticity)',
    heroImage: PORTRAIT, heroImageAlt: 'Authentic Bez Ambar, buyer beware',
  },
  // BAR NECKLACE → linear/tennis-line necklace (closest to bar).
  'bar-necklace-fine-jewelry-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/baguette-by-the-yard-2026'),
    note: 'linear/bar necklace (baguette line)',
    heroImage: img('Jewelry Images/Necklaces/baguette-line-lifestyle'), heroImageAlt: 'Bar necklace, Bez Ambar',
  },
  // DIVINE CUT (Bez patented) → loose diamond / cut showcase.
  'bez-ambars-new-patented-design-divine-cut-diamond': {
    heroVideo: null, note: 'Divine cut (loose diamond / patented cut)',
    heroImage: img('Jewelry Images/Legacy/divine-stone-alone'), heroImageAlt: 'Bez Ambar Divine Cut diamond',
  },
  // BEZEL PENDANT → pendant.
  'bezel-set-diamond-pendant-guide': {
    heroVideo: vid('Jewelry Videos/Pendants/C0799_HD_b0hcxl'), note: 'bezel/pendant',
    heroImage: PENDANT, heroImageAlt: 'Bezel-set diamond pendant, Bez Ambar',
  },
  // BEZEL RING → bezel-set ring; best-available clean solitaire.
  'bezel-set-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'), note: 'bezel/solitaire ring',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'), heroImageAlt: 'Bezel-set engagement ring, Bez Ambar',
  },
  // BIRTHSTONE NECKLACE → colorful pendant/necklace.
  'birthstone-necklace-fine-jewelry-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/C0410_4k_jsu9jm'), note: 'colored pendant necklace',
    heroImage: PENDANT, heroImageAlt: 'Birthstone necklace, Bez Ambar',
  },
  // BLAZE HALO (Bez patented accent) → halo ring.
  'blaze-halo-setting-makes-diamond-look-bigger': {
    heroVideo: vid('Jewelry Videos/Rings/C0737-_4K_b2l126'), note: 'Blaze halo ring',
    heroImage: img('Jewelry Images/Legacy/10-carat-emerald-cut-diamond-ring-with-blaze'),
    heroImageAlt: 'Blaze halo setting, Bez Ambar',
  },
  // CEYLON SAPPHIRE → blue sapphire.
  'ceylon-sapphire-origin-guide': {
    heroVideo: null, note: 'ceylon blue sapphire',
    heroImage: img('Jewelry Images/Rings/ceylon-sapphire-1130-model'), heroImageAlt: 'Ceylon sapphire origin, Bez Ambar',
  },
  // SEMI-PRECIOUS → mixed colored stones; use a colored-gem piece.
  'choosing-semi-precious-stones': {
    heroVideo: null, note: 'colored gemstone (semi-precious)',
    heroImage: PINK, heroImageAlt: 'Semi-precious stones, Bez Ambar',
  },
  // EAR CLIMBER → climber earring verified (Ascent).
  'ear-climber-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/c0845-hd'), note: 'climber earrings',
    heroImage: img('Jewelry Images/Earrings/Ascent_ebedxy'), heroImageAlt: 'Ear climber earrings, Bez Ambar',
  },
  // HUGGIE → small hoop earring; best-available hoop.
  'huggie-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/3hoop30rb-2026'), note: 'hoop/huggie earrings',
    heroImage: img('Jewelry Images/Earrings/C0366-corona-rounds-top'), heroImageAlt: 'Huggie earrings, Bez Ambar',
  },
  // INVISIBLE SETTING (Bez innovation) → invisible-set ring.
  'invisible-setting-for-diamonds-a-bez-ambar-innovation': {
    heroVideo: null, note: 'invisible-setting ring (craftsmanship)',
    heroImage: ATELIER, heroImageAlt: 'Invisible setting for diamonds, Bez Ambar innovation',
  },
  // LAB SAPPHIRE VS NATURAL → sapphire.
  'lab-created-sapphire-vs-natural-sapphire': {
    heroVideo: null, note: 'blue sapphire (lab vs natural)',
    heroImage: BLUE, heroImageAlt: 'Lab-created vs natural sapphire, Bez Ambar',
  },
  // LAYERING NECKLACES → necklace(s).
  'layering-fine-jewelry-necklaces': {
    heroVideo: vid('Jewelry Videos/Necklaces/C0508_4k_noykv3'), note: 'necklace (layering)',
    heroImage: TENNIS_NECK, heroImageAlt: 'Layering fine jewelry necklaces, Bez Ambar',
  },
  // MORGANITE (pink) → pink stand-in.
  'morganite-gemstone-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0747-hd-2026'), note: 'pink stand-in (no morganite asset)',
    heroImage: PINK, heroImageAlt: 'Morganite gemstone, Bez Ambar',
  },
  // ONLINE JEWELRY STORES (guide) → atelier/loupe expertise.
  'online-jewelry-stores': {
    heroVideo: null, note: 'loupe/expertise (buying online)',
    heroImage: LOUPE, heroImageAlt: 'Buying from online jewelry stores, Bez Ambar',
  },
  // SOLITAIRE PENDANT → pendant.
  'solitaire-diamond-pendant-guide': {
    heroVideo: vid('Jewelry Videos/Pendants/4k_C0701_nbxvqc'), note: 'solitaire pendant',
    heroImage: PENDANT, heroImageAlt: 'Solitaire diamond pendant, Bez Ambar',
  },
  // STATION NECKLACE → station/spaced necklace.
  'station-diamond-necklace-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/baguette-by-the-yard-2026'), note: 'station necklace',
    heroImage: TENNIS_NECK, heroImageAlt: 'Station diamond necklace, Bez Ambar',
  },
  // LA DIAMOND DISTRICT (guide/location) → atelier/portrait LA context.
  'the-los-angeles-diamond-district': {
    heroVideo: null, note: 'atelier/LA context',
    heroImage: ATELIER, heroImageAlt: 'The Los Angeles diamond district, Bez Ambar',
  },
  // TOURMALINE (varied color, often green/pink) → colored gem stand-in.
  'tourmaline-jewelry-guide': {
    heroVideo: null, note: 'colored gem (tourmaline stand-in; no tourmaline asset)',
    heroImage: GREEN, heroImageAlt: 'Tourmaline jewelry, Bez Ambar',
  },
  // WHAT TO ASK A JEWELER (guide) → loupe/consultation.
  'what-to-ask-a-jeweler-consultation': {
    heroVideo: null, note: 'loupe/consultation',
    heroImage: LOUPE, heroImageAlt: 'What to ask a jeweler, Bez Ambar',
  },
  // WHITE GOLD HOOPS → hoop earrings (white).
  'white-gold-diamond-hoop-earrings': {
    heroVideo: vid('Jewelry Videos/Earrings/3hoop30rb-2026'), note: 'white gold hoops',
    heroImage: img('Jewelry Images/Earrings/C0366-corona-rounds-top'), heroImageAlt: 'White gold diamond hoop earrings, Bez Ambar',
  },
  // YELLOW GOLD EARRINGS → warm-gold earrings (fancy-yellow studs).
  'yellow-gold-diamond-earrings-guide': {
    heroVideo: vid('Jewelry Videos/Earrings/C0513_HD_juellw'), note: 'yellow-gold earrings',
    heroImage: img('Jewelry Images/Earrings/C0513_Fancy_Yellow_Earrings_top'), heroImageAlt: 'Yellow gold diamond earrings, Bez Ambar',
  },
}
