/* ───────────────────────────────────────────────────────────────────────
 * Authoritative IPF UAE 2026 organisational counts.
 *
 * Supersedes any older values previously served by the API, CMS or
 * hard-coded in individual components. These are the figures confirmed
 * by the IPF UAE team for the 2026 structure:
 *
 *   CHAPTERS         = 7
 *   STATE COUNCILS   = 15
 *   SPECIAL COUNCILS = 4   (includes IPF Yuva)
 *   TOTAL COUNCILS   = 19
 *
 * All UI components that display these counts MUST import from this
 * module so the numbers stay consistent across the site. The exact
 * chapter and council NAMES are being reconciled against the IPF 2026
 * source spreadsheet in Phase 2 and are intentionally not asserted
 * here. UI code should prefer these counts over any `.length` of a
 * list that might still contain stale records.
 * ─────────────────────────────────────────────────────────────────── */

export const CHAPTER_COUNT = 7;
export const STATE_COUNCIL_COUNT = 15;
export const SPECIAL_COUNCIL_COUNT = 4;
export const TOTAL_COUNCIL_COUNT = STATE_COUNCIL_COUNT + SPECIAL_COUNCIL_COUNT; // 19

/* Word forms used in editorial copy — kept here so a single file owns
   both the numeric and the written representation. English only; other
   locales live in src/i18n/messages.ts under the keys that reference
   these counts. */
export const CHAPTER_COUNT_WORD = "seven";
export const TOTAL_COUNCIL_COUNT_WORD = "nineteen";
