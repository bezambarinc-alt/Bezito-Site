// Batch-1 re-curated media — hero video + hero image per post.
// Every public_id below verified present in Cloudinary dlg2mou53 this session.
// hero_video = motion showpiece; hero_image = poster/OG fallback (topic-matched).
const CLOUD = 'https://res.cloudinary.com/dlg2mou53'
const vid = (id) => `${CLOUD}/video/upload/${encodeURI(id)}`
const img = (id) => `${CLOUD}/image/upload/c_fill,ar_16:9,g_auto,w_1400/${encodeURI(id)}`

export const MEDIA = {
  // 1-carat: keep the strong deep-brown cushion ring film (topic-perfect solitaire)
  'why-a-1-carat-diamond': {
    heroVideo: vid('Jewelry Videos/Rings/c0752-ring-2026'),
    heroImage: img('Jewelry Images/Rings/C0752_1C3S_Deep_Brown.244_nd8fnq'),
    heroImageAlt: 'One-carat class diamond ring, Bez Ambar atelier',
  },
  // tennis bracelet: multi-row round diamond bracelet film
  'diamond-tennis-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/Multi_Row_Round_Diamond_Bracelet_B5993_2026_1080p_with_effects'),
    heroImage: img('Jewelry Images/Bracelets/B5671_copy_va7csi'),
    heroImageAlt: 'Diamond tennis bracelet, line of round brilliants',
  },
  // emerald guide: multi-row emerald bracelet film (vivid green hero)
  'emerald-gemstone-buying-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/Multi_Row_Emerald_Bracelet_C0493_2026_1080p'),
    heroImage: img('Jewelry Images/Bracelets/c0493-bracelet-emerald-master-1'),
    heroImageAlt: 'Colombian emerald jewelry, Bez Ambar',
  },
  // ruby engagement: ruby bracelet film is the strongest red motion asset
  'ruby-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/ruby-bracelet-c0779-2026'),
    heroImage: img('Jewelry Images/Bracelets/C0779_Bracelet_Rubies_ModelHand_snoipf'),
    heroImageAlt: 'Ruby fine jewelry, vivid red gemstones',
  },
  // oval engagement: fancy very pink oval on-hand + c0747 film
  'oval-cut-diamond-engagement-ring': {
    heroVideo: vid('Jewelry Videos/Rings/c0747-hd-2026'),
    heroImage: img('Jewelry Images/Rings/C0747_Fancy_Very_Pink_Oval_top'),
    heroImageAlt: 'Oval cut diamond engagement ring, Bez Ambar',
  },
  // flex bracelet: Bez's own line — emerald-cut flex film
  'diamond-flex-bracelet-guide': {
    heroVideo: vid('Jewelry Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026'),
    heroImage: img('Jewelry Images/Bracelets/5FLX40-on-black'),
    heroImageAlt: 'Diamond Flex bracelet by Bez Ambar',
  },
  // halo setting: three-stone / round center rings; use C0895 halo-class film
  'halo-ring-setting': {
    heroVideo: vid('Jewelry Videos/Rings/C0895_1C3S_HD_regular_speed_stmsmb'),
    heroImage: img('Jewelry Images/Rings/C0731_Round_Cut_ka9ykl'),
    heroImageAlt: 'Halo diamond ring setting, round brilliant center',
  },
  // three-stone: the fancy-yellow three-stone piece is the definitive asset
  'three-stone-engagement-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0536_r9ryq6'),
    heroImage: img('Jewelry Images/Rings/C0536_Fancy_Yellow_Three_Stone_top'),
    heroImageAlt: 'Three-stone diamond engagement ring, Bez Ambar',
  },
  // princess cut: Bez's invention — pear/round film; use C0728 crisp film
  'princess-cut-diamond-ring-guide': {
    heroVideo: vid('Jewelry Videos/Rings/C0737-_4K_b2l126'),
    heroImage: img('Jewelry Images/Rings/C0737_Round_Cut_tm5oal'),
    heroImageAlt: 'Princess cut diamond ring, invented by Bez Ambar',
  },
  // rose cut: signature — cushion white ring film as elegant showpiece
  'rose-cut-diamond-rings-by-bez-ambar': {
    heroVideo: vid('Jewelry Videos/Rings/4k_C0721_cwwztv'),
    heroImage: img('Jewelry Images/Rings/C0746_Cushion_Cut_White_eowaqf'),
    heroImageAlt: 'Rose cut diamond ring by Bez Ambar',
  },
}
