-- 012: Idempotency keys for agent-driven create operations
-- Prevents duplicate records when Bezito scripts retry on network errors.
-- Apply: psql $DATABASE_URL -f db/migrations/012_idempotency.sql

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_pages_idempotency_key   ON pages   (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_idempotency_key ON clients (idempotency_key) WHERE idempotency_key IS NOT NULL;
