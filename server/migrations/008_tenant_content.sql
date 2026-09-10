-- Per-chapter/council editable landing-page content, gated through the same
-- draft -> submit -> approve -> publish workflow events already use (approval_requests is
-- generic on entity_type, so no changes are needed there beyond a new entity_type value).

create table if not exists tenant_content (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('chapter', 'council')),
  scope_id text not null,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published')),
  intro text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  hero_image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  updated_by uuid references admin_users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (scope_type, scope_id)
);

alter table tenant_content enable row level security;

-- CREATE POLICY has no IF NOT EXISTS in Postgres — see schema.sql's own policies for the same
-- drop-then-create pattern, needed to make this file safe to re-run.
drop policy if exists "public read published tenant content" on tenant_content;
create policy "public read published tenant content" on tenant_content for select using (workflow_status = 'published');
