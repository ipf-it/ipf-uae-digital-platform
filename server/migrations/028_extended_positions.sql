-- Real chapter/council committee rosters (collected directly from each chapter/council, 2026-27
-- term) use "Convenor / Co-Convenor / General Secretary / Joint Secretary / Treasurer / Executive
-- Committee Member" throughout — the same vocabulary councils already used, not the
-- "President / Vice President" terms chapter-level positions were originally seeded with in
-- 014_org_scoped_positions.sql (an unverified guess at the time, never actually used since). This
-- adds the real, observed vocabulary for both levels rather than renaming the old rows, since nothing
-- references them and a rename risks nothing but adds no value either.
do $$
begin
if not exists (select 1 from positions where slug = 'chapter-convenor' and level = 'chapter') then

  insert into positions (slug, level, display_order) values
    ('chapter-convenor', 'chapter', 7),
    ('chapter-co-convenor', 'chapter', 8),
    ('chapter-joint-treasurer', 'chapter', 9),
    ('chapter-media-incharge', 'chapter', 10),
    ('chapter-events-incharge', 'chapter', 11),
    ('chapter-csr-incharge', 'chapter', 12),
    ('chapter-coordinator', 'chapter', 13),
    ('chapter-mentor', 'chapter', 14),
    ('chapter-advisor', 'chapter', 15);

  insert into positions_i18n (position_id, locale, title)
    select id, 'en', case slug
      when 'chapter-convenor' then 'Convenor'
      when 'chapter-co-convenor' then 'Co-Convenor'
      when 'chapter-joint-treasurer' then 'Joint Treasurer'
      when 'chapter-media-incharge' then 'Media Incharge'
      when 'chapter-events-incharge' then 'Events Organizing Incharge'
      when 'chapter-csr-incharge' then 'CSR Activity Incharge'
      when 'chapter-coordinator' then 'Coordinator'
      when 'chapter-mentor' then 'Mentor'
      when 'chapter-advisor' then 'Advisor'
    end
    from positions where level = 'chapter' and slug in (
      'chapter-convenor', 'chapter-co-convenor', 'chapter-joint-treasurer', 'chapter-media-incharge',
      'chapter-events-incharge', 'chapter-csr-incharge', 'chapter-coordinator', 'chapter-mentor', 'chapter-advisor'
    );

end if;

if not exists (select 1 from positions where slug = 'council-joint-secretary' and level = 'council') then

  insert into positions (slug, level, display_order) values
    ('council-joint-secretary', 'council', 6),
    ('council-joint-treasurer', 'council', 7),
    ('council-media-incharge', 'council', 8),
    ('council-events-incharge', 'council', 9),
    ('council-csr-incharge', 'council', 10),
    ('council-coordinator', 'council', 11),
    ('council-mentor', 'council', 12),
    ('council-advisor', 'council', 13);

  insert into positions_i18n (position_id, locale, title)
    select id, 'en', case slug
      when 'council-joint-secretary' then 'Joint Secretary'
      when 'council-joint-treasurer' then 'Joint Treasurer'
      when 'council-media-incharge' then 'Media Incharge'
      when 'council-events-incharge' then 'Events Organizing Incharge'
      when 'council-csr-incharge' then 'CSR Activity Incharge'
      when 'council-coordinator' then 'Coordinator'
      when 'council-mentor' then 'Mentor'
      when 'council-advisor' then 'Advisor'
    end
    from positions where level = 'council' and slug in (
      'council-joint-secretary', 'council-joint-treasurer', 'council-media-incharge', 'council-events-incharge',
      'council-csr-incharge', 'council-coordinator', 'council-mentor', 'council-advisor'
    );

end if;
end $$;
