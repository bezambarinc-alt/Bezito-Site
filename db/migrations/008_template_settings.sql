-- Migration 008: seed active_product_template in admin_settings
-- This is the DB flag that controls which layout variant the product page renders.
-- Switched from the admin Templates section — triggers revalidateTag('product-template').

INSERT INTO admin_settings (key, value)
VALUES ('active_product_template', 'default')
ON CONFLICT (key) DO NOTHING;
