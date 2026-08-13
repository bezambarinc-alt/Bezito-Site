-- Migration 006: page_views — server-side analytics (GA-replacement)
-- Logged by proxy.ts → /api/track (fire-and-forget). No client JS, no cookies-for-tracking.
-- Run: node scripts/run-migration.js 006  (or psql $DATABASE_URL -f db/migrations/006_page_views.sql)

CREATE TABLE IF NOT EXISTS page_views (
  id           BIGSERIAL PRIMARY KEY,
  path         TEXT NOT NULL,
  page_type    TEXT,                       -- home | jewelry | product | category | archive | blog | client | contact | other
  sku          TEXT,                       -- product SKU when path is a product detail page
  referer      TEXT,
  source       TEXT,                       -- Direct | Organic | Social | Referral | Email (parsed from referer/utm)
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  device       TEXT,                       -- desktop | mobile | tablet | bot
  browser      TEXT,
  os           TEXT,
  city         TEXT,
  region       TEXT,
  country      TEXT,
  ip_hash      TEXT,                        -- daily-salted SHA-256, never raw IP
  session_id   TEXT,                        -- groups a visitor's path within a visit
  is_bot       BOOLEAN NOT NULL DEFAULT false,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path      ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_country   ON page_views (country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_type      ON page_views (page_type);
CREATE INDEX IF NOT EXISTS idx_page_views_session   ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_human     ON page_views (viewed_at DESC) WHERE is_bot = false;
