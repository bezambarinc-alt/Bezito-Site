-- 009: Client Portal — clients table, pages extensions, page_requests
-- Apply: psql $DATABASE_URL -f db/migrations/009_client_portal.sql

-- 1. Clients
CREATE TABLE IF NOT EXISTS clients (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name          TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Extend pages
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS doc_type       TEXT NOT NULL DEFAULT 'showcase'
    CHECK (doc_type IN ('showcase','proposal')),
  ADD COLUMN IF NOT EXISTS client_id      BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_pin   TEXT,
  ADD COLUMN IF NOT EXISTS pin_expires_at TIMESTAMPTZ;

-- 3. Page requests from clients
CREATE TABLE IF NOT EXISTS page_requests (
  id          BIGSERIAL PRIMARY KEY,
  client_id   BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_sku TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','in_progress','fulfilled','declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_client_id  ON pages (client_id);
CREATE INDEX IF NOT EXISTS idx_pages_doc_type   ON pages (doc_type);
CREATE INDEX IF NOT EXISTS idx_page_requests_cl ON page_requests (client_id, status);
