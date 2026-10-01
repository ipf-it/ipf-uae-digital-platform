-- Generic, i18n-aware, workflow-approved content blocks for every informational page — the
-- relational generalisation of the old single-JSON-blob `site_content.extras` (CmsSection: carousel
-- | richText | photoGrid | cta), which could only ever append below a page's hardcoded body and
-- had no per-locale text. Two new block types (statList, imageText) cover shapes the old extras
-- system never needed to. Mirrors the chapters/chapters_i18n and tenant_content patterns already
-- live in this database.

create table if not exists pages (
  id text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id text not null references pages(id) on delete cascade,
  type text not null check (type in ('richText', 'photoGrid', 'carousel', 'cta', 'statList', 'imageText')),
  position int not null default 0,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published')),
  image text not null default '',
  slides jsonb not null default '[]'::jsonb,
  buttons jsonb not null default '[]'::jsonb,
  stats jsonb not null default '[]'::jsonb,
  updated_by uuid references admin_users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists page_sections_page_idx on page_sections (page_id, position);

create table if not exists page_sections_i18n (
  section_id uuid not null references page_sections(id) on delete cascade,
  locale text not null,
  eyebrow text not null default '',
  title text not null default '',
  description text not null default '',
  body text not null default '',
  primary key (section_id, locale)
);

alter table pages enable row level security;
alter table page_sections enable row level security;
alter table page_sections_i18n enable row level security;

drop policy if exists "public read active pages" on pages;
create policy "public read active pages" on pages for select using (active = true);
drop policy if exists "public read published page sections" on page_sections;
create policy "public read published page sections" on page_sections for select using (workflow_status = 'published');
drop policy if exists "public read page sections i18n" on page_sections_i18n;
create policy "public read page sections i18n" on page_sections_i18n for select using (true);
