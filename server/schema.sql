-- IPF UAE — run once in the Supabase SQL editor (Dashboard → SQL).
-- Then create a public storage bucket named ipf-uploads (Storage → New bucket → public).

create extension if not exists pgcrypto;

create sequence if not exists ipf_member_number_seq start 1;
create sequence if not exists ipf_yuva_number_seq start 1;

create or replace function next_ipf_number(account_kind text)
returns bigint
language plpgsql
security definer
as $$
begin
  if account_kind = 'yuva' then
    return nextval('ipf_yuva_number_seq');
  end if;
  return nextval('ipf_member_number_seq');
end;
$$;

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  kind text not null check (kind in ('member', 'yuva')),
  membership_no text not null unique,
  name text not null,
  email text not null unique,
  phone text not null default '',
  emirate text not null default '',
  chapter text not null default '',
  home_state text not null default '',
  is_volunteer boolean not null default false,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists people_home_state_idx on people (home_state);
create index if not exists people_emirate_idx on people (emirate);

create table if not exists volunteer_hours (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  activity_date date not null,
  hours numeric(6,1) not null,
  activity text not null,
  created_at timestamptz not null default now()
);

create index if not exists volunteer_hours_person_idx on volunteer_hours (person_id, created_at desc);

create table if not exists events (
  id text primary key,
  title text not null,
  event_date text not null default '',
  location text not null default '',
  body text not null default '',
  slides jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  category text not null default 'Community',
  emirate text not null default 'uae',
  starts_at timestamptz,
  ends_at timestamptz,
  is_free boolean not null default true,
  scope_type text not null default 'global' check (scope_type in ('global', 'chapter', 'council')),
  scope_id text,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table events add column if not exists category text not null default 'Community';
alter table events add column if not exists emirate text not null default 'uae';
alter table events add column if not exists starts_at timestamptz;
alter table events add column if not exists ends_at timestamptz;
alter table events add column if not exists is_free boolean not null default true;

create index if not exists events_starts_idx on events (starts_at desc);
create index if not exists events_category_idx on events (category, emirate);
create index if not exists events_published_starts_idx on events (published, starts_at);
create index if not exists events_published_category_emirate_idx on events (published, category, emirate);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  registration_no text not null unique,
  name text not null,
  email text not null,
  phone text not null default '',
  participation_as text not null default 'member' check (participation_as in ('member', 'volunteer')),
  status text not null default 'registered' check (status in ('registered', 'cancelled', 'attended')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

alter table event_registrations add column if not exists participation_as text not null default 'member';
create index if not exists people_phone_idx on people (phone);
create unique index if not exists people_phone_unique_idx on people (phone) where phone <> '';

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('super_admin', 'central_content_admin', 'chapter_admin', 'council_admin', 'editor')),
  scope_type text not null default 'global' check (scope_type in ('global', 'chapter', 'council')),
  scope_id text,
  active boolean not null default true,
  mfa_required boolean not null default true,
  password_hash text not null default '',
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);
alter table admin_users add column if not exists password_hash text not null default '';
alter table admin_users add column if not exists last_login_at timestamptz;

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  scope_type text not null default 'global',
  scope_id text,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','changes_requested','rejected','approved','scheduled','published')),
  submitted_by uuid references admin_users(id) on delete set null,
  reviewed_by uuid references admin_users(id) on delete set null,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_value jsonb,
  new_value jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx on audit_logs (actor_id, created_at desc);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'events_created_by_fkey') then
    alter table events add constraint events_created_by_fkey foreign key (created_by) references admin_users(id) on delete set null;
  end if;
end $$;
create index if not exists events_scope_idx on events (scope_type, scope_id, updated_at desc);
create unique index if not exists approval_entity_unique_idx on approval_requests (entity_type, entity_id);

create index if not exists event_registrations_event_idx on event_registrations (event_id, created_at desc);
create index if not exists event_registrations_person_idx on event_registrations (person_id);

create table if not exists event_volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned', 'confirmed', 'attended')),
  created_at timestamptz not null default now(),
  unique (event_id, person_id)
);

create index if not exists event_volunteers_event_idx on event_volunteers (event_id, created_at desc);
create index if not exists event_volunteers_person_idx on event_volunteers (person_id);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  intent text not null default 'contact',
  name text not null,
  email text not null,
  phone text not null default '',
  emirate text not null default '',
  message text not null default '',
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  amount_aed numeric(12,2) not null,
  note text not null default '',
  status text not null default 'pledge',
  created_at timestamptz not null default now()
);

-- Note: the legacy `sessions` and `chapter_admins` tables (opaque cookie sessions and shared
-- chapter passwords, both predating the move to Supabase Auth) are dropped by migration
-- 006_unified_identity.sql rather than defined here — see that file if bootstrapping a database
-- that predates this schema.

create table if not exists site_content (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists verified_phones (
  phone text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists phone_otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists phone_otp_codes_phone_idx on phone_otp_codes (phone, created_at desc);

create or replace function event_participation_counts(event_ids text[])
returns table (event_id text, member_count bigint, volunteer_count bigint)
language sql
stable
as $$
  select
    event_registrations.event_id,
    count(*) filter (where participation_as = 'member') as member_count,
    count(*) filter (where participation_as = 'volunteer') as volunteer_count
  from event_registrations
  where event_registrations.event_id = any(event_ids)
  group by event_registrations.event_id;
$$;

alter table people enable row level security;
alter table verified_phones enable row level security;
alter table phone_otp_codes enable row level security;
alter table volunteer_hours enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table event_volunteers enable row level security;
alter table inquiries enable row level security;
alter table donations enable row level security;
alter table site_content enable row level security;
alter table admin_users enable row level security;
alter table approval_requests enable row level security;
alter table audit_logs enable row level security;

-- CREATE POLICY has no IF NOT EXISTS in Postgres, so drop-then-create to make this file safe
-- to re-run (it errors with "policy ... already exists" otherwise, on a database where it's
-- already been applied once).
drop policy if exists "public read published events" on events;
create policy "public read published events" on events for select using (published = true);
drop policy if exists "public read site content" on site_content;
create policy "public read site content" on site_content for select using (true);
