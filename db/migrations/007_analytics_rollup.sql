-- Migration 007: analytics performance — daily rollup + retention
-- Strategy for our scale (<100k views/mo on Neon serverless):
--   * page_views_daily: pre-aggregated daily counts, refreshed by cron.
--     Dashboard reads the rollup for historical ranges → no full-table scans.
--   * Recent (today) still reads raw page_views for real-time accuracy.
--   * 90-day retention purge on raw page_views (rollup keeps long history cheap).
-- Run: node scripts/run-migration.js 007

-- ── Daily rollup: one row per (day, dimension bucket) ────────────────────────
CREATE TABLE IF NOT EXISTS page_views_daily (
  day            DATE        NOT NULL,
  path           TEXT        NOT NULL DEFAULT '',
  page_type      TEXT        NOT NULL DEFAULT '',
  source         TEXT        NOT NULL DEFAULT '',
  device         TEXT        NOT NULL DEFAULT '',
  country        TEXT        NOT NULL DEFAULT '',
  views          BIGINT      NOT NULL DEFAULT 0,
  unique_visitors BIGINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path, page_type, source, device, country)
);
CREATE INDEX IF NOT EXISTS idx_pvd_day       ON page_views_daily (day DESC);
CREATE INDEX IF NOT EXISTS idx_pvd_country   ON page_views_daily (country) WHERE country != '';
CREATE INDEX IF NOT EXISTS idx_pvd_type      ON page_views_daily (page_type);

-- ── Rollup refresh: recompute a given day from raw page_views ─────────────────
-- Idempotent — deletes then re-inserts the day. Cron calls this for yesterday+today.
CREATE OR REPLACE FUNCTION refresh_page_views_daily(target_day DATE) RETURNS void AS $$
BEGIN
  DELETE FROM page_views_daily WHERE day = target_day;
  INSERT INTO page_views_daily (day, path, page_type, source, device, country, views, unique_visitors)
  SELECT
    viewed_at::date AS day,
    COALESCE(path, '')        AS path,
    COALESCE(page_type, '')   AS page_type,
    COALESCE(source, '')      AS source,
    COALESCE(device, '')      AS device,
    COALESCE(country, '')     AS country,
    COUNT(*)                  AS views,
    COUNT(DISTINCT ip_hash)   AS unique_visitors
  FROM page_views
  WHERE is_bot = false AND viewed_at::date = target_day
  GROUP BY viewed_at::date, path, page_type, source, device, country;
END;
$$ LANGUAGE plpgsql;

-- ── Retention: purge raw views older than 90 days (rollup retains history) ────
CREATE OR REPLACE FUNCTION purge_old_page_views() RETURNS void AS $$
BEGIN
  DELETE FROM page_views WHERE viewed_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;
