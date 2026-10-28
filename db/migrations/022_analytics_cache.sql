-- Analytics cache table: stores GA4 data snapshots per time window.
-- Refreshed 4x/day by scripts/ga4-admin-cache.js via OpenClaw automation.
-- Replaces the page_views-based admin analytics queries (removed 2026-10-28).

CREATE TABLE IF NOT EXISTS analytics_cache (
  window_days  INT PRIMARY KEY,        -- 7, 30, or 90
  data         JSONB NOT NULL,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
