-- Real 2026-27 committee rosters collected directly from each chapter/council (via the
-- content-collection spreadsheets circulated to chapter/council conveners), seeded once here so a
-- fresh database matches what was applied live. Guarded per scope so re-running this file is safe
-- on a database that already has this scope's roster (e.g. if an admin has since edited it).
-- Contact details are stored but kept private (show_contact = false) by default, matching the
-- platform's existing "office bearers opt in to public contact info" policy.

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'madhya-pradesh') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Satendra Dwivedi', id, 'council', 'madhya-pradesh', 'active', 'published', 1, '+971525682011', '', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Ravi Bhushan', id, 'council', 'madhya-pradesh', 'active', 'published', 2, '+971506407905', '', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Alex Ji', id, 'council', 'madhya-pradesh', 'active', 'published', 3, '+971552311100', '', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Priya Agrawal', id, 'council', 'madhya-pradesh', 'active', 'published', 4, '+971559890610', '', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Milind Manke', id, 'council', 'madhya-pradesh', 'active', 'published', 5, '+971503507460', '', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Sachin Pitre', id, 'council', 'madhya-pradesh', 'active', 'published', 6, '+971508720084', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Sheenu Mehta', id, 'council', 'madhya-pradesh', 'active', 'published', 7, '+971505461963', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Keerti Jain', id, 'council', 'madhya-pradesh', 'active', 'published', 8, '+971555536919', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Vimal Sharma', id, 'council', 'madhya-pradesh', 'active', 'published', 9, '+971528712382', '', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'maharashtra') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Rahul Tulpule', id, 'council', 'maharashtra', 'active', 'published', 1, '+971559020650', 'tulpule@gmail.com', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Gaurish Wagle', id, 'council', 'maharashtra', 'active', 'published', 2, '+971502685760', 'waglo@hotmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Mahesh Dhomkar', id, 'council', 'maharashtra', 'active', 'published', 3, '+971555583550', 'mahesh.dhomkar@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Neelam Nandekar', id, 'council', 'maharashtra', 'active', 'published', 4, '+971559874657', 'neelamdn@gmail.com', 'PoC – Fujairah & Project Lead, United Maharashtra', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Bhushan Chaudhari', id, 'council', 'maharashtra', 'active', 'published', 5, '+971507407474', 'chaudharibhushans@gmail.com', 'Social Media', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Supriya Ghosh', id, 'council', 'maharashtra', 'active', 'published', 6, '+971569054216', 'supriyaghosh2508@gmail.com', 'PoC – Ras Al Khaimah & Umm Al Quwain', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Shweta Karandikar', id, 'council', 'maharashtra', 'active', 'published', 7, '+971505374966', 'shwetabendre@gmail.com', 'PoC – Al Ain & Project Lead, MahaHelpline', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Dr. Samrat Waghaye', id, 'council', 'maharashtra', 'active', 'published', 8, '', '', 'Advisor – Community Medical Matters', false from positions where slug = 'council-advisor' and level = 'council'
  union all
  select 'Mahesh Jaikhedkar', id, 'council', 'maharashtra', 'active', 'published', 9, '+971551815253', 'maheshj101@gmail.com', 'PoC – Abu Dhabi', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Dilawar Dalwai', id, 'council', 'maharashtra', 'active', 'published', 10, '+971507566256', 'udalwai@gmail.com', 'PoC – Sharjah & Ajman', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'gujarat') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Dr. Vyapti Joshi', id, 'council', 'gujarat', 'active', 'published', 1, '+971568680777', 'vyaptijoshi80@gmail.com', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Chetan Bhatt', id, 'council', 'gujarat', 'active', 'published', 2, '+971521687799', 'pearlline@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Jahid Nagarwala', id, 'council', 'gujarat', 'active', 'published', 3, '+971507403905', 'jahid.alfa@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Tejas Parikh', id, 'council', 'gujarat', 'active', 'published', 4, '+971554530980', '17tejas@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Dr. Shailesh Upadhyay', id, 'council', 'gujarat', 'active', 'published', 5, '+971504886050', 'shaileshupadhyay@hotmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Vrunda Shah', id, 'council', 'gujarat', 'active', 'published', 6, '+971503789968', 'amitvru147@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Manan Mehta', id, 'council', 'gujarat', 'active', 'published', 7, '+971521882201', 'mananmehta432@gmail.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Prashant Joshi', id, 'council', 'gujarat', 'active', 'published', 8, '+971502169864', 'joshiph@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Ankur Patel', id, 'council', 'gujarat', 'active', 'published', 9, '+971566581649', 'rinkupatelpatel@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Komal Doshi', id, 'council', 'gujarat', 'active', 'published', 10, '+971559190768', 'komaljdoshi@yahoo.co.in', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Bharat Narola', id, 'council', 'gujarat', 'active', 'published', 11, '+971557186200', 'bharat@naroladiamond.com', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'chapter' and scope_id = 'sharjah') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Jaya Prakash K Govindan', id, 'chapter', 'sharjah', 'active', 'published', 1, '', 'jpkallengat@gmail.com', '', false from positions where slug = 'chapter-convenor' and level = 'chapter'
  union all
  select 'Pradeep Chandran', id, 'chapter', 'sharjah', 'active', 'published', 2, '', 'ariespradeep@gmail.com', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Prasanth Damodaran', id, 'chapter', 'sharjah', 'active', 'published', 3, '', 'prasanthv722@icloud.com', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Suresh Kashi', id, 'chapter', 'sharjah', 'active', 'published', 4, '', 'sureshkashi@yahoo.com', '', false from positions where slug = 'chapter-general-secretary' and level = 'chapter'
  union all
  select 'Suresh Nellikat', id, 'chapter', 'sharjah', 'active', 'published', 5, '', 'sureshnellikat@gmail.com', '', false from positions where slug = 'chapter-treasurer' and level = 'chapter'
  union all
  select 'Rohit Kannoth', id, 'chapter', 'sharjah', 'active', 'published', 6, '', 'rohitkannoth@gmail.com', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Suneesh Sasidharan', id, 'chapter', 'sharjah', 'active', 'published', 7, '', 'suneeshtrs@gmail.com', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Sanjay Yadav', id, 'chapter', 'sharjah', 'active', 'published', 8, '', 'sanjayyadav@gmail.com', '', false from positions where slug = 'chapter-joint-treasurer' and level = 'chapter';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'rajasthan') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Kesarji Kothari', id, 'council', 'rajasthan', 'active', 'published', 1, '+971506353047', '', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Sunilji Jagetiya', id, 'council', 'rajasthan', 'active', 'published', 2, '+971556377326', 'sunil@sunmanagement.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Dineshji Singhvi', id, 'council', 'rajasthan', 'active', 'published', 3, '+971504549467', 'sanghvi.dinesh@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Ashishji Garg', id, 'council', 'rajasthan', 'active', 'published', 4, '+971504508792', 'gargash11@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Rajeshji Ganeriwal', id, 'council', 'rajasthan', 'active', 'published', 5, '+971585840488', 'rajeshganeriwal@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Praveenji Mehta', id, 'council', 'rajasthan', 'active', 'published', 6, '+971502380924', '', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Avinashji Jagetiya', id, 'council', 'rajasthan', 'active', 'published', 7, '+971555507131', 'avinash@sunmanagement.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Vinodji Khatod', id, 'council', 'rajasthan', 'active', 'published', 8, '+971565924277', 'vinodkhatod@hotmail.com', '', false from positions where slug = 'council-joint-treasurer' and level = 'council'
  union all
  select 'Amararamji Jangid', id, 'council', 'rajasthan', 'active', 'published', 9, '+971506233483', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Anandji Gupta', id, 'council', 'rajasthan', 'active', 'published', 10, '+971565699100', 'anandca02@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Shweta Jagetiya', id, 'council', 'rajasthan', 'active', 'published', 11, '+971503023271', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Neeraj Rathore', id, 'council', 'rajasthan', 'active', 'published', 12, '+971552637849', 'nijubanna13@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Hitesh Rajyaguru', id, 'council', 'rajasthan', 'active', 'published', 13, '+971552885122', 'rajyaguruhitesh2903@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Raju Agarwal Mangodiwala', id, 'council', 'rajasthan', 'active', 'published', 14, '+919829011339', 'prjewels@yahoo.com', '', false from positions where slug = 'council-mentor' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'chapter' and scope_id = 'dubai') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Rizwaan Adatia', id, 'chapter', 'dubai', 'active', 'published', 1, '+971551519651', '', '', false from positions where slug = 'chapter-convenor' and level = 'chapter'
  union all
  select 'Sreerag Nayarekkat', id, 'chapter', 'dubai', 'active', 'published', 2, '+971553417164', 'sreerag.nayarekkat@zohomail.com', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Anjana Bhatia', id, 'chapter', 'dubai', 'active', 'published', 3, '+971555944896', 'contactatajure@gmail.com', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Reeta Rathore', id, 'chapter', 'dubai', 'active', 'published', 4, '+971509253309', 'reeta.rathoreverma@gmail.com', '', false from positions where slug = 'chapter-general-secretary' and level = 'chapter'
  union all
  select 'Manoj Pandey', id, 'chapter', 'dubai', 'active', 'published', 5, '+971585923055', 'manojpandey4k@gmail.com', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Sudhir Pillai', id, 'chapter', 'dubai', 'active', 'published', 6, '+971552260577', 'sudhirpd@gmail.com', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Shailendra Nair', id, 'chapter', 'dubai', 'active', 'published', 7, '+971508099567', 'shailendra.nair1@gmail.com', '', false from positions where slug = 'chapter-treasurer' and level = 'chapter'
  union all
  select 'Sneha Lakhani', id, 'chapter', 'dubai', 'active', 'published', 8, '+971526177198', 'lakhanisneha1705@gmail.com', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Kashish Rangwani', id, 'chapter', 'dubai', 'active', 'published', 9, '+971556126101', 'sunkashish@yahoo.com', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Anil Nautiyal', id, 'chapter', 'dubai', 'active', 'published', 10, '+971509971824', 'anilnautiyal_ni@yahoo.com', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'uttar-pradesh') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Mahesh Singh', id, 'council', 'uttar-pradesh', 'active', 'published', 1, '+971555649139', 'mail@maheshsingh.in', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'B.S. Chauhan', id, 'council', 'uttar-pradesh', 'active', 'published', 2, '+971553400056', 'bsc_71@hotmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Sudheer Tripathi', id, 'council', 'uttar-pradesh', 'active', 'published', 3, '+971552581891', 'sudhir_tripathi2001@yahoo.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Nidhi Sharma', id, 'council', 'uttar-pradesh', 'active', 'published', 4, '+971527097166', 'rajnid7019@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Richa Gautam', id, 'council', 'uttar-pradesh', 'active', 'published', 5, '+971505879505', 'richaselvi@hotmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Ruby Angrish', id, 'council', 'uttar-pradesh', 'active', 'published', 6, '+971569503245', 'rangrish81@gmail.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Dharmveer Chauhan', id, 'council', 'uttar-pradesh', 'active', 'published', 7, '+971564949201', 'chauhan.dharamvir@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Uma Rana', id, 'council', 'uttar-pradesh', 'active', 'published', 8, '+971505491887', 'uma14chauhan@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Dr. Vinod Kumar Shukla', id, 'council', 'uttar-pradesh', 'active', 'published', 9, '+971581051060', 'vinodkumarshukla@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'uttarakhand') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Devendra Singh Koranga', id, 'council', 'uttarakhand', 'active', 'published', 1, '+971505103334', 'dskuae@gmail.com', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Sanjay Singh Thapa', id, 'council', 'uttarakhand', 'active', 'published', 2, '+971504556736', 'sanrits@hotmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Deepak Singh', id, 'council', 'uttarakhand', 'active', 'published', 3, '+971502574720', 'deepakbudalgoun@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Sunil Bhatt', id, 'council', 'uttarakhand', 'active', 'published', 4, '+971527826436', 'sunibhatt071975@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Sarita Kandpal', id, 'council', 'uttarakhand', 'active', 'published', 5, '+971526463428', 'saritakandpal1985@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Niraj Joshi', id, 'council', 'uttarakhand', 'active', 'published', 6, '+971551140933', 'nirajkjoshi@yahoo.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Gambhir Bhandari', id, 'council', 'uttarakhand', 'active', 'published', 7, '+971508646115', 'gambhirbhandari@gmail.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Jai Prakash Kothari', id, 'council', 'uttarakhand', 'active', 'published', 8, '+971529874709', 'jp@jaykuber.net', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Pankaj Mishra', id, 'council', 'uttarakhand', 'active', 'published', 9, '+971504836703', 'panks3162mishra@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Laxman Singh Butola', id, 'council', 'uttarakhand', 'active', 'published', 10, '+971555517300', 'info@firenzeflora.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Bhairav Pant', id, 'council', 'uttarakhand', 'active', 'published', 11, '+971508739544', 'bhairavpant22@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Harish Baloni', id, 'council', 'uttarakhand', 'active', 'published', 12, '+971529165230', 'harishbaloni@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Manoj Sanwal', id, 'council', 'uttarakhand', 'active', 'published', 13, '+971555537156', 'mkumar@pvtechae.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Atul Tiwari', id, 'council', 'uttarakhand', 'active', 'published', 14, '+971529426785', 'twratul@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Birender Parihar', id, 'council', 'uttarakhand', 'active', 'published', 15, '+971556353925', 'birenderparihar@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Ishwar Datt Kandpal', id, 'council', 'uttarakhand', 'active', 'published', 16, '+971507801115', 'kandpalishwar@yahoo.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Dhiraj Bafila', id, 'council', 'uttarakhand', 'active', 'published', 17, '+971544046070', 'sunnybafila@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Kailash Singh Koranga', id, 'council', 'uttarakhand', 'active', 'published', 18, '+971555128136', 'kskuaq@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'telangana') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Sharath Goud', id, 'council', 'telangana', 'active', 'published', 1, '+971545446669', '', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Madan Mohan', id, 'council', 'telangana', 'active', 'published', 2, '+971569682762', '', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Vinod Armuri', id, 'council', 'telangana', 'active', 'published', 3, '+971503254988', '', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Krishnahari Megi', id, 'council', 'telangana', 'active', 'published', 4, '+971569831082', '', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Govardan Yadav', id, 'council', 'telangana', 'active', 'published', 5, '+971588615359', '', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Venu Gopal Reddy', id, 'council', 'telangana', 'active', 'published', 6, '+971552673344', '', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Venu Dumpeta', id, 'council', 'telangana', 'active', 'published', 7, '+971552001252', '', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Krishna Nimmala', id, 'council', 'telangana', 'active', 'published', 8, '+971553557853', '', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Jagadeesh', id, 'council', 'telangana', 'active', 'published', 9, '+971525308083', '', '', false from positions where slug = 'council-media-incharge' and level = 'council'
  union all
  select 'Sukumar', id, 'council', 'telangana', 'active', 'published', 10, '+971558409881', '', '', false from positions where slug = 'council-media-incharge' and level = 'council'
  union all
  select 'Vishnu Kumbala', id, 'council', 'telangana', 'active', 'published', 11, '+971544494511', '', '', false from positions where slug = 'council-events-incharge' and level = 'council'
  union all
  select 'Ramesh Pitla', id, 'council', 'telangana', 'active', 'published', 12, '+971559921855', '', '', false from positions where slug = 'council-events-incharge' and level = 'council'
  union all
  select 'Balakishan Janagam', id, 'council', 'telangana', 'active', 'published', 13, '+971555287337', '', '', false from positions where slug = 'council-csr-incharge' and level = 'council'
  union all
  select 'Raju Adlagatta', id, 'council', 'telangana', 'active', 'published', 14, '+971556540126', '', '', false from positions where slug = 'council-csr-incharge' and level = 'council'
  union all
  select 'Ravi Peddi', id, 'council', 'telangana', 'active', 'published', 15, '+971558714596', '', '', false from positions where slug = 'council-coordinator' and level = 'council'
  union all
  select 'Srikanth Kola', id, 'council', 'telangana', 'active', 'published', 16, '+971522590710', '', '', false from positions where slug = 'council-coordinator' and level = 'council'
  union all
  select 'Shekar Kummari', id, 'council', 'telangana', 'active', 'published', 17, '+971558267054', '', '', false from positions where slug = 'council-coordinator' and level = 'council'
  union all
  select 'Dhasharadam', id, 'council', 'telangana', 'active', 'published', 18, '+971545216049', '', '', false from positions where slug = 'council-coordinator' and level = 'council'
  union all
  select 'Harish Patel', id, 'council', 'telangana', 'active', 'published', 19, '+971586761431', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Pavan Sai', id, 'council', 'telangana', 'active', 'published', 20, '+971564269204', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Sai Harsha', id, 'council', 'telangana', 'active', 'published', 21, '+971563824648', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Shekar Manuka', id, 'council', 'telangana', 'active', 'published', 22, '+971563965378', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Ram', id, 'council', 'telangana', 'active', 'published', 23, '+971509364241', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Laxman', id, 'council', 'telangana', 'active', 'published', 24, '+971561969197', '', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Srikar', id, 'council', 'telangana', 'active', 'published', 25, '+971544494511', '', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'kerala') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Vinesh Mohan', id, 'council', 'kerala', 'active', 'published', 1, '+971505983172', 'vineshmohan@hotmail.com', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Kalesh Kumar', id, 'council', 'kerala', 'active', 'published', 2, '+971501896935', 'kaleshammu@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Suresh Raman', id, 'council', 'kerala', 'active', 'published', 3, '+971507547789', 'sureshcochin@hotmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Praveen Raj', id, 'council', 'kerala', 'active', 'published', 4, '+971502024268', 'pravi814@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Sabirish Chillikkal', id, 'council', 'kerala', 'active', 'published', 5, '+971508858561', 'sabirish@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Swapnesh Elorath', id, 'council', 'kerala', 'active', 'published', 6, '+971528739859', 'elerothswapnesh@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Rajesh Thazemadam', id, 'council', 'kerala', 'active', 'published', 7, '+971502513519', 'atrajesh@hotmail.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Mukundan', id, 'council', 'kerala', 'active', 'published', 8, '+971557131270', 'mahimuku@yahoo.co.uk', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Raveendran', id, 'council', 'kerala', 'active', 'published', 9, '+971556647389', 'sajtsllc@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Gopinath', id, 'council', 'kerala', 'active', 'published', 10, '+971506717643', 'pmgopi@gmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council'
  union all
  select 'Vinod', id, 'council', 'kerala', 'active', 'published', 11, '+971567453345', 'vinodkvr@hotmail.com', '', false from positions where slug = 'council-committee-member' and level = 'council';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'chapter' and scope_id = 'abu-dhabi') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Alok Tuteja', id, 'chapter', 'abu-dhabi', 'active', 'published', 1, '', '', '', false from positions where slug = 'chapter-convenor' and level = 'chapter'
  union all
  select 'Gautam Nathwani', id, 'chapter', 'abu-dhabi', 'active', 'published', 2, '', '', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Jayan Manikan', id, 'chapter', 'abu-dhabi', 'active', 'published', 3, '', '', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Vinay Kukreja', id, 'chapter', 'abu-dhabi', 'active', 'published', 4, '', '', '', false from positions where slug = 'chapter-general-secretary' and level = 'chapter'
  union all
  select 'Falguni Shah', id, 'chapter', 'abu-dhabi', 'active', 'published', 5, '', '', '', false from positions where slug = 'chapter-treasurer' and level = 'chapter'
  union all
  select 'Ridhi Shah', id, 'chapter', 'abu-dhabi', 'active', 'published', 6, '', '', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Deepak Das', id, 'chapter', 'abu-dhabi', 'active', 'published', 7, '', '', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Rakesh Mehta', id, 'chapter', 'abu-dhabi', 'active', 'published', 8, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Anand Gupta', id, 'chapter', 'abu-dhabi', 'active', 'published', 9, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Amrita', id, 'chapter', 'abu-dhabi', 'active', 'published', 10, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Bhushan Choudri', id, 'chapter', 'abu-dhabi', 'active', 'published', 11, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Gaurish Wagle', id, 'chapter', 'abu-dhabi', 'active', 'published', 12, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sandeepak Gupta', id, 'chapter', 'abu-dhabi', 'active', 'published', 13, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Usha Lalchandani', id, 'chapter', 'abu-dhabi', 'active', 'published', 14, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sanjana Ji', id, 'chapter', 'abu-dhabi', 'active', 'published', 15, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Rashmee Bhansali', id, 'chapter', 'abu-dhabi', 'active', 'published', 16, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sonali Jain', id, 'chapter', 'abu-dhabi', 'active', 'published', 17, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Amrish Ravindran', id, 'chapter', 'abu-dhabi', 'active', 'published', 18, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Valesh Ji', id, 'chapter', 'abu-dhabi', 'active', 'published', 19, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Harsh Bhatia', id, 'chapter', 'abu-dhabi', 'active', 'published', 20, '', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'chapter' and scope_id = 'ajman') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Suresh Kumar K', id, 'chapter', 'ajman', 'active', 'published', 1, '+971561278440', '', '', false from positions where slug = 'chapter-convenor' and level = 'chapter'
  union all
  select 'Rakesh Gupta', id, 'chapter', 'ajman', 'active', 'published', 2, '+971501954680', '', '', false from positions where slug = 'chapter-general-secretary' and level = 'chapter'
  union all
  select 'Salin Kumar', id, 'chapter', 'ajman', 'active', 'published', 3, '+971502770457', '', '', false from positions where slug = 'chapter-treasurer' and level = 'chapter'
  union all
  select 'Capt. Sanjeev', id, 'chapter', 'ajman', 'active', 'published', 4, '+971564846126', '', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Suresh Pillai', id, 'chapter', 'ajman', 'active', 'published', 5, '+971559631383', '', '', false from positions where slug = 'chapter-co-convenor' and level = 'chapter'
  union all
  select 'Ranjan Mizra', id, 'chapter', 'ajman', 'active', 'published', 6, '+971563396569', '', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Vinod S. Pillai', id, 'chapter', 'ajman', 'active', 'published', 7, '+971557103697', '', '', false from positions where slug = 'chapter-joint-secretary' and level = 'chapter'
  union all
  select 'Swai Ram', id, 'chapter', 'ajman', 'active', 'published', 8, '+971563332235', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Rajeesh G Nair', id, 'chapter', 'ajman', 'active', 'published', 9, '+971588643951', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Subeesh Kumar', id, 'chapter', 'ajman', 'active', 'published', 10, '+971551244368', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Muralidaran Nair', id, 'chapter', 'ajman', 'active', 'published', 11, '+971505820406', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Vineeth Vikram', id, 'chapter', 'ajman', 'active', 'published', 12, '+971553434293', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sindhu Ajith', id, 'chapter', 'ajman', 'active', 'published', 13, '+971521247094', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Ajith Kumar', id, 'chapter', 'ajman', 'active', 'published', 14, '+971568786189', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Nithin (Gujarat)', id, 'chapter', 'ajman', 'active', 'published', 15, '+971555130429', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Ravi Kumar', id, 'chapter', 'ajman', 'active', 'published', 16, '+971582568791', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Vipin Kumar', id, 'chapter', 'ajman', 'active', 'published', 17, '+971502713273', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Raj Kumar Pillai', id, 'chapter', 'ajman', 'active', 'published', 18, '+971555502781', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Binoy', id, 'chapter', 'ajman', 'active', 'published', 19, '+971508012797', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Dileep', id, 'chapter', 'ajman', 'active', 'published', 20, '+971559474746', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Gopan Kumar', id, 'chapter', 'ajman', 'active', 'published', 21, '+971551161473', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Unmesh', id, 'chapter', 'ajman', 'active', 'published', 22, '+971507179541', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Hari Panavila', id, 'chapter', 'ajman', 'active', 'published', 23, '+971555670611', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sarath Pillai', id, 'chapter', 'ajman', 'active', 'published', 24, '+971547881837', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Suresh Kumar', id, 'chapter', 'ajman', 'active', 'published', 25, '+971503549315', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Amal Kumar', id, 'chapter', 'ajman', 'active', 'published', 26, '+971523915536', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Dr. Prathibha Gupta', id, 'chapter', 'ajman', 'active', 'published', 27, '+971523391721', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Naina Saraswat', id, 'chapter', 'ajman', 'active', 'published', 28, '+971569024200', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Shaji', id, 'chapter', 'ajman', 'active', 'published', 29, '+971505272230', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Raman Kutty', id, 'chapter', 'ajman', 'active', 'published', 30, '+971543700352', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sobhana', id, 'chapter', 'ajman', 'active', 'published', 31, '+971501784255', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sanjitha Bagchi', id, 'chapter', 'ajman', 'active', 'published', 32, '+971503280219', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter'
  union all
  select 'Sheema Prasad', id, 'chapter', 'ajman', 'active', 'published', 33, '+971552518445', '', '', false from positions where slug = 'chapter-committee-member' and level = 'chapter';

end if;
end $$;

do $$
begin
if not exists (select 1 from appointments where scope_type = 'council' and scope_id = 'karnataka') then

  insert into appointments (person_name, position_id, scope_type, scope_id, status, workflow_status, display_order, contact_phone, contact_email, bio, show_contact)
  select 'Nagraja Sripathi Udupi Rao', id, 'council', 'karnataka', 'active', 'published', 1, '+971509904882', 'udupinag@gmail.com', '', false from positions where slug = 'council-convenor' and level = 'council'
  union all
  select 'Daya Kirodian', id, 'council', 'karnataka', 'active', 'published', 2, '+971507855649', 'dayakiriodian@yahoo.co.in', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Siddalingesha Baramasagara Revappa', id, 'council', 'karnataka', 'active', 'published', 3, '+971508916191', 'sidhubr@gmail.com', '', false from positions where slug = 'council-co-convenor' and level = 'council'
  union all
  select 'Gavaskar Sannathimammala Nagarajappa', id, 'council', 'karnataka', 'active', 'published', 4, '+971508986007', 'gavaskarsn@gmail.com', '', false from positions where slug = 'council-secretary' and level = 'council'
  union all
  select 'Shwetha Ram', id, 'council', 'karnataka', 'active', 'published', 5, '+971527216083', 'shweta.ram123@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Nataraja Shashidhara Mundaragi', id, 'council', 'karnataka', 'active', 'published', 6, '+971503004035', 'shashidhar.dxb@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Monica Mandanna', id, 'council', 'karnataka', 'active', 'published', 7, '+971559687108', 'monickamandannaa@gmail.com', '', false from positions where slug = 'council-joint-secretary' and level = 'council'
  union all
  select 'Suresh Masur', id, 'council', 'karnataka', 'active', 'published', 8, '+971565019581', 'suresh.masur@gmail.com', '', false from positions where slug = 'council-treasurer' and level = 'council'
  union all
  select 'Manohar Hegde', id, 'council', 'karnataka', 'active', 'published', 9, '+971565019581', 'manoharhegde23@gmail.com', '', false from positions where slug = 'council-joint-treasurer' and level = 'council';

end if;
end $$;

