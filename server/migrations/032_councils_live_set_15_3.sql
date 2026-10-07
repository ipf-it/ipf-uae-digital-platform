-- Councils public visibility — align live set to the authoritative 15.
--
-- The initial seed (011_org_model_seed.sql) inserted all 28 Indian state
-- councils + 3 special councils and left them all active=true. The
-- public API (`GET /api/org/councils` in server/handleRequest.ts) now
-- filters on BOTH .eq("active", true) AND an explicit
-- PUBLIC_COUNCIL_IDS allowlist (12 state + 3 special = 15 total), so the
-- public directory returns exactly 15 records. This migration brings the
-- DB `active` flags into the same state so admin UI counts, exports,
-- and other DB-level consumers also reflect the live set. The allowlist
-- in the API is the primary enforcement path (works without this
-- migration having been applied); this migration is defence-in-depth
-- and tidies the admin surface so inactive-but-preserved records are
-- clearly marked.
--
-- Records are PRESERVED (NOT deleted) so historical events / news /
-- galleries / people / appointments remain intact and a Central/Super
-- Admin can reactivate any Council later via the admin UI without a
-- code change — on reactivation, add its id to PUBLIC_COUNCIL_IDS in
-- server/handleRequest.ts and bump STATE_/SPECIAL_COUNCIL_COUNT in
-- src/data/orgCounts.ts.

-- Deactivate every state council NOT in the approved 12. Records remain
-- in the database; only the public visibility flag flips.
update councils
set active = false, updated_at = now()
where kind = 'state'
  and id not in (
    'kerala',
    'karnataka',
    'andhra-pradesh',
    'telangana',
    'tamil-nadu',
    'maharashtra',
    'gujarat',
    'punjab',
    'rajasthan',
    'uttar-pradesh',
    'bihar',
    'west-bengal'
  );

-- Reassert active=true on the 12 live state councils (defensive — the
-- seed defaults are already active=true, but a prior environment may
-- have flipped some by hand; this guarantees the authoritative live
-- set after this migration runs).
update councils
set active = true, updated_at = now()
where kind = 'state'
  and id in (
    'kerala',
    'karnataka',
    'andhra-pradesh',
    'telangana',
    'tamil-nadu',
    'maharashtra',
    'gujarat',
    'punjab',
    'rajasthan',
    'uttar-pradesh',
    'bihar',
    'west-bengal'
  );

-- Reassert active=true on the 3 live special councils.
update councils
set active = true, updated_at = now()
where kind = 'special'
  and id in ('business', 'cultural', 'womens');
