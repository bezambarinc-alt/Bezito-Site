-- Migration 004: auto-cleanup for login_attempts (prevent unbounded growth)
-- Run: node --env-file=.env.local scripts/run-migration.js 004

-- Purge attempts older than 24h. Called opportunistically by the rate limiter,
-- and can also be run as a scheduled job.
CREATE OR REPLACE FUNCTION purge_old_login_attempts() RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;
