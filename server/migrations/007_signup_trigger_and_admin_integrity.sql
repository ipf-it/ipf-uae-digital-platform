-- Two independent hardening fixes found during a full-application audit:
--
-- 1. The signup trigger gated account creation on `account_kind`, a field that stopped being
--    meaningful once 006_unified_identity.sql merged member/Yuva into one identity with an
--    `is_volunteer` flag. Nothing validated or documented that the client must keep sending
--    `account_kind: "member"` in signUp() metadata — removing it (as unused-looking code
--    eventually would be) silently stops every new signup from creating a `people` row, with no
--    error anywhere. Gate on `phone` instead: every real member signup requires a verified phone
--    (enforced inside create_ipf_profile() itself), while the admin-only auth users created by
--    ensureAdminSeed() in server/handleRequest.ts never carry phone metadata and correctly get no
--    `people` row either way.
-- 2. admin_users.role and admin_users.scope_type were independently free-form (no DB link between
--    them), so nothing prevented e.g. an `editor` row with `scope_type = 'global'` — such a row
--    would pass the client's scope-only admin check but fail the stricter server-side one used for
--    event publishing, an inconsistency a real misconfigured row could silently trigger.

drop trigger if exists create_ipf_profile_after_signup on auth.users;
create trigger create_ipf_profile_after_signup
  after insert on auth.users
  for each row
  when (coalesce(new.raw_user_meta_data ->> 'phone', '') <> '')
  execute function public.create_ipf_profile();

-- Orphaned since 006_unified_identity.sql collapsed member/Yuva numbering into one sequence —
-- nothing calls the 2-argument form any more.
drop function if exists next_ipf_number(text);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'admin_users_role_scope_check') then
    alter table admin_users add constraint admin_users_role_scope_check check (
      (scope_type = 'global' and role in ('super_admin', 'central_content_admin'))
      or (scope_type in ('chapter', 'council') and role in ('chapter_admin', 'council_admin', 'editor'))
    );
  end if;
end $$;
