/* ───────────────────────────────────────────────────────────────────────
 * Authoritative IPF UAE 2026 organisational counts — CURRENT LIVE PHASE.
 *
 *   CHAPTERS         = 7
 *   STATE COUNCILS   = 15
 *   SPECIAL COUNCILS = 3   (Business, Cultural, Women's — live phase)
 *   TOTAL COUNCILS   = 18
 *
 * These numbers represent the CURRENTLY LIVE/PUBLIC organisation units.
 * The database retains additional historical Council records (see
 * migration 032_councils_live_set_15_3.sql) with active=false so legacy
 * events / news / galleries / people / appointments remain intact; those
 * records are not surfaced on public pages and do not contribute to the
 * current counts here. Central/Super Admin can toggle any council's
 * `active` flag in CMS to publish/unpublish it without a code change —
 * when that happens, bump the relevant constant here and the public
 * directories automatically agree.
 *
 * IPF Yuva has its own /yuva experience and is NOT counted as a Special
 * Council until it is published as one via CMS (which would bring
 * SPECIAL_COUNCIL_COUNT to 4 and TOTAL to 19).
 *
 * All UI components that display these counts MUST import from this
 * module so the numbers stay consistent across the site.
 * ─────────────────────────────────────────────────────────────────── */

export const CHAPTER_COUNT = 7;
export const STATE_COUNCIL_COUNT = 15;
export const SPECIAL_COUNCIL_COUNT = 3;
export const TOTAL_COUNCIL_COUNT = STATE_COUNCIL_COUNT + SPECIAL_COUNCIL_COUNT; // 18

/* Word forms used in editorial copy — kept here so a single file owns
   both the numeric and the written representation. English only; other
   locales live in src/i18n/messages.ts under the keys that reference
   these counts. */
export const CHAPTER_COUNT_WORD = "seven";
export const TOTAL_COUNCIL_COUNT_WORD = "eighteen";
