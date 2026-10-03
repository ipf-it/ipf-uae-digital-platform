-- Events had no way to be curated onto the homepage — the homepage's events preview was purely
-- chronological across every scope (global, every chapter, every council) mixed together with no
-- way for a super admin to pin what actually shows there. Activities already had exactly this
-- flag (021_event_fields.sql); events never got the equivalent.
alter table events add column if not exists featured_on_homepage boolean not null default false;
