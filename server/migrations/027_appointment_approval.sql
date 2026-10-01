-- Committee member changes by a chapter/council admin must go through central approval before
-- going live — previously `appointments` only had `status` (active/completed, institutional
-- history), with no draft/submitted/published gate at all, so a scoped admin's edits appeared on
-- the public site instantly. Adds the same workflow_status pattern already used by
-- events/activities/tenant_content/page_sections.
alter table appointments add column if not exists workflow_status text not null default 'published' check (workflow_status in ('draft', 'submitted', 'changes_requested', 'rejected', 'approved', 'published'));

drop policy if exists "public read appointments" on appointments;
create policy "public read appointments" on appointments for select using (status = 'active' and workflow_status = 'published');
