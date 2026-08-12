-- Migration 003: login_attempts table for rate limiting
-- Run: node --env-file=.env.local -e "..." (see Makefile or package.json scripts)

CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT NOT NULL,
  success      BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
  ON login_attempts (ip, attempted_at DESC);

-- Auto-purge old attempts (keep 24h only)
-- Run periodically or let the table stay small (low traffic admin)
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts (attempted_at);
