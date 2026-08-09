// Batch-6 media (guides: care/insurance/gold/mens/custom/ring-size) — VISION-VERIFIED.
// Process/care posts → atelier scenes; gold/metal guides → metal-appropriate pieces;
// storage → jewelry box; mens → tri-color mens band.
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

const ATELIER_CASTING = img('Jewelry Images/Atelier/casting-atelier-2026')     // molten gold pour — custom/care
const LOUPE = img('Jewelry Images/Atelier/jeweler-loupe-2026')                 // expertise/appraisal
const BOX = img('Jewelry Images/Atelier/bez-ambar-box-service')                // jewelry box — storage
const MENS_BAND = img('Jewelry Images/Legacy/unique-mens-wedding-band-bez-ambar-los-angeles') // tri-color mens
const CLEAN_WHEEL = img('Jewelry Images/Atelier/diamond-cutting-wheel-45deg')
const GOLD_BAND = img('Jewelry Images/Bands/C0625_Baguette_band_Master_e4azkj') // rose/gold baguette band

export const MEDIA = {
  'fine-jewelry-care-and-maintenance': {
    heroVideo: null, note: 'atelier care/expertise', heroImage: ATELIER_CASTING,
    heroImageAlt: 'Fine jewelry care and maintenance, Bez Ambar atelier',
  },
  'fine-jewelry-insurance-guide': {
    heroVideo: null, note: 'loupe/appraisal (insurance)', heroImage: LOUPE,
    heroImageAlt: 'Fine jewelry insurance, Bez Ambar',
  },
  'fine-jewelry-safe-storage-guide': {
    heroVideo: null, note: 'jewelry box (storage)', heroImage: BOX,
    heroImageAlt: 'Safe jewelry storage, Bez Ambar',
  },
  'how-to-clean-diamond-jewelry-at-home': {
    heroVideo: null, note: 'atelier/care', heroImage: ATELIER_CASTING,
    heroImageAlt: 'Cleaning diamond jewelry at home, Bez Ambar',
  },
  'traveling-with-fine-jewelry-guide': {
    heroVideo: null, note: 'jewelry box (travel/storage)', heroImage: BOX,
    heroImageAlt: 'Traveling with fine jewelry, Bez Ambar',
  },
  'jewelry-appraisal-how-it-works': {
    heroVideo: null, note: 'loupe/appraisal', heroImage: LOUPE,
    heroImageAlt: 'Jewelry appraisal, Bez Ambar',
  },
  'what-to-do-with-a-chipped-diamond': {
    heroVideo: null, note: 'loupe (chipped diamond)', heroImage: LOUPE,
    heroImageAlt: 'Chipped diamond repair, Bez Ambar',
  },
  'custom-jewelry-design-process': {
    heroVideo: null, note: 'atelier casting (custom design)', heroImage: ATELIER_CASTING,
    heroImageAlt: 'Custom jewelry design process, Bez Ambar atelier',
  },
  'how-long-does-custom-jewelry-take': {
    heroVideo: null, note: 'atelier casting (custom timeline)', heroImage: ATELIER_CASTING,
    heroImageAlt: 'Custom jewelry timeline, Bez Ambar',
  },
  // MENS WEDDING BAND → tri-color mens band verified.
  'mens-wedding-band-buying-guide': {
    heroVideo: null, note: 'mens tri-color band', heroImage: MENS_BAND,
    heroImageAlt: 'Men\u2019s wedding band, Bez Ambar',
  },
  // TITANIUM (mens) → best-available mens band (no titanium asset). Flagged.
  'titanium-rings-men-pros-and-cons': {
    heroVideo: null, note: 'mens band (titanium stand-in; no titanium asset)', heroImage: MENS_BAND,
    heroImageAlt: 'Men\u2019s titanium ring, Bez Ambar',
  },
  // ROSE GOLD WEDDING BAND → rose gold band verified (C0625 baguette rose).
  'rose-gold-wedding-band': {
    heroVideo: vid('Jewelry Videos/Bands/C0625_Baguette_band_Master_e4azkj'),
    note: 'rose gold band', heroImage: GOLD_BAND,
    heroImageAlt: 'Rose gold wedding band, Bez Ambar',
  },
  // 14K VS 18K GOLD → gold band.
  '14k-vs-18k-gold-jewelry-guide': {
    heroVideo: null, note: 'gold band (14k vs 18k)', heroImage: GOLD_BAND,
    heroImageAlt: '14k vs 18k gold jewelry, Bez Ambar',
  },
  // GOLD CHAIN TYPES → gold necklace/chain.
  'gold-chain-types-guide': {
    heroVideo: vid('Jewelry Videos/Necklaces/baguette-by-the-yard-2026'),
    note: 'gold chain/necklace', heroImage: img('Jewelry Images/Necklaces/single-row-lifestyle'),
    heroImageAlt: 'Gold chain types, Bez Ambar',
  },
  // GOLD BRACELET → gold bracelet.
  'gold-bracelet-buying-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/C0722_5FLX34R_4k_vuejsf'),
    note: 'gold/diamond bracelet', heroImage: img('Jewelry Images/Bracelets/5FLX40-on-black'),
    heroImageAlt: 'Gold bracelet buying guide, Bez Ambar',
  },
  // PLATINUM VS WHITE GOLD → white-metal band/solitaire.
  'platinum-vs-white-gold-complete-guide': {
    heroVideo: null, note: 'white-metal band (platinum vs white gold)', heroImage: MENS_BAND,
    heroImageAlt: 'Platinum vs white gold, Bez Ambar',
  },
  // YELLOW/ROSE/WHITE GOLD → tri-color mens band (all three metals in one).
  'yellow-gold-vs-rose-gold-vs-white-gold': {
    heroVideo: null, note: 'tri-color band (all three golds)', heroImage: MENS_BAND,
    heroImageAlt: 'Yellow vs rose vs white gold, Bez Ambar',
  },
  // BANGLE VS BRACELET → bracelet.
  'bangle-vs-bracelet-fine-jewelry': {
    heroVideo: vid('Jewelry Videos/Bracelets/C0722_5FLX34R_4k_vuejsf'),
    note: 'bracelet', heroImage: img('Jewelry Images/Bracelets/5FLX45-on-hand'),
    heroImageAlt: 'Bangle vs bracelet, Bez Ambar',
  },
  // RING SIZE GUIDE → a ring on hand / size context. Use clean ring film.
  'ring-size-guide-choosing-ring-size': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    note: 'ring (sizing)', heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Ring size guide, Bez Ambar',
  },
  'secret-behind-ring-sizing': {
    heroVideo: vid('Jewelry Videos/Rings/b9558-hd'),
    note: 'ring (sizing)', heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'The secret behind ring sizing, Bez Ambar',
  },
}
