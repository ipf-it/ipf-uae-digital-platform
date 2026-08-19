-- Run in Supabase SQL editor if the events table already exists from the first schema.
alter table events add column if not exists category text not null default 'Community';
alter table events add column if not exists emirate text not null default 'uae';
alter table events add column if not exists starts_at timestamptz;
alter table events add column if not exists ends_at timestamptz;
alter table events add column if not exists is_free boolean not null default true;
create index if not exists events_starts_idx on events (starts_at desc);
create index if not exists events_category_idx on events (category, emirate);
