-- Migration 002: admin users + settings tables + seed
-- Run: psql $DATABASE_URL -f db/migrations/002_admin_auth.sql

CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial admin user (password is bcrypt-hashed, plaintext never stored)
INSERT INTO admin_users (email, password_hash, role)
VALUES (
  'bezambarinc@gmail.com',
  '$2b$12$mWCsveYQwqwFg7gF1tATIeW2ZR89lc3C3PE7vqUcrL6kyen34v8zG',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Seed PIN (bcrypt-hashed)
INSERT INTO admin_settings (key, value)
VALUES ('admin_pin', '$2b$12$UJif8Bce5W4AZw1puXiC7.76fi84NHD2Rj/ognFKlfHk.p/DIgkxO')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
