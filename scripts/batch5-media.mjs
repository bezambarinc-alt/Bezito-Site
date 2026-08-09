// Batch-5 media (education/technical) — VISION-VERIFIED. Concept posts (clarity,
// color, anatomy, certification, cut quality) have no single "piece" hero, so:
//   - grading/quality/anatomy → loose-diamond or atelier-expertise hero
//   - certification/expertise → jeweler-loupe atelier scene
//   - cut-specific (asscher/trillion/baguette/round) → matching-cut ring where real
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

// strong generic education heroes (verified)
const LOOSE_ROUND = img('Jewelry Images/Legacy/divine-stone-alone')           // loose round brilliant, clean cert hero
const LOUPE = img('Jewelry Images/Atelier/jeweler-loupe-2026')                 // jeweler w/ loupe — expertise/cert
const CUT_WHEEL = img('Jewelry Images/Atelier/diamond-cutting-wheel-45deg')    // cutting wheel — cut/anatomy
const CHART = img('Jewelry Images/Legacy/size_diameter_carat-weight_chart')    // carat/size chart

export const MEDIA = {
  'diamond-clarity-explained': {
    heroVideo: null, note: 'loose round diamond (clarity)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Diamond clarity, loose round brilliant, Bez Ambar',
  },
  'diamond-color-grade-explained': {
    heroVideo: null, note: 'loose round diamond (color grade)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Diamond color grade, Bez Ambar',
  },
  'diamond-anatomy-explained': {
    heroVideo: null, note: 'cutting wheel / anatomy',
    heroImage: CUT_WHEEL, heroImageAlt: 'Diamond anatomy, facets and proportions, Bez Ambar',
  },
  'ideal-cut-diamond-explained': {
    heroVideo: null, note: 'cutting wheel (cut quality)',
    heroImage: CUT_WHEEL, heroImageAlt: 'Ideal cut diamond, Bez Ambar',
  },
  'diamond-fluorescence-guide': {
    heroVideo: null, note: 'loose round diamond (fluorescence)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Diamond fluorescence, Bez Ambar',
  },
  'diamond-inclusion-types-guide': {
    heroVideo: null, note: 'loupe (inclusions)',
    heroImage: LOUPE, heroImageAlt: 'Diamond inclusions under loupe, Bez Ambar',
  },
  'gia-vs-ags-diamond-certification': {
    heroVideo: null, note: 'loupe / certification expertise',
    heroImage: LOUPE, heroImageAlt: 'GIA vs AGS diamond certification, Bez Ambar',
  },
  'how-to-read-diamond-grading-report': {
    heroVideo: null, note: 'loupe / grading report',
    heroImage: LOUPE, heroImageAlt: 'Reading a diamond grading report, Bez Ambar',
  },
  'diamond-shape-vs-cut-difference': {
    heroVideo: null, note: 'cutting wheel (shape vs cut)',
    heroImage: CUT_WHEEL, heroImageAlt: 'Diamond shape vs cut, Bez Ambar',
  },
  'lab-grown-vs-natural-diamond-guide': {
    heroVideo: null, note: 'loose round diamond (lab vs natural)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Lab-grown vs natural diamond, Bez Ambar',
  },
  'lab-grown-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'), note: 'white solitaire ring',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Lab-grown diamond engagement ring, Bez Ambar',
  },
  'moissanite-vs-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'), note: 'white solitaire ring',
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Moissanite vs diamond engagement ring, Bez Ambar',
  },
  'conflict-free-diamonds-guide': {
    heroVideo: null, note: 'loose round diamond (provenance)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Conflict-free diamonds, Bez Ambar',
  },
  'diamonds-as-investment-guide': {
    heroVideo: null, note: 'loose round diamond (investment)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Diamonds as investment, Bez Ambar',
  },
  'internally-flawless-diamond-worth-it': {
    heroVideo: null, note: 'loupe (IF clarity)',
    heroImage: LOUPE, heroImageAlt: 'Internally flawless diamond, Bez Ambar',
  },
  // TRILLION → trillion/triangle cut. Elysian triangle stone verified triangle shape.
  'trillion-cut-diamond-guide': {
    heroVideo: null, note: 'triangle/trillion stone',
    heroImage: img('Jewelry Images/Stones/Elysian_cut_triangle_rtmluh'),
    heroImageAlt: 'Trillion cut diamond, Bez Ambar',
  },
  // ASSCHER → square step-cut. Asscher bracelet verified square facets.
  'what-is-an-asscher-cut-diamond': {
    heroVideo: vid('Jewelry Videos/Bracelets/asscher-cut-single-row-bracelet-c0755-2026'),
    note: 'asscher/square step-cut',
    heroImage: img('Jewelry Images/Bracelets/C0754_Bracelet_Asscher_OnHand_kqsow7'),
    heroImageAlt: 'Asscher cut diamond, Bez Ambar',
  },
  // BAGUETTE → baguette line. baguette-by-the-yard necklace verified baguette line.
  'baguette-diamond-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/baguette-by-the-yard-2026'),
    note: 'baguette line',
    heroImage: img('Jewelry Images/Necklaces/baguette-line-lifestyle'),
    heroImageAlt: 'Baguette diamonds, Bez Ambar',
  },
  // ROUND BRILLIANT CUT QUALITY → cutting wheel + round solitaire.
  'round-brilliant-diamond-cut-quality': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'), note: 'round brilliant (cut quality)',
    heroImage: LOOSE_ROUND, heroImageAlt: 'Round brilliant cut quality, Bez Ambar',
  },
  'diamond-weight-vs-face-up-size': {
    heroVideo: null, note: 'carat/size chart',
    heroImage: CHART, heroImageAlt: 'Diamond weight vs face-up size, Bez Ambar',
  },
}
