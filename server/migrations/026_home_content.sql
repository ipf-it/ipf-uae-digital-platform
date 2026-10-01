-- The actual homepage hero/key-section text was still hardcoded i18n keys with zero admin edit
-- path — only the bonus "home-extras" banners were editable. This is the fix: a single-row,
-- fixed-field, i18n-aware table for the homepage's real content (hero badge/title/intro,
-- president quote, "who we are", join CTA), editable from the same Pages admin tab.
create table if not exists home_content (
  id text primary key default 'home',
  hero_badge text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_intro text not null default '',
  president_quote_title text not null default '',
  president_quote_body text not null default '',
  who_eyebrow text not null default '',
  who_title text not null default '',
  who_body text not null default '',
  join_eyebrow text not null default '',
  join_title text not null default '',
  join_desc text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists home_content_i18n (
  home_id text not null references home_content(id) on delete cascade,
  locale text not null,
  hero_badge text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_intro text not null default '',
  president_quote_title text not null default '',
  president_quote_body text not null default '',
  who_eyebrow text not null default '',
  who_title text not null default '',
  who_body text not null default '',
  join_eyebrow text not null default '',
  join_title text not null default '',
  join_desc text not null default '',
  primary key (home_id, locale)
);

alter table home_content enable row level security;
alter table home_content_i18n enable row level security;
drop policy if exists "public read home_content" on home_content;
create policy "public read home_content" on home_content for select using (true);
drop policy if exists "public read home_content_i18n" on home_content_i18n;
create policy "public read home_content_i18n" on home_content_i18n for select using (true);

-- Seed the single row from today's hardcoded English copy, so nothing goes blank on cutover.
insert into home_content (id) values ('home') on conflict (id) do nothing;
insert into home_content_i18n (home_id, locale, hero_badge, hero_title, hero_subtitle, hero_intro, president_quote_title, president_quote_body, who_eyebrow, who_title, who_body, join_eyebrow, join_title, join_desc)
values (
  'home', 'en',
  'Official community organisation', 'Indian People''s Forum', 'United Arab Emirates',
  'Since 2014, IPF has served the Indian community in the UAE through welfare support, cultural programmes, and coordination with Indian missions.',
  'President''s message',
  'We believe in अनेकता में एकता. IPF invites every member of the community to join this journey of service, unity and responsibility.',
  'Who we are', 'Serving Indians in the UAE',
  'IPF is open to all Indians in the UAE irrespective of caste, creed, ethnicity or religion. The forum promotes unity, cultural relations, and support for those in need.',
  'Get involved', 'Join the IPF mission in the UAE', 'Become a member, volunteer for community programmes, or write to us for support.'
) on conflict (home_id, locale) do nothing;
