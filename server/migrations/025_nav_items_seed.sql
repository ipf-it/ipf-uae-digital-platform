-- One-time, guarded seed of today's hardcoded navigation.ts arrays into nav_items — the
-- "stop hardcoding the nav" cutover. English only; translations can be added later from the
-- Navigation admin tab, same as every other i18n-aware admin-managed content this session.

do $$
declare
  parent_id uuid;
begin
if not exists (select 1 from nav_items) then

  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'About', '/about', null, 0) returning id into parent_id;
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'About IPF', '/about', 0);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'History', '/history', 1);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'Governance', '/governance', 2);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'Support', '/support', 3);
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'Leadership', '/leadership', null, 1) returning id into parent_id;
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'President''s Message', '/leadership', 0);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('primary', parent_id, 'Committee', '/leadership#committee', 1);
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'Chapters', '/chapters', 'chapters', 2) returning id into parent_id;
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'Councils', '/councils', 'councils', 3) returning id into parent_id;
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'Events', '/events', null, 4) returning id into parent_id;
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'Gallery', '/gallery', null, 5) returning id into parent_id;
  insert into nav_items (menu, label, to_path, mega, position) values ('primary', 'News', '/news', null, 6) returning id into parent_id;
  insert into nav_items (menu, label, to_path, position) values ('mobile', 'Home', '/', 0);
  insert into nav_items (menu, label, to_path, position) values ('mobile', 'Leaders', '/leadership', 1);
  insert into nav_items (menu, label, to_path, position) values ('mobile', 'Events', '/events', 2);
  insert into nav_items (menu, label, to_path, position) values ('mobile', 'Gallery', '/gallery', 3);
  insert into nav_items (menu, label, to_path, position) values ('mobile', 'Join', '/membership', 4);
  insert into nav_items (menu, label, to_path, position) values ('utility', 'Donate', '/donate', 0);
  insert into nav_items (menu, label, to_path, position) values ('utility', 'Sign In', '/sign-in', 1);
  insert into nav_items (menu, label, position) values ('footer', 'Organisation', 0) returning id into parent_id;
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'About IPF', '/about', 0);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Leadership', '/leadership', 1);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Chapters', '/chapters', 2);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Councils', '/councils', 3);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Governance', '/governance', 4);
  insert into nav_items (menu, label, position) values ('footer', 'Programmes', 1) returning id into parent_id;
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Events', '/events', 0);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Activities', '/activities', 1);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'News', '/news', 2);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Gallery', '/gallery', 3);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Support', '/support', 4);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'IPF Yuva', '/yuva', 5);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Drishti', '/drishti', 6);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Resources', '/resources', 7);
  insert into nav_items (menu, label, position) values ('footer', 'Get involved', 2) returning id into parent_id;
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Membership', '/membership', 0);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'IPF Yuva', '/yuva', 1);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Donate', '/donate', 2);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Member portal', '/portal', 3);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Sponsors', '/sponsors', 4);
  insert into nav_items (menu, parent_id, label, to_path, position) values ('footer', parent_id, 'Contact', '/contact', 5);

end if;
end $$;
