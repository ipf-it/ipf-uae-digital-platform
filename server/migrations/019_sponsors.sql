-- Sponsors (organisation-level + per-event) — explicitly requested twice by stakeholders in the
-- WhatsApp thread (a dedicated Sponsors page, and a sponsors section on event pages). Sponsorship
-- is a central relationship (not chapter/council-scoped), managed by a global admin.

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text not null default '',
  website text not null default '',
  tier text not null default '',
  contact_person text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  description text not null default '',
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_sponsors (
  event_id text not null references events(id) on delete cascade,
  sponsor_id uuid not null references sponsors(id) on delete cascade,
  primary key (event_id, sponsor_id)
);

alter table sponsors enable row level security;
alter table event_sponsors enable row level security;

drop policy if exists "public read active sponsors" on sponsors;
create policy "public read active sponsors" on sponsors for select using (active = true);
drop policy if exists "public read event_sponsors" on event_sponsors;
create policy "public read event_sponsors" on event_sponsors for select using (true);
