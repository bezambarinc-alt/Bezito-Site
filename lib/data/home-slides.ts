/**
 * Slide data for HeroCarousel and CinematicCarousel.
 * Extracted from components so logic and content are decoupled.
 */

export interface CarouselSlide {
  videoUrl: string
  posterUrl: string
  eyebrow: string
  headline: string
  sub: string
}

export const HERO_SLIDES: [CarouselSlide, CarouselSlide] = [
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_720,c_limit,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_720/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.jpg',
    eyebrow: 'Bez Ambar · Los Angeles',
    headline: 'The Magic of Light',
    sub: 'A certificate can grade a stone. It cannot tell how the light dances within it. In lesser hands, light merely touches the stone; done right, it melts into the divine.',
  },
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_720,c_limit,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_720/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.jpg',
    eyebrow: 'Bez Ambar · Los Angeles',
    headline: 'The Magic of Light',
    sub: 'A certificate can grade a stone. It cannot tell how the light dances within it. In lesser hands, light merely touches the stone; done right, it melts into the divine.',
  },
]

export const CINEMATIC_SLIDES: [CarouselSlide, CarouselSlide] = [
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_720,c_limit,q_auto/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_720/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.jpg',
    eyebrow: 'Coming Soon',
    headline: 'The Elysian Pear',
    sub: 'A teardrop, reborn — the next chapter in the line of brilliance.',
  },
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_720,c_limit,q_auto/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_720/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.jpg',
    eyebrow: 'The Elysian Pear Band',
    headline: 'Pear Cut. Continuous Line.',
    sub: 'Each teardrop calibrated to the next, until light becomes the band itself.',
  },
]
