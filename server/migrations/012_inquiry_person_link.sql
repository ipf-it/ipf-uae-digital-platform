-- Links a contact/support/membership/jobs submission to the signed-in member who made it (when
-- they were signed in), so the member portal can show "my support requests" with live status
-- instead of every submission being anonymous and untraceable to the person who sent it.
alter table inquiries add column if not exists person_id uuid references people(id) on delete set null;
create index if not exists inquiries_person_idx on inquiries (person_id, created_at desc);
