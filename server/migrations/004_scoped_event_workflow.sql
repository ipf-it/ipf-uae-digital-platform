alter table public.events add column if not exists scope_type text not null default 'global'
  check (scope_type in ('global', 'chapter', 'council'));
alter table public.events add column if not exists scope_id text;
alter table public.events add column if not exists workflow_status text not null default 'published'
  check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published'));
alter table public.events add column if not exists created_by uuid references public.admin_users(id) on delete set null;
create index if not exists events_scope_idx on public.events (scope_type, scope_id, updated_at desc);
create unique index if not exists approval_entity_unique_idx
  on public.approval_requests (entity_type, entity_id);
