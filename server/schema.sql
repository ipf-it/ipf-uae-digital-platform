-- IPF UAE — run once in the Supabase SQL editor (Dashboard → SQL).
-- Then create a public storage bucket named ipf-uploads (Storage → New bucket → public).

create extension if not exists pgcrypto;

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('member', 'yuva')),
  membership_no text not null unique,
  name text not null,
  email text not null unique,
  phone text not null default '',
  emirate text not null default '',
  chapter text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  registration_no text not null unique,
  name text not null,
  email text not null,
  phone text not null default '',
  status text not null default 'registered' check (status in ('registered', 'cancelled', 'attended')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists event_registrations_event_idx on event_registrations (event_id, created_at desc);

create table if not exists event_volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned', 'confirmed', 'attended')),
  created_at timestamptz not null default now(),
  unique (event_id, person_id)
);

create index if not exists event_volunteers_event_idx on event_volunteers (event_id, created_at desc);

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

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  kind text not null check (kind in ('person', 'cms_central', 'cms_chapter')),
  person_id uuid references people(id) on delete cascade,
  chapter_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_idx on sessions (token_hash);
create index if not exists sessions_expiry_idx on sessions (expires_at);

create table if not exists chapter_admins (
  chapter_id text primary key,
  chapter_name text not null,
  password_hash text not null
);

create table if not exists site_content (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table people enable row level security;
alter table volunteer_hours enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table event_volunteers enable row level security;
alter table inquiries enable row level security;
alter table donations enable row level security;
alter table sessions enable row level security;
alter table chapter_admins enable row level security;
alter table site_content enable row level security;

create policy "public read published events" on events for select using (published = true);
create policy "public read site content" on site_content for select using (true);

