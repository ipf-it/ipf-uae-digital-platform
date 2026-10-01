-- Scheduled homepage banners/announcements, requested by the requirement doc (Section 15:
-- "Announcements, Homepage Banners & Alerts... centrally managed and schedulable"). Rather than a
-- parallel announcements table, this adds start/end scheduling directly to page_sections — any
-- section on any page (most usefully the "home-extras" page) can now be time-windowed, which is a
-- more general capability than a one-off announcements table would have been.
alter table page_sections add column if not exists starts_at timestamptz;
alter table page_sections add column if not exists ends_at timestamptz;
alter table page_sections add column if not exists priority int not null default 0;
