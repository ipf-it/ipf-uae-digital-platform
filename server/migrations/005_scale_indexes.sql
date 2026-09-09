-- Phase A scale hardening: indexes backing the now SQL-pushed public/admin event
-- queries, the person-scoped lookups in /api/members/me, and audit-log lookups.

create index if not exists events_published_starts_idx on events (published, starts_at);
create index if not exists events_published_category_emirate_idx on events (published, category, emirate);

create index if not exists event_registrations_person_idx on event_registrations (person_id);
create index if not exists event_volunteers_person_idx on event_volunteers (person_id);

create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx on audit_logs (actor_id, created_at desc);
