-- Migration 005: server-side IP whitelist for progressive auth
-- First visit → UN+PW + "Trust this location" → IP stored 30 days → PIN-only on return
-- Run: psql $DATABASE_URL -f db/migrations/005_whitelisted_ips.sql

CREATE TABLE IF NOT EXISTS whitelisted_ips (
  id         BIGSERIAL PRIMARY KEY,
  ip_address TEXT        NOT NULL,
  label      TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT whitelisted_ips_ip_unique UNIQUE (ip_address)
);

CREATE INDEX IF NOT EXISTS idx_whitelisted_ips_ip
  ON whitelisted_ips (ip_address, expires_at DESC);
