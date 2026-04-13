-- SWTMT Portal — supplementary indexes (v3)
-- Run after schema.sql. Uses IF NOT EXISTS so it's safe to re-run.
--
-- These indexes cover query patterns not covered by the original schema:
--   - documents by company_id (company doc listings, RLS policy joins)
--   - bid_events by actor_id (user activity lookups)
--
-- bid_events(bid_id, created_at desc) is already in schema.sql — not duplicated here.

CREATE INDEX IF NOT EXISTS idx_documents_company_id
  ON documents (company_id);

CREATE INDEX IF NOT EXISTS idx_bid_events_actor_id
  ON bid_events (actor_id);
