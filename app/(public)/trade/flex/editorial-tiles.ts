// Editorial tile content config for /trade/flex product grid.
// Swap URLs, headlines, and captions here — no code changes needed.

export interface EditorialTileConfig {
  type: 'video' | 'image'
  url: string
  alt?: string
  eyebrow?: string
  headline?: string
  bodyText?: string
}

export const TILES: Record<'tileA' | 'tileB' | 'tileC', EditorialTileConfig> = {
  // Tile A — Row 1, right side (after first 2 product cards). Autoplay video.
  tileA: {
    type: 'video',
    url: 'https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026.mp4',
  },

  // Tile B — Row 4, left side (before 2 product cards). Model shot.
  tileB: {
    type: 'image',
    url: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1794182222/Jewelry%20Images/Bracelets/5FLXEM50N/5FLXEM50N_Platinum_Model_ForearmRaised.jpg',
    alt: 'Extent Flex Bracelet in platinum on model',
  },

  // Tile C — End of grid. "How it closes" editorial.
  tileC: {
    type: 'image',
    url: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1787210681/Jewelry%20Images/Bracelets/c0834-model.avif',
    alt: '',
    eyebrow: 'How it closes',
    headline: 'It opens over the hand and returns to the wrist.',
    bodyText: 'A spring spine runs under the stones, so the line stays unbroken all the way around.',
  },
}
