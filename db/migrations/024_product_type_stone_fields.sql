-- Migration 024 — product_type, stone_count, stone_weight_each
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type       TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_count        INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_weight_each  NUMERIC(8,3);
