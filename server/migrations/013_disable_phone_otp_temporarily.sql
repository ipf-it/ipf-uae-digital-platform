-- Phone-OTP verification is temporarily disabled — no paid SMS provider (MSG91 or otherwise) is
-- configured yet, so every registration was failing with "This mobile number has not been
-- verified." Registration now accepts any correctly-formatted UAE mobile number without an SMS
-- round-trip. This is meant to be reversed once an SMS provider is configured: restore the
-- `verified_phones` check exactly as it was in 006_unified_identity.sql's version of this
-- function. The OTP infrastructure itself (verified_phones, phone_otp_codes tables, the
-- /api/members/otp/request and /api/members/otp/verify routes, and MemberProvider's
-- requestPhoneOtp/verifyPhoneOtp) is left in place, unused, for exactly that reason.
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
  -- Still enforces UAE mobile *format* (a real-looking number) — only the SMS delivery/possession
  -- check is skipped.
  mobile := public.normalize_uae_mobile(new.raw_user_meta_data ->> 'phone');
  home_emirate := trim(coalesce(new.raw_user_meta_data ->> 'emirate', ''));
  home_state_value := trim(coalesce(new.raw_user_meta_data ->> 'home_state', ''));
  wants_volunteer := coalesce((new.raw_user_meta_data ->> 'is_volunteer')::boolean, false);
  permanent_no := 'IPF-' || lpad(nextval('public.ipf_member_number_seq')::text, 6, '0');
  insert into public.people (auth_user_id, kind, membership_no, name, email, phone, emirate, chapter, home_state, is_volunteer, password_hash)
  values (new.id, 'member', permanent_no, full_name, lower(new.email), mobile, home_emirate, home_emirate, home_state_value, wants_volunteer, '');
  return new;
end;
$$;
