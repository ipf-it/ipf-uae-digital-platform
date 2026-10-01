-- Drishti e-Magazine as structured, admin-manageable publications — previously a hardcoded array
-- (src/data/platformContent.ts: drishtiEditions) with no admin path at all. `file_url` holds either
-- an external reader link (today's fliphtml5/issuu editions) or an uploaded PDF from
-- /api/admin/upload — either way the public page just links out to it.
create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  publication_type text not null default 'Drishti',
  title text not null,
  edition text not null default '',
  publish_date date,
  description text not null default '',
  cover_image text not null default '',
  file_url text not null default '',
  featured_on_homepage boolean not null default false,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table publications enable row level security;
drop policy if exists "public read active publications" on publications;
create policy "public read active publications" on publications for select using (active = true);

-- One-time, guarded seed of the 19 existing editions (title/period/image/external reader link),
-- in their current display order, so the page doesn't go blank on cutover.
do $$
begin
if not exists (select 1 from publications) then
  insert into publications (title, edition, cover_image, file_url, display_order) values
    ('Special Booklet', 'August 2026', '/legacy-assets/images/Dirshti_Special_Booklet_Cover.JPG', 'https://online.fliphtml5.com/Dirshti-ipf-uae/IPF-Drishti-Special-Booklet/', 0),
    ('Drishti', 'January 2026', '/legacy-assets/images/WhatsApp_Image_2026-01-12_at_2.55.27_PM_1_.jpeg', 'https://online.fliphtml5.com/Dirshti-ipf-uae/IPF-DRISHTI_Jan2026-compressed/', 1),
    ('Drishti', 'October 2025', '/legacy-assets/images/IPF_DRISHTI_V1.1_Cover.png', 'https://online.fliphtml5.com/Dirshti-ipf-uae/iuth/', 2),
    ('Drishti', 'June 2025', '/legacy-assets/images/Drishti-June2025.JPG', 'https://online.fliphtml5.com/drofk/zgmt/#p=1', 3),
    ('Drishti', 'September 2023', '/legacy-assets/images/Drishti_News_letter_September_2023.jpg', 'https://online.fliphtml5.com/izpvx/uzsh/', 4),
    ('Drishti', 'July 2023', '/legacy-assets/images/Drishti_July_2023_issue.jpg', 'https://online.fliphtml5.com/izpvx/ummv/', 5),
    ('Drishti', 'May 2023', '/legacy-assets/images/Drishti_News_letter_May_2023.jpg', 'https://online.fliphtml5.com/izpvx/tzuq/', 6),
    ('Drishti', 'March 2023', '/legacy-assets/images/IPF_Drishti_News_Letter_march_2023.jpg', 'https://online.fliphtml5.com/izpvx/xnqb/', 7),
    ('Drishti', 'January 2023', '/legacy-assets/images/IPF_Drishti_News_Letter_Jan_2023.jpg', 'https://online.fliphtml5.com/izpvx/tdox/', 8),
    ('Drishti', 'November 2022', '/legacy-assets/images/Drishti_News_Letter_November_2022_page-0001.jpg', 'https://online.fliphtml5.com/izpvx/gfss/#p=1', 9),
    ('Drishti', 'August 2022', '/legacy-assets/images/Screenshot_2022-08-30_at_10.52.25_AM.png', 'https://online.fliphtml5.com/izpvx/xtfa/', 10),
    ('Drishti', 'July 2022', '/legacy-assets/images/Screenshot_2022-06-29_at_7.43.15_AM.png', 'https://online.fliphtml5.com/izpvx/bnct/', 11),
    ('Drishti', 'May 2022', '/legacy-assets/images/Screenshot_2022-04-30_at_9.31.40_PM.png', 'https://online.fliphtml5.com/izpvx/atqw/', 12),
    ('Drishti', 'March 2022', '/legacy-assets/images/DRISHTI.png', 'https://online.fliphtml5.com/izpvx/iuyq/', 13),
    ('Drishti', 'January 2022', '/legacy-assets/images/Page_1_Edition_4.png', 'https://online.fliphtml5.com/izpvx/hehs/', 14),
    ('Drishti', 'November 2021', '/legacy-assets/images/Drishti_Cover_Page.png', 'https://online.fliphtml5.com/izpvx/qhjt/', 15),
    ('Drishti', 'September 2021', '/legacy-assets/images/Screen_Shot_2021-09-09_at_10.23.55_AM.png', 'https://online.fliphtml5.com/izpvx/qzsk/', 16),
    ('Drishti', 'July 2021', '/legacy-assets/images/Cover_Page.png', 'https://fliphtml5.com/izpvx/xmbk', 17),
    ('Drishti', 'February 2021', '/legacy-assets/images/page_1.jpg', 'https://issuu.com/ipfuae/docs/drishti_feb', 18);
end if;
end $$;
