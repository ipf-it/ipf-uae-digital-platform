-- Move identity and credential handling to Supabase Auth.
alter table public.people add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;
alter table public.admin_users add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

-- Existing empty legacy values are excluded; every new registration is required
-- to store one normalized UAE E.164 number.
create unique index if not exists people_phone_unique_idx
  on public.people (phone)
  where phone <> '';

alter table public.people alter column password_hash drop not null;
alter table public.people alter column password_hash set default '';

create index if not exists people_auth_user_idx on public.people (auth_user_id);
create index if not exists admin_users_auth_user_idx on public.admin_users (auth_user_id);

create or replace function public.normalize_uae_mobile(input text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare digits text := regexp_replace(coalesce(input, ''), '[^0-9]', '', 'g');
declare normalized text;
begin
  if digits like '00971%' then digits := substring(digits from 3); end if;
  if digits like '971%' then
    normalized := '+' || digits;
  elsif digits like '05%' then
    normalized := '+971' || substring(digits from 2);
  else
    normalized := '+' || digits;
  end if;
  if normalized !~ '^\+9715[024568][0-9]{7}$' then
    raise exception 'Enter a valid UAE mobile number';
  end if;
  return normalized;
end;
$$;

create or replace function public.create_ipf_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare account_kind text;
declare permanent_no text;
declare full_name text;
declare mobile text;
declare home_emirate text;
begin
  full_name := trim(coalesce(new.raw_user_meta_data ->> 'name', ''));
  if full_name = '' then raise exception 'Full name is required'; end if;
  mobile := public.normalize_uae_mobile(new.raw_user_meta_data ->> 'phone');
  account_kind := case when new.raw_user_meta_data ->> 'account_kind' = 'yuva' then 'yuva' else 'member' end;
  home_emirate := trim(coalesce(new.raw_user_meta_data ->> 'emirate', ''));
  permanent_no := case
    when account_kind = 'yuva' then 'IPFY-' || lpad(nextval('public.ipf_yuva_number_seq')::text, 4, '0')
    else 'IPFM-' || lpad(nextval('public.ipf_member_number_seq')::text, 4, '0')
  end;
  insert into public.people (auth_user_id, kind, membership_no, name, email, phone, emirate, chapter, password_hash)
  values (new.id, account_kind, permanent_no, full_name, lower(new.email), mobile, home_emirate, home_emirate, '');
  return new;
end;
$$;

drop trigger if exists create_ipf_profile_after_signup on auth.users;
create trigger create_ipf_profile_after_signup
  after insert on auth.users
  for each row
  when ((new.raw_user_meta_data ->> 'account_kind') in ('member', 'yuva'))
  execute function public.create_ipf_profile();
