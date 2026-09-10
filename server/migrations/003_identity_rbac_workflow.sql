create sequence if not exists ipf_member_number_seq start 1;
create sequence if not exists ipf_yuva_number_seq start 1;

create or replace function next_ipf_number(account_kind text)
returns bigint language plpgsql security definer as $$
begin
  if account_kind = 'yuva' then return nextval('ipf_yuva_number_seq'); end if;
  return nextval('ipf_member_number_seq');
end; $$;

alter table event_registrations add column if not exists participation_as text not null default 'member';
create index if not exists people_phone_idx on people (phone);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(), email text not null unique, display_name text not null,
  role text not null check (role in ('super_admin','central_content_admin','chapter_admin','council_admin','editor')),
  scope_type text not null default 'global' check (scope_type in ('global','chapter','council')),
  scope_id text, active boolean not null default true, mfa_required boolean not null default true,
  password_hash text not null default '', last_login_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id text not null,
  scope_type text not null default 'global', scope_id text,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','changes_requested','rejected','approved','scheduled','published')),
  submitted_by uuid references admin_users(id) on delete set null, reviewed_by uuid references admin_users(id) on delete set null,
  review_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references admin_users(id) on delete set null,
  action text not null, entity_type text not null, entity_id text not null, old_value jsonb, new_value jsonb,
  request_id text, created_at timestamptz not null default now()
);
alter table admin_users enable row level security;
alter table approval_requests enable row level security;
alter table audit_logs enable row level security;
-- Note: this migration no longer touches `sessions` — that table was dropped in favor of
-- Supabase Auth (see 003_supabase_auth.sql, 006_unified_identity.sql) and schema.sql never
-- creates it, so an `alter table sessions ...` here would fail with "relation does not exist".
