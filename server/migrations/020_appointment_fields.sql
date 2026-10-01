-- Office-bearer field completeness, requested by the formal requirement doc and the content-
-- collection workbook: short bio, contact phone/email, social links, a "display publicly?" gate
-- for that contact info, and a membership number for the sort-by-membership-number the workbook
-- says will replace alphabetical sorting later. None of this existed on `appointments` before —
-- only name/photo/position/scope/term dates/status.
alter table appointments add column if not exists bio text not null default '';
alter table appointments add column if not exists contact_phone text not null default '';
alter table appointments add column if not exists contact_email text not null default '';
alter table appointments add column if not exists social_links jsonb not null default '[]'::jsonb;
alter table appointments add column if not exists show_contact boolean not null default false;
alter table appointments add column if not exists membership_no text not null default '';
