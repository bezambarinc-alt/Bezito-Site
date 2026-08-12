-- Bez Ambar Next.js — database schema
-- Apply: psql $DATABASE_URL -f db/schema.sql
-- Raw SQL only. No ORM. Schema file = reference, applied by hand.

-- 1. pages: client/marketing pages Bezito publishes
CREATE TABLE IF NOT EXISTS pages (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  tenant      TEXT NOT NULL DEFAULT 'bezambar',
  title       TEXT NOT NULL,
  blocks      JSONB NOT NULL DEFAULT '[]'::jsonb,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','live','archived')),
  password    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. products: READ CACHE of Plytix — rebuilt by sync cron, never source of truth
CREATE TABLE IF NOT EXISTS products (
  sku                TEXT PRIMARY KEY,
  plytix_id          TEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  category           TEXT,
  subtitle           TEXT,
  editorial          TEXT,
  description        TEXT,
  hero_visual        TEXT,         -- Cloudinary mp4 or image URL
  editorial_visual   TEXT,         -- Cloudinary poster/thumbnail URL
  metal              TEXT,
  stone_shape        TEXT,
  stone_carats       TEXT,
  stone_clarity      TEXT,
  stone_color        TEXT,
  stone_notes        TEXT,
  total_carat_weight  NUMERIC(8,3),
  center_stone_weight NUMERIC(8,3),
  collection          TEXT,
  active             BOOLEAN NOT NULL DEFAULT true,
  featured           BOOLEAN NOT NULL DEFAULT false,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  specs              JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active, featured DESC, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- 3. leads: durable audit copy written BEFORE CRM call
CREATE TABLE IF NOT EXISTS leads (
  id          BIGSERIAL PRIMARY KEY,
  page_slug   TEXT REFERENCES pages(slug),
  name        TEXT,
  email       TEXT NOT NULL,
  message     TEXT,
  crm_status  TEXT NOT NULL DEFAULT 'pending'
              CHECK (crm_status IN ('pending','synced','failed')),
  crm_id      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. generations: every Bezito→Claude call (Kevin's debug tools)
CREATE TABLE IF NOT EXISTS generations (
  id          BIGSERIAL PRIMARY KEY,
  route       TEXT NOT NULL,
  model       TEXT NOT NULL,
  prompt      JSONB NOT NULL,
  output      TEXT,
  tokens_in   INT,
  tokens_out  INT,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. audit_log: every mutating action — Bezito, Bez, Kevin all attributable
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  target      TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. blog_posts: journal/blog content (migrated from Astro dist/blog).
--    Populated by /api/blogimport. Rendered by app/(public)/blog/[slug]/page.tsx.
CREATE TABLE IF NOT EXISTS blog_posts (
  slug           TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9-]+$'),
  title          TEXT NOT NULL,
  date           TIMESTAMPTZ NOT NULL,
  updated_date   TIMESTAMPTZ,
  category       TEXT NOT NULL,
  excerpt        TEXT NOT NULL,
  hero_image     TEXT,
  hero_video     TEXT,
  hero_image_alt TEXT,
  author         TEXT NOT NULL DEFAULT 'Bez Ambar',
  status         TEXT NOT NULL DEFAULT 'live'
                 CHECK (status IN ('draft','live','archived')),
  schema_type    TEXT,
  schema_faq     BOOLEAN NOT NULL DEFAULT false,
  body           TEXT NOT NULL,
  display_order  INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_live ON blog_posts (status, date DESC);

-- 7. archive: legacy product archive (animated GIFs + video drawer)
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
CREATE INDEX IF NOT EXISTS idx_archive_has_gif  ON archive (slug) WHERE gif_url != '';

-- 8. admin_users: dashboard accounts — managed via /admin/settings
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. admin_settings: key-value config (PIN hash, future flags)
CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
