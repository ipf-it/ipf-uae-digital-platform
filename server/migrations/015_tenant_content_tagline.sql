-- Adds a short, admin-editable hero tagline for chapter/council landing pages. Until now the
-- one-line subtitle under the hero title on every chapter/council page was a hardcoded string in
-- ChapterPage.tsx/CouncilPage.tsx, identical for every chapter (or every council of a kind) and
-- not editable from the CMS — this closes that gap alongside the already-editable intro/highlights.
alter table tenant_content add column if not exists tagline text not null default '';
