-- Align Chapters + Councils with the authoritative IPF 2026 structure:
--   • 7 active Chapters (Fujairah deactivated, record preserved)
--   • 15 active State Councils (new set per 2026 master)
--   • 4 active Special Councils (Startup Hub, Business, Women, Yuva)
--
-- Historical records are PRESERVED (never deleted) and switch to
-- active=false so related events / news / people / appointments remain
-- intact and a Central/Super Admin can reactivate them later via the
-- admin UI by flipping `active` and adjusting the public allowlist in
-- server/handleRequest.ts.
--
-- Also adds a `district` column to the `people` table so registration
-- can capture home district alongside home state.

------------------------------------------------------------------
-- 1. Chapters: deactivate Fujairah; keep its row for historical data
------------------------------------------------------------------
update chapters
set active = false, updated_at = now()
where id = 'fujairah';

update chapters
set active = true, updated_at = now()
where id in (
  'dubai', 'abu-dhabi', 'sharjah', 'ajman',
  'umm-al-quwain', 'ras-al-khaimah', 'al-ain'
);

------------------------------------------------------------------
-- 2. Councils: insert new records (Delhi, Startup Hub, Yuva Council)
------------------------------------------------------------------
insert into councils (id, kind, region) values
  ('delhi', 'state', 'Delhi'),
  ('startup-hub', 'special', 'Startup and enterprise builders'),
  ('yuva-council', 'special', 'Youth programmes')
on conflict (id) do nothing;

-- English display names for the new + renamed councils.
insert into councils_i18n (council_id, locale, name) values
  ('delhi', 'en', 'Delhi Council'),
  ('startup-hub', 'en', 'Startup Hub'),
  ('yuva-council', 'en', 'Yuva Council')
on conflict (council_id, locale) do nothing;

-- Normalise existing display names to match the authoritative 2026 brief.
update councils_i18n set name = 'Business Council' where council_id = 'business' and locale = 'en';
update councils_i18n set name = 'Women Council' where council_id = 'womens' and locale = 'en';

------------------------------------------------------------------
-- 3. State Councils: align the 15 active public set
--    Keep: Kerala, Tamil Nadu, Karnataka, Gujarat, Uttar Pradesh,
--          Telangana, Bihar, Maharashtra, Rajasthan, Madhya Pradesh,
--          Uttarakhand, Haryana, Chhattisgarh, Delhi, Odisha
--    Deactivate (preserve rows): Andhra Pradesh, Punjab, West Bengal,
--          Assam, Jharkhand, Himachal Pradesh, Goa, Arunachal Pradesh,
--          Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura
------------------------------------------------------------------
update councils
set active = true, updated_at = now()
where kind = 'state'
  and id in (
    'kerala', 'tamil-nadu', 'karnataka', 'gujarat', 'uttar-pradesh',
    'telangana', 'bihar', 'maharashtra', 'rajasthan', 'madhya-pradesh',
    'uttarakhand', 'haryana', 'chhattisgarh', 'delhi', 'odisha'
  );

update councils
set active = false, updated_at = now()
where kind = 'state'
  and id not in (
    'kerala', 'tamil-nadu', 'karnataka', 'gujarat', 'uttar-pradesh',
    'telangana', 'bihar', 'maharashtra', 'rajasthan', 'madhya-pradesh',
    'uttarakhand', 'haryana', 'chhattisgarh', 'delhi', 'odisha'
  );

------------------------------------------------------------------
-- 4. Special Councils: 4 active (Startup Hub, Business, Women, Yuva)
--    Cultural is reclassified as a Wing in the 2026 structure and
--    moves to active=false here (record preserved).
------------------------------------------------------------------
update councils
set active = true, updated_at = now()
where kind = 'special'
  and id in ('startup-hub', 'business', 'womens', 'yuva-council');

update councils
set active = false, updated_at = now()
where kind = 'special'
  and id = 'cultural';

------------------------------------------------------------------
-- 5. People: add district column + supporting index
------------------------------------------------------------------
alter table people add column if not exists district text not null default '';
create index if not exists people_district_idx on people (district);
