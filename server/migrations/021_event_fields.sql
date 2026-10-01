-- Event field completeness, per the formal requirement doc (Section 14) and the Events
-- collection tab: registration link, capacity, venue map link, and an event-specific contact —
-- none of which existed before (events only had title/date/location/body/category/slides).
alter table events add column if not exists registration_url text not null default '';
alter table events add column if not exists capacity int;
alter table events add column if not exists venue_map_url text not null default '';
alter table events add column if not exists event_contact text not null default '';

-- Activities & Initiatives: recurring programmes/campaigns distinct from one-off Events (no
-- RSVP/capacity/volunteer duty — just a title/summary/date-range/image, optionally homepage-
-- featured), requested by the requirement doc (Section 8/15) and its own workbook tab.
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  body text not null default '',
  image text not null default '',
  start_date date,
  end_date date,
  scope_type text not null default 'global' check (scope_type in ('global', 'chapter', 'council')),
  scope_id text,
  featured_on_homepage boolean not null default false,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table activities enable row level security;
drop policy if exists "public read published activities" on activities;
create policy "public read published activities" on activities for select using (workflow_status = 'published');
