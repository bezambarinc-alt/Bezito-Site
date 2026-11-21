/*
 * TRADE PAGE EDITORIAL GRID — CONVENTIONS
 * Last updated: 2026-11-20
 *
 * GRID PATTERN
 * Row 1: 2 product cards → Tile A (2-col, cut-specific video)
 * Then every 8 product cards → next tile (Tile B, Tile C …)
 * Always ends with Tile C ("How it closes" editorial).
 *
 * TILE RULES
 * Tile A — primary video tile. Cut-specific: round filter shows round video,
 *           emerald filter shows EM video. "All" defaults to emerald.
 * Tile B — model/lifestyle image. Currently shared across cuts.
 *           Swap the round model shot here when that image is ready.
 * Tile C — fixed "How it closes" editorial. Same for all cuts.
 *
 * CUT VIDEO SOURCES (Cloudinary path: Jewelry Videos/Bracelets/)
 *   round   → 5FLXR-stretch   (round hand stretch, uploaded 2026-11-20)
 *   emerald → 5FLXEM-stretch  (EM hand stretch, uploaded 2026-11-13)
 *   asscher → 5FLXEM-stretch  (placeholder until asscher video exists)
 *   all     → 5FLXEM-stretch  (defaults to emerald)
 *
 * IMAGE NAMING CONVENTION
 *   Folder:  Jewelry Images/Bracelets/{SKU}/
 *   Files:   {SKU}_{Metal}_{ViewType}
 *   Metals:  Platinum | RoseGold | YellowGold
 *   Views:   Front | Top | Angled | Model_ForearmRaised
 *
 * VIDEO NAMING CONVENTION
 *   Folder:  Jewelry Videos/Bracelets/{SKU}/  (per-piece turntables)
 *            Jewelry Videos/Bracelets/         (editorial/campaign videos)
 *   Files:   {SKU}_{Metal}_Turntable | {SKU}_{Metal}_Turntable_Closeup
 *
 * HOW TO SWAP CONTENT — no code changes needed:
 *   1. Upload new asset to Cloudinary with correct folder/name.
 *   2. Edit the url field in the relevant cut block below.
 *   3. Vercel auto-deploys on git push.
 */

export interface EditorialTileConfig {
  type: 'video' | 'image'
  url: string
  alt?: string
  eyebrow?: string
  headline?: string
  bodyText?: string
}

export interface CutTiles {
  tileA: EditorialTileConfig
  tileB: EditorialTileConfig
  tileC: EditorialTileConfig
}

const SHARED_TILE_B: EditorialTileConfig = {
  type: 'image',
  url: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1794182222/Jewelry%20Images/Bracelets/5FLXEM50N/5FLXEM50N_Platinum_Model_ForearmRaised.jpg',
  alt: 'Extent Flex Bracelet in platinum on model',
}

const SHARED_TILE_C: EditorialTileConfig = {
  type: 'image',
  url: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1787210681/Jewelry%20Images/Bracelets/c0834-model.avif',
  alt: '',
  eyebrow: 'How it closes',
  headline: 'It opens over the hand and returns to the wrist.',
  bodyText: 'A spring spine runs under the stones, so the line stays unbroken all the way around.',
}

export const TILES_BY_CUT: Record<'all' | 'round' | 'emerald' | 'asscher', CutTiles> = {
  all: {
    tileA: {
      type: 'video',
      url: 'https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/Jewelry%20Videos/Bracelets/5FLXEM-stretch.mp4',
    },
    tileB: SHARED_TILE_B,
    tileC: SHARED_TILE_C,
  },
  round: {
    tileA: {
      type: 'video',
      url: 'https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/Jewelry%20Videos/Bracelets/5FLXR-stretch.mp4',
    },
    tileB: SHARED_TILE_B,
    tileC: SHARED_TILE_C,
  },
  emerald: {
    tileA: {
      type: 'video',
      url: 'https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/Jewelry%20Videos/Bracelets/5FLXEM-stretch.mp4',
    },
    tileB: SHARED_TILE_B,
    tileC: SHARED_TILE_C,
  },
  asscher: {
    tileA: {
      type: 'video',
      url: 'https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/Jewelry%20Videos/Bracelets/5FLXEM-stretch.mp4',
    },
    tileB: SHARED_TILE_B,
    tileC: SHARED_TILE_C,
  },
}
