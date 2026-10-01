-- One-time, guarded seed of Support page content (grievance/counselling and community-support
-- paragraphs, previously hardcoded i18n keys only) into page_sections, continuing the 017 cutover.
insert into pages (id) values ('support') on conflict (id) do nothing;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'support') then

  with new_section as (
    insert into page_sections (page_id, type, position, image)
    values ('support', 'richText', 0, '/legacy-assets/images/grievence-couseling.png')
    returning id
  )
  insert into page_sections_i18n (section_id, locale, title, body)
  select id, 'en', 'Grievance & counselling support',
    E'Cultural challenges. IPF counselling volunteers can guide new Indian residents to overcome cultural challenges and to adopt the UAE as home, with respect for local laws and customs.\n\nBlue-collared workers. IPF remains at the forefront of counselling and mentoring to reduce hardship. During COVID-19, volunteers arranged chartered flights, food, shelter, clothing, bedding, masks, sanitizers and financial support.\n\nLocal services. The programme also facilitates information forums on employment, medical and social services that can assist community members.'
  from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image)
    values ('support', 'richText', 1, '/legacy-assets/images/community-support.png')
    returning id
  )
  insert into page_sections_i18n (section_id, locale, title, body)
  select id, 'en', 'Community support',
    'IPF provides a forum for cultural, educational, recreational and philosophical activities. Dedicated volunteers include senior professionals in medicine, law, business, engineering and other fields, with diverse linguistic and regional representation in each chapter.'
  from new_section;

end if;
end $$;
