-- One identity per person: a home state (for council matching) alongside the existing UAE
-- emirate (for chapter matching), and volunteering as an opt-in attribute instead of a
-- separate, mutually-exclusive account type. Also: phone OTP verification infrastructure,
-- and a grouped participation-count helper for events.

alter table people add column if not exists home_state text not null default '';
alter table people add column if not exists is_volunteer boolean not null default false;

-- Backfill: anyone previously registered under the 'yuva' track is a volunteer by definition.
update people set is_volunteer = true where kind = 'yuva' and is_volunteer = false;

create index if not exists people_home_state_idx on people (home_state);
create index if not exists people_emirate_idx on people (emirate);

-- One membership-number sequence going forward — volunteering no longer forks identity.
create or replace function next_ipf_number()
returns bigint language plpgsql security definer as $$
begin
  return nextval('ipf_member_number_seq');
end;
$$;

create or replace function public.create_ipf_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare permanent_no text;
declare full_name text;
declare mobile text;
declare home_emirate text;
declare home_state_value text;
declare wants_volunteer boolean;
begin
  full_name := trim(coalesce(new.raw_user_meta_data ->> 'name', ''));
  if full_name = '' then raise exception 'Full name is required'; end if;
  mobile := public.normalize_uae_mobile(new.raw_user_meta_data ->> 'phone');
  if not exists (
    select 1 from public.verified_phones
    where phone = mobile and expires_at > now()
  ) then
    raise exception 'This mobile number has not been verified. Request and enter the code first.';
  end if;
  home_emirate := trim(coalesce(new.raw_user_meta_data ->> 'emirate', ''));
  home_state_value := trim(coalesce(new.raw_user_meta_data ->> 'home_state', ''));
  wants_volunteer := coalesce((new.raw_user_meta_data ->> 'is_volunteer')::boolean, false);
  permanent_no := 'IPF-' || lpad(nextval('public.ipf_member_number_seq')::text, 6, '0');
  insert into public.people (auth_user_id, kind, membership_no, name, email, phone, emirate, chapter, home_state, is_volunteer, password_hash)
  values (new.id, 'member', permanent_no, full_name, lower(new.email), mobile, home_emirate, home_emirate, home_state_value, wants_volunteer, '');
  delete from public.verified_phones where phone = mobile;
  return new;
end;
$$;

-- Short-lived phone verification records. A verified phone must exist here, unexpired,
-- before create_ipf_profile() will create the person row for it — see above.
create table if not exists verified_phones (
  phone text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists phone_otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists phone_otp_codes_phone_idx on phone_otp_codes (phone, created_at desc);

alter table verified_phones enable row level security;
alter table phone_otp_codes enable row level security;

-- Grouped member/volunteer counts for one or more events, backed by event_registrations_event_idx.
-- Both predate Supabase Auth: `sessions` was the opaque cookie-session store, `chapter_admins`
-- held one shared password per chapter. Neither has a live reader/writer left in handleRequest.ts.
drop table if exists sessions;
drop table if exists chapter_admins;

create or replace function event_participation_counts(event_ids text[])
returns table (event_id text, member_count bigint, volunteer_count bigint)
language sql
stable
as $$
  select
    event_registrations.event_id,
    count(*) filter (where participation_as = 'member') as member_count,
    count(*) filter (where participation_as = 'volunteer') as volunteer_count
  from event_registrations
  where event_registrations.event_id = any(event_ids)
  group by event_registrations.event_id;
$$;
