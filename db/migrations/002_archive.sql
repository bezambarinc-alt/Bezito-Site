-- ============================================================
-- Migration 002 — Archive table
-- Run once in the Neon console (or via the seed-archive endpoint).
-- ============================================================

CREATE TABLE IF NOT EXISTS archive (
  slug          text        PRIMARY KEY,
  title         text        NOT NULL DEFAULT '',
  sku           text        NOT NULL DEFAULT '',
  category      text        NOT NULL DEFAULT 'all',   -- rings|bands|bracelets|necklaces|earrings|mens|all
  gif_url       text        NOT NULL DEFAULT '',       -- Cloudinary animated GIF thumbnail
  mp4_url       text        NOT NULL DEFAULT '',       -- full MP4 for the drawer video player
  shapes        text[]      NOT NULL DEFAULT '{}',     -- ['oval','round'] etc.
  colors        text[]      NOT NULL DEFAULT '{}',     -- ['ruby','sapphire'] etc.
  description   text        NOT NULL DEFAULT '',
  display_order integer     NOT NULL DEFAULT 0,        -- preserves original JSON key order
  synced_at     timestamptz NOT NULL DEFAULT now()
);

-- Index for category filter (most common filter)
CREATE INDEX IF NOT EXISTS idx_archive_category     ON archive (category);
-- GIN indexes for array containment queries (shapes, colors)
CREATE INDEX IF NOT EXISTS idx_archive_shapes       ON archive USING GIN (shapes);
CREATE INDEX IF NOT EXISTS idx_archive_colors       ON archive USING GIN (colors);
-- Only index rows that have a GIF (same guard as the query)
CREATE INDEX IF NOT EXISTS idx_archive_has_gif      ON archive (slug) WHERE gif_url != '';
