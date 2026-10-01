-- One-time, guarded seed of real page content (extracted from src/i18n/messages.ts and
-- src/data/platformContent.ts) into the new page_sections model — the actual "stop hardcoding"
-- cutover for About, History, Governance, Membership, Yuva, Privileges, Testimonials and Discover
-- India. English only; other languages can be filled in later from the Pages admin tab. Guarded
-- per-page (skips a page that already has sections), so it's safe to re-run this file.

insert into pages (id) values ('about') on conflict (id) do nothing;
insert into pages (id) values ('history') on conflict (id) do nothing;
insert into pages (id) values ('governance') on conflict (id) do nothing;
insert into pages (id) values ('membership') on conflict (id) do nothing;
insert into pages (id) values ('yuva') on conflict (id) do nothing;
insert into pages (id) values ('privileges') on conflict (id) do nothing;
insert into pages (id) values ('testimonials') on conflict (id) do nothing;
insert into pages (id) values ('discover-india') on conflict (id) do nothing;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'about') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('about', 'imageText', 0, '/legacy-assets/images/india-uae.jpg', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', '', '', 'We aim to provide a supporting link between Indian government missions and citizens. We endeavour to build cultural ties between India and the UAE through social engagement, and to uphold a reputation for honesty, magnanimity and professionalism.

We aspire to offer a helping hand for the welfare of every Non-Resident Indian living in the UAE and to help resolve issues faced by community members. With the dream of a peaceful, just and prosperous India, we wish to enhance people-to-people connect between India and the UAE, and invite other nationalities to experience India''s culture and heritage.

Members come from all walks of life. They work as volunteers and contribute to the social development and well-being of fellow Indians.' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('about', 'imageText', 1, '/legacy-assets/images/our-vision2.png', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', 'Our Vision', 'A peaceful, just, tolerant and prosperous Indian community in the UAE', '', '• Diversity is valued and celebrated.
• Cultural heritage is enjoyed and nurtured.
• Indian cultural heritage is preserved.
• Deserving Indians'' hope is inspired and empowered.' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('about', 'statList', 2, '/legacy-assets/images/satyameva-jayate.png', '[{"label":"Integrity","value":""},{"label":"Transparency","value":""},{"label":"Professionalism","value":""},{"label":"Accountability","value":""}]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', 'Satyameva Jayate', 'Our Values', 'We aim to gain credibility by adhering to IPF''s commitments — displaying honesty and integrity, and reaching IPF goals solely through honourable conduct.', '' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('about', 'statList', 3, '', '[{"label":"Creating a platform for social and cultural activities involving different social groups from all over India.","value":""},{"label":"Organising events and activities for enriching the socio-cultural life of the Indian community.","value":""},{"label":"Educating Indians in the United Arab Emirates to be respectful and uphold the dignity of India.","value":""},{"label":"Finding solutions to issues of concern in the Indian community and encouraging mutual understanding with the host nation.","value":""},{"label":"Promoting strong business relationships between the UAE and India.","value":""},{"label":"Rendering legal and humanitarian assistance in genuine cases for Indians residing in the UAE.","value":""},{"label":"Supporting welfare activities for blue-collared workers.","value":""},{"label":"Supporting people in obtaining travel documents in coordination with the Indian Consulate and Embassy.","value":""},{"label":"Spreading public health awareness and organising free medical camps with healthcare providers in the UAE.","value":""},{"label":"Guiding workers towards better opportunities and a more systematic lifestyle.","value":""}]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', 'Enhancing Indian ethos', 'Aims & Objectives', 'To foster a peaceful, just and prosperous Indian community in the UAE where diversity is valued and celebrated, cultural heritage is nurtured, and the hope of all Indians remains vibrant, inspired and empowered.', '' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('about', 'imageText', 4, '/legacy-assets/images/responsiblity.png', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', 'Enabling & empowering', 'Our Responsibility', '', 'To work closely with concerned authorities on issues towards the betterment of society, including awareness among young children and adults. Educational hand-outs in regional languages guide the community to respect local sentiments and adhere to the laws of the UAE.

• Anti-alcohol drive
• Anti-smoking drive
• Anti-drugs campaign
• Blood donation drive
• Environment protection' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'history') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('history', 'statList', 0, '', '[{"label":"IPF formation — A volunteer-driven forum was initiated to support distressed Indians and community welfare needs.","value":"2014"},{"label":"COVID emergency response — Volunteers coordinated food, shelter, essential support, and repatriation assistance during crisis periods.","value":"2020-2021"},{"label":"Office inauguration in Ajman — IPF''s office inauguration marked a major institutional step in organised community service operations.","value":"2021"},{"label":"Eight-chapter UAE presence — Chapter-led activity across Emirates continues to support social, cultural, and welfare initiatives.","value":"Ongoing"}]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', 'Our journey', 'Milestones', '', '' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'governance') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('governance', 'richText', 0, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Bye Law', '', 'Indian People''s Forum UAE is a licensed socio-cultural organisation with a registered office in Ajman. The Managing Committee, comprising the Central Committee and Chapter Convenors, governs the forum according to its rules.

Membership is open to persons of Indian origin living in the UAE with a valid residential visa. The Executive Committee considers applications and informs applicants of the decision.

Chapters are IPF sub-bodies assigned to cities and emirates. IPF currently maintains eight chapters covering the UAE.' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('governance', 'richText', 1, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Code of Ethics & Conduct', 'IPF''s published values are Integrity, Transparency, Professionalism and Accountability.', '• Volunteers and members shall conduct themselves honourably in all community work.
• The forum is open to all Indians irrespective of caste, creed, ethnicity or religion.
• Members shall respect the laws, customs and dignity of the United Arab Emirates.
• Community support is offered without discrimination and without personal commercial interest.
• Office-bearers shall keep organisational communication factual and respectful.' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('governance', 'richText', 2, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'IT & Media Policy', '', 'Official public information is published on this website and through IPF''s recognised social channels. Media and IT volunteers shall not publish confidential member data, grievance case details, or unverified claims in the name of IPF.

Photographs from events may be used for organisational outreach. Requests to remove a photograph can be sent to info@ipf-uae.org. A fuller IT policy document will be attached when the CMS is connected.' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'membership') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('membership', 'richText', 0, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Two ways to join', '', 'Member. Community membership of Indian People''s Forum UAE. Create an account for a digital membership card, then submit the application on this page.

IPF Yuva. Youth membership of IPF UAE. Registration issues a permanent Yuva ID and QR card for event service. Separate from community membership.

One registration covers both — you''ll verify your mobile number, then tell us your UAE emirate and your home state in India, so you show up correctly in both your local chapter and your state council. Tick the volunteer box if you''d like to join as IPF Yuva too — it''s the same account either way.' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('membership', 'richText', 1, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'After you apply', '', 'The Executive Committee will consider your application and write to you by email. On acceptance you will need to send proof of resident status (passport and valid visa copy) to be officially enrolled.' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'yuva') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('yuva', 'richText', 0, '', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', '', '', 'Indian People''s Forum announced IPF Yuva on 20 October 2024 as a youth-focused programme of IPF UAE. The official IPF website did not yet carry a Yuva page; this space is that home.

IPF Yuva is the youth membership of Indian People''s Forum UAE. Community members enrol through the membership application. Yuva is for young volunteers who serve at chapter events, cultural programmes and community work. On registration you receive a permanent Yuva ID and a digital card with a QR code.

• Permanent Yuva ID in the form YUVA-UAE-XXXXXX
• Digital volunteer card and QR for event duty
• Hours logged in the portal after you sign in
• Chapter desk can see Yuva volunteers from that emirate' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'privileges') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('privileges', 'statList', 0, '', '[{"label":"Access to a unique association of the Indian diaspora, not based on ethnic, religious, linguistic or professional background.","value":""},{"label":"Networking and socialising opportunities with fellow Indians for sharing knowledge and expertise.","value":""},{"label":"Information resources, including the official website and member bulletins.","value":""},{"label":"Seminars, roadshows, educational, social and cultural activities.","value":""},{"label":"Sports, health and fitness seminars.","value":""},{"label":"Grievance cell and counselling support.","value":""},{"label":"Webinar sessions from the IPF panel of doctors.","value":""},{"label":"Mentoring support and community recognition avenues.","value":""}]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Why join', '', '' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'testimonials') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('testimonials', 'carousel', 0, '', '[]'::jsonb, '[{"src":"/legacy-assets/images/sharjah-international-airport.jpg","alt":"Repatriation of Indian citizens from abroad","caption":"Repatriation of Indian citizens from abroad"},{"src":"/legacy-assets/images/covid-check-point-sharjah.jpg","alt":"Chartered-flight passengers at Sharjah International Airport","caption":"Chartered-flight passengers at Sharjah International Airport"},{"src":"/legacy-assets/images/community-support.png","alt":"Food distribution to stranded workers during COVID lockdown","caption":"Food distribution to stranded workers during COVID lockdown"},{"src":"/legacy-assets/images/IMG-20211003-WA0135.jpg","alt":"Ration support at labour camps in coordination with the Indian Consulate","caption":"Ration support at labour camps in coordination with the Indian Consulate"}]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Vande Bharat Mission', '', '' from new_section;

  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('testimonials', 'carousel', 1, '', '[]'::jsonb, '[{"src":"/legacy-assets/images/glimpse.jpg","alt":"Gandhi 150 with Indian Association Ajman and the Consulate General of India","caption":"Gandhi 150 with Indian Association Ajman and the Consulate General of India"},{"src":"/legacy-assets/images/glimses2.jpg","alt":"Programme at Indian Association Sharjah, inaugurated by Shri V. Muraleedharan","caption":"Programme at Indian Association Sharjah, inaugurated by Shri V. Muraleedharan"},{"src":"/legacy-assets/images/glimses3.jpg","alt":"Community gathering during the 150th anniversary commemorations","caption":"Community gathering during the 150th anniversary commemorations"},{"src":"/legacy-assets/images/slider1.jpg","alt":"IPF volunteers at a national commemorative programme","caption":"IPF volunteers at a national commemorative programme"}]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', 'Mahatma Gandhi 150-year programme', '', '' from new_section;

end if;
end $$;

do $$
begin
if not exists (select 1 from page_sections where page_id = 'discover-india') then
  with new_section as (
    insert into page_sections (page_id, type, position, image, stats, slides)
    values ('discover-india', 'imageText', 0, '/legacy-assets/images/india-uae.jpg', '[]'::jsonb, '[]'::jsonb)
    returning id
  )
  insert into page_sections_i18n (section_id, locale, eyebrow, title, description, body)
  select id, 'en', '', '', '', 'India — Bharat — Hindustan, officially the Republic of India, is the most populous democracy in the world and home to one of the longest continuous civilisations. Bounded by the Indian Ocean, the Arabian Sea and the Bay of Bengal, it is a continent of its own.

It is the birthplace of Hinduism, Buddhism, Jainism and Sikhism, and a land where Christianity, Islam, Judaism and Zoroastrianism have also put down deep roots. Every ecosystem — from the Himalayas to a coastline of thousands of kilometres — beckons nature lovers and seekers of art, history, culture and spiritual solace.

Four major climatic groupings predominate: tropical wet, tropical dry, subtropical humid, and montane. With UNESCO World Heritage Sites and countless temples, cities, wildlife sanctuaries and crafts, visitors are invited to go beyond the standard tourist circuit and savour the land in every nook and corner.

Every 100 km the weaves change, as does the language or dialect. One trip is never enough. We welcome you to immerse yourself in local life, then understand why the world once called this land the Bird of Gold.' from new_section;

end if;
end $$;

