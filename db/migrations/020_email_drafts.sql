-- Per-campaign email HTML storage.
-- content_url in Zoho Campaigns points to /api/email-template/[id] which serves this HTML.
-- campaign_key is set after the Zoho campaign is created (back-reference).
CREATE TABLE email_drafts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  html         TEXT        NOT NULL,
  campaign_key TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
