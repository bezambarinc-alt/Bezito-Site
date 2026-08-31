-- Migration 014: rename plytix_id → zoho_id
-- Plytix decommissioned 2026-08-31; this column stores the Zoho CRM Products record ID.
-- Run against Neon BEFORE deploying the code changes that reference zoho_id.
-- Usage: psql $DATABASE_URL -f db/migrations/014_rename_plytix_id_to_zoho_id.sql
ALTER TABLE products RENAME COLUMN plytix_id TO zoho_id;
