-- Organisational domain model: chapters, councils, positions and appointments become real,
-- admin-manageable database entities instead of hardcoded TypeScript arrays
-- (src/data/orgNav.ts, platformContent.ts). Each translatable entity gets a parallel `_i18n`
-- table keyed by the 10 locale ids already defined in src/i18n/locales.ts, so admin-authored
-- organisational content can be translated the same way the rest of the site's static UI text
-- already is — `en` is always the required fallback row, other locales are optional.
--
-- Appointments intentionally do NOT require a `people` row: `person_name`/`person_image` hold
-- the display identity directly, with an optional `person_id` link for when the office bearer is
-- also a registered member. This is the practical form of "a person shouldn't need a login to
-- appear in organisational records" — the ~24 current committee members have no member accounts
-- at all, and shouldn't need one just to exist as an office bearer.

create table if not exists chapters (
  id text primary key,
  emirate_code text not null default '',
  established_date date,
  contact_email text not null default '',
  contact_phone text not null default '',
  facebook_url text not null default '',
  image text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chapters_i18n (
  chapter_id text not null references chapters(id) on delete cascade,
  locale text not null,
  name text not null default '',
  description text not null default '',
  primary key (chapter_id, locale)
);

create table if not exists councils (
  id text primary key,
  kind text not null check (kind in ('state', 'special')),
  region text not null default '',
  contact_email text not null default '',
  image text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists councils_i18n (
  council_id text not null references councils(id) on delete cascade,
  locale text not null,
  name text not null default '',
  description text not null default '',
  primary key (council_id, locale)
);

create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  starts_on date,
  ends_on date
);

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  level text not null check (level in ('central', 'chapter', 'council')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists positions_i18n (
  position_id uuid not null references positions(id) on delete cascade,
  locale text not null,
  title text not null default '',
  primary key (position_id, locale)
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete set null,
  person_name text not null default '',
  person_image text not null default '',
  position_id uuid not null references positions(id) on delete cascade,
  scope_type text not null check (scope_type in ('global', 'chapter', 'council')),
  scope_id text,
  term_id uuid references terms(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed')),
  started_at date,
  ended_at date,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_scope_idx on appointments (scope_type, scope_id, status);
create index if not exists appointments_person_idx on appointments (person_id);

alter table chapters enable row level security;
alter table chapters_i18n enable row level security;
alter table councils enable row level security;
alter table councils_i18n enable row level security;
alter table terms enable row level security;
alter table positions enable row level security;
alter table positions_i18n enable row level security;
alter table appointments enable row level security;

drop policy if exists "public read chapters" on chapters;
create policy "public read chapters" on chapters for select using (active = true);
drop policy if exists "public read chapters_i18n" on chapters_i18n;
create policy "public read chapters_i18n" on chapters_i18n for select using (true);
drop policy if exists "public read councils" on councils;
create policy "public read councils" on councils for select using (active = true);
drop policy if exists "public read councils_i18n" on councils_i18n;
create policy "public read councils_i18n" on councils_i18n for select using (true);
drop policy if exists "public read terms" on terms;
create policy "public read terms" on terms for select using (true);
drop policy if exists "public read positions" on positions;
create policy "public read positions" on positions for select using (true);
drop policy if exists "public read positions_i18n" on positions_i18n;
create policy "public read positions_i18n" on positions_i18n for select using (true);
drop policy if exists "public read appointments" on appointments;
create policy "public read appointments" on appointments for select using (status = 'active');
