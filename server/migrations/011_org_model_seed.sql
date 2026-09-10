-- One-time seed: migrates today's hardcoded chapter/council directory (src/data/orgNav.ts) and
-- committee membership (src/data/platformContent.ts) into the org_model tables from
-- 010_org_model.sql. Guarded to run only once — if `chapters` already has rows (this migration
-- already ran), every insert below is skipped, so it's safe to re-run this file.

do $$
begin
if not exists (select 1 from chapters) then

  insert into chapters (id, facebook_url, contact_email) values
    ('dubai', 'https://www.facebook.com/IPFDXB/', ''),
    ('abu-dhabi', 'https://m.facebook.com/IPFAUH/', 'abudhabi@ipf-uae.org'),
    ('sharjah', 'https://www.facebook.com/ipfshj/', ''),
    ('ajman', 'https://www.facebook.com/groups/957556891390124/', ''),
    ('al-ain', 'https://www.facebook.com/ipfalainuae', ''),
    ('umm-al-quwain', 'https://www.facebook.com/pages/category/Community/IPF-Umm-Al-Quwain-104290658106028/', ''),
    ('ras-al-khaimah', 'https://m.facebook.com/Indian-Peoples-Forum-Ras-Al-Khaimah-104319864808871/', ''),
    ('fujairah', 'https://www.facebook.com/Indian-Peoples-Forum-Fujairah-101913511853183/', '');

  insert into chapters_i18n (chapter_id, locale, name, description) values
    ('dubai', 'en', 'Dubai', 'Largest chapter presence, cultural programmes and welfare coordination.'),
    ('abu-dhabi', 'en', 'Abu Dhabi', 'Coordination with the Embassy of India and capital-city community outreach.'),
    ('sharjah', 'en', 'Sharjah', 'Chapter programmes, counselling support and cultural events.'),
    ('ajman', 'en', 'Ajman', 'Home of the registered office at Horizon Towers, Al Rashidiya.'),
    ('al-ain', 'en', 'Al Ain', 'Inland chapter serving families and workers in the Al Ain region.'),
    ('umm-al-quwain', 'en', 'Umm Al Quwain', 'Northern emirate chapter for local community engagement.'),
    ('ras-al-khaimah', 'en', 'Ras Al Khaimah', 'Northern chapter supporting cultural and welfare activity.'),
    ('fujairah', 'en', 'Fujairah', 'East-coast chapter covering Fujairah community programmes.');

  insert into councils (id, kind, region) values
    ('kerala', 'state', 'Kerala'), ('karnataka', 'state', 'Karnataka'), ('andhra-pradesh', 'state', 'Andhra Pradesh'),
    ('telangana', 'state', 'Telangana'), ('tamil-nadu', 'state', 'Tamil Nadu'), ('maharashtra', 'state', 'Maharashtra'),
    ('gujarat', 'state', 'Gujarat'), ('punjab', 'state', 'Punjab'), ('rajasthan', 'state', 'Rajasthan'),
    ('uttar-pradesh', 'state', 'Uttar Pradesh'), ('bihar', 'state', 'Bihar'), ('assam', 'state', 'Assam'),
    ('odisha', 'state', 'Odisha'), ('west-bengal', 'state', 'West Bengal'), ('madhya-pradesh', 'state', 'Madhya Pradesh'),
    ('haryana', 'state', 'Haryana'), ('jharkhand', 'state', 'Jharkhand'), ('chhattisgarh', 'state', 'Chhattisgarh'),
    ('uttarakhand', 'state', 'Uttarakhand'), ('himachal-pradesh', 'state', 'Himachal Pradesh'), ('goa', 'state', 'Goa'),
    ('arunachal-pradesh', 'state', 'Arunachal Pradesh'), ('manipur', 'state', 'Manipur'), ('meghalaya', 'state', 'Meghalaya'),
    ('mizoram', 'state', 'Mizoram'), ('nagaland', 'state', 'Nagaland'), ('sikkim', 'state', 'Sikkim'), ('tripura', 'state', 'Tripura'),
    ('business', 'special', 'Professionals and enterprises'), ('womens', 'special', 'Women''s programmes'), ('cultural', 'special', 'Culture and commemorations');

  insert into councils_i18n (council_id, locale, name)
    select id, 'en', initcap(replace(id, '-', ' ')) || ' Council' from councils where kind = 'state';
  insert into councils_i18n (council_id, locale, name) values
    ('business', 'en', 'Business Council'), ('womens', 'en', 'Women''s Council'), ('cultural', 'en', 'Cultural Council');

  insert into terms (id, label, starts_on) values ('00000000-0000-0000-0000-000000000001', 'Current term', now()::date);

  insert into positions (slug, level, display_order) values
    ('president', 'central', 1), ('gen-sec-ops', 'central', 2), ('gen-sec-sangathan', 'central', 3),
    ('vp-cultural', 'central', 4), ('vp-sports', 'central', 5), ('vp-state-council', 'central', 6),
    ('joint-secretary', 'central', 7), ('exec-head-comms', 'central', 8), ('treasurer', 'central', 9),
    ('business-convenor', 'central', 10), ('business-co-convenor', 'central', 11), ('startup-hub-board', 'central', 12),
    ('business-board-member', 'central', 13), ('csr-head', 'central', 14), ('csr-support-food', 'central', 15),
    ('legal-cell', 'central', 16), ('drishti-convenor', 'central', 17), ('it-media-head', 'central', 18),
    ('central-committee-member', 'central', 19);

  insert into positions_i18n (position_id, locale, title)
    select id, 'en', case slug
      when 'president' then 'President – IPF UAE'
      when 'gen-sec-ops' then 'General Secretary (Operation & Execution)'
      when 'gen-sec-sangathan' then 'General Secretary (Sangathan)'
      when 'vp-cultural' then 'Vice President – Cultural & Creative Art'
      when 'vp-sports' then 'Vice President – Sports, Leisure & Fitness'
      when 'vp-state-council' then 'Vice President – Head of State Council'
      when 'joint-secretary' then 'Joint Secretary – IPF UAE'
      when 'exec-head-comms' then 'Executive Head (Communication & Wellness)'
      when 'treasurer' then 'Treasurer – IPF UAE'
      when 'business-convenor' then 'Convenor (Business Council)'
      when 'business-co-convenor' then 'Co-Convenor, Business Council'
      when 'startup-hub-board' then 'Startup Hub & Business Council Board'
      when 'business-board-member' then 'Board Member, Business Council'
      when 'csr-head' then 'CSR Head'
      when 'csr-support-food' then 'CSR Support – Food'
      when 'legal-cell' then 'Legal Cell'
      when 'drishti-convenor' then 'Drishti Convenor'
      when 'it-media-head' then 'Head, IT & Media'
      when 'central-committee-member' then 'Central Committee Member'
    end
    from positions;

  insert into appointments (person_name, person_image, position_id, scope_type, term_id, display_order)
    select v.name, v.image, p.id, 'global', '00000000-0000-0000-0000-000000000001', v.ord
    from (values
      ('Jitendra Vaidya', '/legacy-assets/images/president.jpg', 'president', 1),
      ('Rajeev Ranjan Singh', '/legacy-assets/images/rajiv-ranjan.jpg', 'gen-sec-ops', 2),
      ('Pradeep Murali', '/legacy-assets/images/Pradeep_Ji.jpeg', 'gen-sec-sangathan', 3),
      ('Shilpa Nair', '/legacy-assets/images/shilap-nair.jpg', 'vp-cultural', 4),
      ('Ashok Doshi', '/legacy-assets/images/Ashok_Doshi.jpeg', 'vp-sports', 5),
      ('RB', '/legacy-assets/images/RB.png', 'vp-state-council', 6),
      ('Shashidar Nagrajappa', '/legacy-assets/images/Shashi.jpeg', 'joint-secretary', 7),
      ('Hariram', '/legacy-assets/images/WhatsApp_Image_2024-12-26_at_12.23.16.jpeg', 'joint-secretary', 8),
      ('Dr. Nishi Singh', '/legacy-assets/images/Screenshot_2023-04-25_at_7.22.36_AM.png', 'exec-head-comms', 9),
      ('Vijayan Nair', '/legacy-assets/images/vijayan-nair.jpg', 'treasurer', 10),
      ('Shri Mahesh Advani', '', 'business-convenor', 11),
      ('Shri Shailendra Rugwani', '', 'business-co-convenor', 12),
      ('Shri Chintan Serin', '', 'startup-hub-board', 13),
      ('Shri Praveen Shetty', '', 'business-board-member', 14),
      ('Smt. Umashankari Krishnamurthy', '', 'csr-head', 15),
      ('Smt. Kusum Dutta', '', 'csr-support-food', 16),
      ('Adv. Anjana Bhatia', '', 'legal-cell', 17),
      ('Adv. Bindu Chettur', '', 'legal-cell', 18),
      ('Smt. Sumita Satish', '', 'drishti-convenor', 19),
      ('Shri Bhushan Chaudhari', '', 'it-media-head', 20),
      ('Shri Raghu TG', '', 'central-committee-member', 21),
      ('Capt. Ram Kumar Gautham', '', 'central-committee-member', 22),
      ('Shri Manikandan Meloth', '', 'central-committee-member', 23),
      ('Shri Sibi Mani', '', 'central-committee-member', 24)
    ) as v(name, image, slug, ord)
    join positions p on p.slug = v.slug;

end if;
end $$;
