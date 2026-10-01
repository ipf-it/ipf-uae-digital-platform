// Chapters/councils are fully database-driven now (useOrgChapters/useOrgCouncils, server/handleRequest.ts
// /api/org/*) — this file only keeps the two pure path-building helpers every page/component uses.
export function chapterPath(id: string) {
  return `/chapters/${id}`;
}

export function councilPath(id: string) {
  return `/councils/${id}`;
}
