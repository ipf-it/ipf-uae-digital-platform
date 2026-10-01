-- Site navigation hierarchy — previously a fully hardcoded array (src/data/navigation.ts:
-- primaryNav/footerGroups/mobileTabs/utilityLinks) with no admin edit path. One flat table with
-- parent_id covers all four menus: a 'primary' top-level item's children become its dropdown, a
-- 'footer' top-level item (no to_path of its own) is a footer column heading whose children are
-- its links, 'mobile'/'utility' are flat (no children expected).
create table if not exists nav_items (
  id uuid primary key default gen_random_uuid(),
  menu text not null check (menu in ('primary', 'footer', 'mobile', 'utility')),
  parent_id uuid references nav_items(id) on delete cascade,
  label text not null default '',
  to_path text not null default '',
  mega text check (mega in ('chapters', 'councils')),
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists nav_items_menu_idx on nav_items (menu, parent_id, position);

create table if not exists nav_items_i18n (
  nav_item_id uuid not null references nav_items(id) on delete cascade,
  locale text not null,
  label text not null default '',
  primary key (nav_item_id, locale)
);

alter table nav_items enable row level security;
alter table nav_items_i18n enable row level security;
drop policy if exists "public read active nav_items" on nav_items;
create policy "public read active nav_items" on nav_items for select using (active = true);
drop policy if exists "public read nav_items_i18n" on nav_items_i18n;
create policy "public read nav_items_i18n" on nav_items_i18n for select using (true);
