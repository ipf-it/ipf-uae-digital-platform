/* ───────────────────────────────────────────────────────────────────────
 * Authoritative IPF UAE 2026 organisational counts — CURRENT LIVE PHASE.
 *
 *   CHAPTERS         = 7
 *   STATE COUNCILS   = 15
 *   SPECIAL COUNCILS = 4   (Startup Hub, Business, Women, Yuva)
 *   TOTAL COUNCILS   = 19
 *
 * Yuva is a Special Council in the 2026 structure; it is NOT counted
 * separately on top of these 19. The /yuva route is the Yuva Council's
 * detail page.
 *
 * The public /councils directory renders whatever the public API returns;
 * the API itself enforces the live set (server/handleRequest.ts, route
 * GET /api/org/councils) by filtering both on the DB `active` flag AND
 * on the authoritative PUBLIC_COUNCIL_IDS allowlist. The database retains
 * the remaining historical Council records so related events / news /
 * galleries / people / appointments remain intact; they are not surfaced
 * on public pages and do not contribute to the counts here. Central /
 * Super Admin can toggle any council's `active` flag in CMS to publish
 * or unpublish it — when the live set changes, update the allowlist in
 * server/handleRequest.ts and the constants here in lockstep.
 *
 * Separately, IPF UAE has 4 Special Cells / Wings (CSR Food & Labour,
 * Legal Cell, Drishti Magazine, Cultural Wing). Wings are NOT Councils
 * and are not included in TOTAL_COUNCIL_COUNT; they surface via the
 * positions / appointments tables on the Leadership page.
 *
 * All UI components that display these counts MUST import from this
 * module so the numbers stay consistent across the site.
 * ─────────────────────────────────────────────────────────────────── */

export const CHAPTER_COUNT = 7;
export const STATE_COUNCIL_COUNT = 15;
export const SPECIAL_COUNCIL_COUNT = 4;
export const TOTAL_COUNCIL_COUNT = STATE_COUNCIL_COUNT + SPECIAL_COUNCIL_COUNT; // 19
export const WING_COUNT = 4;

/* Word forms used in editorial copy — kept here so a single file owns
   both the numeric and the written representation. English only; other
   locales live in src/i18n/messages.ts under the keys that reference
   these counts. */
export const CHAPTER_COUNT_WORD = "seven";
export const TOTAL_COUNCIL_COUNT_WORD = "nineteen";
