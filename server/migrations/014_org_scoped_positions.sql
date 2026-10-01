-- Seeds standard chapter- and council-level committee positions. 010/011 only seeded the central
-- (global) committee, so every chapter/council page's "Officers" section has had nothing to select
-- from when a chapter/council admin tries to add their own committee members — this is the missing
-- role vocabulary those admins need. Guarded to run only once per level (skips if that level's
-- positions already exist), so it's safe to re-run this file.

do $$
begin
if not exists (select 1 from positions where level = 'chapter') then

  insert into positions (slug, level, display_order) values
    ('chapter-president', 'chapter', 1),
    ('chapter-vice-president', 'chapter', 2),
    ('chapter-general-secretary', 'chapter', 3),
    ('chapter-joint-secretary', 'chapter', 4),
    ('chapter-treasurer', 'chapter', 5),
    ('chapter-committee-member', 'chapter', 6);

  insert into positions_i18n (position_id, locale, title)
    select id, 'en', case slug
      when 'chapter-president' then 'Chapter President'
      when 'chapter-vice-president' then 'Chapter Vice President'
      when 'chapter-general-secretary' then 'Chapter General Secretary'
      when 'chapter-joint-secretary' then 'Chapter Joint Secretary'
      when 'chapter-treasurer' then 'Chapter Treasurer'
      when 'chapter-committee-member' then 'Chapter Committee Member'
    end
    from positions where level = 'chapter';

end if;

if not exists (select 1 from positions where level = 'council') then

  insert into positions (slug, level, display_order) values
    ('council-convenor', 'council', 1),
    ('council-co-convenor', 'council', 2),
    ('council-secretary', 'council', 3),
    ('council-treasurer', 'council', 4),
    ('council-committee-member', 'council', 5);

  insert into positions_i18n (position_id, locale, title)
    select id, 'en', case slug
      when 'council-convenor' then 'Council Convenor'
      when 'council-co-convenor' then 'Council Co-Convenor'
      when 'council-secretary' then 'Council Secretary'
      when 'council-treasurer' then 'Council Treasurer'
      when 'council-committee-member' then 'Council Committee Member'
    end
    from positions where level = 'council';

end if;
end $$;
