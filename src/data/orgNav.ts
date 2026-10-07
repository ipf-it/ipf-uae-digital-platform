// Chapters/councils are fully database-driven now (useOrgChapters/useOrgCouncils, server/handleRequest.ts
// /api/org/*) — this file only keeps the two pure path-building helpers every page/component uses.
export function chapterPath(id: string) {
  return `/chapters/${id}`;
}

export function councilPath(id: string) {
  // Yuva Council is one of the 4 Special Councils in the IPF 2026
  // structure, but its programme home lives at /yuva — a richer
  // dedicated experience that predates its council classification.
  // Deep links to the Councils detail route are redirected there.
  if (id === "yuva-council") return "/yuva";
  return `/councils/${id}`;
}
