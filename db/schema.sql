-- ════════════════════════════════════════════════════════════════════════════
-- Bez Ambar Next.js — full database schema (Neon Postgres)
--
-- Apply to an empty database:  psql $DATABASE_URL -f db/schema.sql
-- Raw SQL only. No ORM.
--
-- THIS FILE IS THE SOURCE OF TRUTH FOR A FRESH DATABASE.
-- It was regenerated 2026-09-17 directly from the live Neon schema
-- (information_schema + pg_catalog), so it reproduces production exactly —
-- same columns, same types, same defaults, same constraint names, same indexes.
--
-- RULE: every time a migration lands in db/migrations/, fold it into this file.
-- Statements are ordered so foreign keys resolve; everything is IF NOT EXISTS
-- so re-running is a no-op (same style as db/migrations/007_analytics_rollup.sql).
--
-- Layout:
--   1. Admin + auth        admin_users, admin_settings, login_attempts, whitelisted_ips
--   2. Client portal       clients, pages, page_requests
--   3. Commerce + content  products, leads, blog_posts, archive
--   4. Observability       generations, audit_log
--   5. Analytics           page_views, page_views_daily + rollup/purge functions
--   6. Migration ledger    schema_migrations
-- ════════════════════════════════════════════════════════════════════════════


-- ══ 1. Admin + auth ═════════════════════════════════════════════════════════

-- admin_users: dashboard accounts — managed via /admin/settings.
-- Passwords are bcrypt hashes; plaintext is never stored.
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- admin_settings: key-value config store.
-- Known keys: 'admin_pin' (bcrypt hash), 'active_product_template'.
CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- login_attempts: rate-limit ledger for the admin login form.
-- Purged to a 24h window by purge_old_login_attempts() (section 5 style helper,
-- defined below with the other maintenance functions).
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT NOT NULL,
  success      BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time    ON login_attempts (attempted_at);

-- whitelisted_ips: server-side IP trust list for progressive auth.
-- First visit → username+password + "trust this location" → IP stored 30 days
-- → PIN-only on return from that IP.
CREATE TABLE IF NOT EXISTS whitelisted_ips (
  id         BIGSERIAL PRIMARY KEY,
  ip_address TEXT        NOT NULL,
  label      TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT whitelisted_ips_ip_unique UNIQUE (ip_address)
);
CREATE INDEX IF NOT EXISTS idx_whitelisted_ips_ip ON whitelisted_ips (ip_address, expires_at DESC);


-- ══ 2. Client portal ════════════════════════════════════════════════════════

-- clients: portal accounts. A client logs in at /portal and sees the pages
-- assigned to them. Must be created before `pages` (FK target).
CREATE TABLE IF NOT EXISTS clients (
  id              BIGSERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name            TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT UNIQUE          -- set by agent scripts so retries don't duplicate
);
CREATE INDEX IF NOT EXISTS idx_clients_idempotency_key
  ON clients (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- pages: client/marketing pages Bezito publishes at /page/<slug>.
--   doc_type='showcase' → gated by customer_pin
--   doc_type='proposal' → gated by portal auth, unless shared=true (link sharing)
CREATE TABLE IF NOT EXISTS pages (
  id              BIGSERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  tenant          TEXT NOT NULL DEFAULT 'bezambar',
  title           TEXT NOT NULL,
  blocks          JSONB NOT NULL DEFAULT '[]'::jsonb,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','live','archived')),
  password        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  doc_type        TEXT NOT NULL DEFAULT 'showcase'
                  CHECK (doc_type IN ('showcase','proposal')),
  client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  customer_pin    TEXT,                       -- showcase gate
  pin_expires_at  TIMESTAMPTZ,
  template_id     TEXT DEFAULT 'default',     -- nullable in production; per-page layout variant
  shared          BOOLEAN NOT NULL DEFAULT false,
  idempotency_key TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_pages_client_id ON pages (client_id);
CREATE INDEX IF NOT EXISTS idx_pages_doc_type  ON pages (doc_type);
CREATE INDEX IF NOT EXISTS idx_pages_idempotency_key
  ON pages (idempotency_key) WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN pages.shared IS
  'Proposal sharing mode. false (default) = only the assigned client can view (portal auth required). '
  'true = anyone with the link can view. Has no effect on showcase pages (they use customer_pin).';

-- page_requests: "please build me a page for SKU X" asks raised from the portal.
CREATE TABLE IF NOT EXISTS page_requests (
  id          BIGSERIAL PRIMARY KEY,
  client_id   BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_sku TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','in_progress','fulfilled','declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_requests_cl ON page_requests (client_id, status);


-- ══ 3. Commerce + content ═══════════════════════════════════════════════════

-- products: READ CACHE of Zoho CRM Products. Rebuilt by the pim-sync cron every
-- 4h — never the source of truth, never written by hand.
--
-- Zoho CRM view fields → Neon columns (migration 015_view_urls):
--   Visual_Top → view_1_url, Visual_Concept → view_2_url, Visual_Stone_Sketch → view_3_url
--
-- `specs`, `media` and `price` are LEGACY columns from the pre-Zoho Plytix era.
-- They still exist in production and are still NOT NULL (specs/media), so they
-- must be created here, but application code must not query them — see
-- lib/queries.ts. Column order below mirrors production's ordinal order.
CREATE TABLE IF NOT EXISTS products (
  sku                 TEXT PRIMARY KEY,
  zoho_id             TEXT NOT NULL,
  name                TEXT NOT NULL,
  specs               JSONB NOT NULL DEFAULT '{}'::jsonb,   -- legacy, do not query
  price               NUMERIC(12,2),                        -- legacy, do not query
  media               JSONB NOT NULL DEFAULT '[]'::jsonb,   -- legacy, do not query
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  category            TEXT,
  subtitle            TEXT,
  editorial           TEXT,
  description         TEXT,
  hero_visual         TEXT,          -- Cloudinary mp4 or image URL
  editorial_visual    TEXT,          -- Cloudinary poster/thumbnail URL
  metal               TEXT,
  stone_shape         TEXT,
  stone_carats        TEXT,
  stone_clarity       TEXT,
  stone_color         TEXT,
  stone_notes         TEXT,
  total_carat_weight  NUMERIC(8,3),
  active              BOOLEAN NOT NULL DEFAULT true,
  featured            BOOLEAN NOT NULL DEFAULT false,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  center_stone_weight NUMERIC(8,3),
  collection          TEXT,
  slug                TEXT,          -- URL-safe slug derived from SKU/name at sync time
  view_1_url          TEXT,          -- Zoho CRM: Visual_Top
  view_2_url          TEXT,          -- Zoho CRM: Visual_Concept
  view_3_url          TEXT,          -- Zoho CRM: Visual_Stone_Sketch
  -- Constraint name is deliberately the legacy one. The column was renamed
  -- plytix_id → zoho_id by migration 014, but Postgres does NOT rename the
  -- constraint that rides along, so production still calls it
  -- products_plytix_id_key. Keeping the name identical keeps a fresh database
  -- byte-comparable with production. Do not "fix" it without a migration.
  CONSTRAINT products_plytix_id_key UNIQUE (zoho_id)
);
-- slug uniqueness is a bare unique index in production, not a table constraint.
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);

-- leads: durable audit copy of every inquiry, written BEFORE the CRM call so a
-- Zoho outage can never lose a lead. Retried by /api/admin/leads/retry.
--   sku    — product the inquiry came from, when the form was on a product page
--   intent — form intent: newsletter, repair, appraisal, custom, … (see app/api/lead/route.ts)
CREATE TABLE IF NOT EXISTS leads (
  id          BIGSERIAL PRIMARY KEY,
  page_slug   TEXT REFERENCES pages(slug),
  name        TEXT,
  email       TEXT NOT NULL,
  message     TEXT,
  crm_status  TEXT NOT NULL DEFAULT 'pending'
              CHECK (crm_status IN ('pending','synced','failed')),
  crm_id      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sku         TEXT,
  intent      TEXT
);

-- blog_posts: journal/blog content (migrated from the old Astro dist/blog).
-- Populated by /api/blogimport, rendered by app/(public)/blog/[slug]/page.tsx.
-- NOTE: `date` / `updated_date` are DATE in production, not TIMESTAMPTZ, and
-- `slug` / `status` carry NO check constraints there. Matching production.
CREATE TABLE IF NOT EXISTS blog_posts (
  slug           TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  date           DATE NOT NULL,
  updated_date   DATE,
  category       TEXT NOT NULL,
  excerpt        TEXT NOT NULL,
  hero_image     TEXT,
  hero_video     TEXT,
  hero_image_alt TEXT,
  author         TEXT NOT NULL DEFAULT 'Bez Ambar',
  status         TEXT NOT NULL DEFAULT 'live',
  schema_type    TEXT,
  schema_faq     BOOLEAN NOT NULL DEFAULT false,
  body           TEXT NOT NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts (category);
CREATE INDEX IF NOT EXISTS blog_posts_date_idx     ON blog_posts (date DESC);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx   ON blog_posts (status);

-- archive: legacy product archive (animated GIFs + video drawer).
CREATE TABLE IF NOT EXISTS archive (
  slug          TEXT        PRIMARY KEY,
  title         TEXT        NOT NULL DEFAULT '',
  sku           TEXT        NOT NULL DEFAULT '',
  category      TEXT        NOT NULL DEFAULT 'all',
  gif_url       TEXT        NOT NULL DEFAULT '',
  mp4_url       TEXT        NOT NULL DEFAULT '',
  shapes        TEXT[]      NOT NULL DEFAULT '{}',
  colors        TEXT[]      NOT NULL DEFAULT '{}',
  description   TEXT        NOT NULL DEFAULT '',
  display_order INTEGER     NOT NULL DEFAULT 0,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_archive_category ON archive (category);
CREATE INDEX IF NOT EXISTS idx_archive_shapes   ON archive USING GIN (shapes);
CREATE INDEX IF NOT EXISTS idx_archive_colors   ON archive USING GIN (colors);


-- ══ 4. Observability ════════════════════════════════════════════════════════

-- generations: every Bezito→Claude call (Kevin's debug tools).
CREATE TABLE IF NOT EXISTS generations (
  id          BIGSERIAL PRIMARY KEY,
  route       TEXT NOT NULL,
  model       TEXT NOT NULL,
  prompt      JSONB NOT NULL,
  output      TEXT,
  tokens_in   INTEGER,
  tokens_out  INTEGER,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- audit_log: every mutating action — Bezito, Bez, Kevin all attributable.
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  target      TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ══ 5. Analytics ════════════════════════════════════════════════════════════

-- page_views: server-side analytics (Google-Analytics replacement).
-- Logged by proxy.ts → /api/track, fire-and-forget. No client JS, no tracking
-- cookies. `ip_hash` is a daily-salted SHA-256 — the raw IP is never stored.
-- Retained 90 days; purge_old_page_views() trims it.
CREATE TABLE IF NOT EXISTS page_views (
  id           BIGSERIAL PRIMARY KEY,
  path         TEXT NOT NULL,
  page_type    TEXT,        -- home | jewelry | product | category | archive | blog | client | contact | other
  sku          TEXT,        -- product SKU when path is a product detail page
  referer      TEXT,
  source       TEXT,        -- Direct | Organic | Social | Referral | Email (parsed from referer/utm)
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  device       TEXT,        -- desktop | mobile | tablet | bot
  browser      TEXT,
  os           TEXT,
  city         TEXT,
  region       TEXT,
  country      TEXT,
  ip_hash      TEXT,        -- daily-salted SHA-256, never the raw IP
  session_id   TEXT,        -- groups a visitor's path within a visit
  is_bot       BOOLEAN NOT NULL DEFAULT false,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path      ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_country   ON page_views (country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_type      ON page_views (page_type);
CREATE INDEX IF NOT EXISTS idx_page_views_session   ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_human     ON page_views (viewed_at DESC) WHERE is_bot = false;

-- page_views_daily: pre-aggregated daily counts, one row per
-- (day, path, page_type, source, device, country) bucket. The dashboard reads
-- this for historical ranges so it never full-scans page_views; today's numbers
-- still come from the raw table for real-time accuracy. Refreshed by cron via
-- refresh_page_views_daily(). Empty-string, not NULL, is the "unknown" bucket
-- so the composite primary key stays usable.
CREATE TABLE IF NOT EXISTS page_views_daily (
  day             DATE   NOT NULL,
  path            TEXT   NOT NULL DEFAULT '',
  page_type       TEXT   NOT NULL DEFAULT '',
  source          TEXT   NOT NULL DEFAULT '',
  device          TEXT   NOT NULL DEFAULT '',
  country         TEXT   NOT NULL DEFAULT '',
  views           BIGINT NOT NULL DEFAULT 0,
  unique_visitors BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path, page_type, source, device, country)
);
CREATE INDEX IF NOT EXISTS idx_pvd_day     ON page_views_daily (day DESC);
CREATE INDEX IF NOT EXISTS idx_pvd_country ON page_views_daily (country) WHERE country != '';
CREATE INDEX IF NOT EXISTS idx_pvd_type    ON page_views_daily (page_type);

-- ── Maintenance functions ───────────────────────────────────────────────────

-- Rollup refresh: recompute a given day from raw page_views.
-- Idempotent — deletes then re-inserts the day. Cron calls it for yesterday+today.
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

-- Retention: purge raw views older than 90 days (the rollup retains history).
CREATE OR REPLACE FUNCTION purge_old_page_views() RETURNS void AS $$
BEGIN
  DELETE FROM page_views WHERE viewed_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Retention: keep only 24h of login attempts. Called opportunistically by the
-- rate limiter and safe to run as a scheduled job.
CREATE OR REPLACE FUNCTION purge_old_login_attempts() RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;


-- ══ 6. Migration ledger ═════════════════════════════════════════════════════

-- schema_migrations: records which files in db/migrations/ have been applied.
-- Written by scripts/run-migration.js, which skips any migration already listed.
--
-- ⚠ This table does NOT yet exist in production (2026-09-17). It arrives with
-- migration 017_schema_migrations.sql. A fresh database built from this file
-- gets it immediately; production needs 017 applied plus the one-time backfill
-- documented in db/README.md.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         TEXT PRIMARY KEY,                        -- migration filename, e.g. '009_client_portal.sql'
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_by TEXT NOT NULL DEFAULT current_user
);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
  ON schema_migrations (applied_at DESC);


-- ══ 7. OAuth tokens ═════════════════════════════════════════════════════════

-- zoho_tokens: persist Zoho OAuth refresh tokens across deploys.
-- Written by /api/auth/zoho/callback; read by lib/zoho-auth.ts (env var fallback).
-- One row per app (default id: 'bezambar_site').
-- Added: migration 018_zoho_tokens.sql (applied 2026-09-25).
CREATE TABLE IF NOT EXISTS zoho_tokens (
  id            TEXT PRIMARY KEY DEFAULT 'bezambar_site',
  refresh_token TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE zoho_tokens IS
  'Zoho OAuth refresh tokens written by /api/auth/zoho/callback. One row per app (default: bezambar_site).';


-- ── Seed rows ───────────────────────────────────────────────────────────────
-- Minimum config a fresh database needs to boot the admin dashboard.
-- The admin user + PIN are seeded by db/migrations/002_admin_auth.sql; run the
-- migrations after this file, or insert your own bcrypt hashes here.
INSERT INTO admin_settings (key, value)
VALUES ('active_product_template', 'default')
ON CONFLICT (key) DO NOTHING;
