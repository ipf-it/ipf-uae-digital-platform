-- Councils public visibility — align live set to the authoritative 15 + 3.
--
-- The initial seed (011_org_model_seed.sql) inserted all 28 Indian state
-- councils + 3 special councils and left them all active=true. The
-- public API (`GET /api/org/councils` in server/handleRequest.ts) already
-- filters .eq("active", true), so once we flip the correct 13 state
-- councils to active=false the public directory automatically renders
-- the 15 live state councils only. No code deployment required for
-- future activation/deactivation — a Central/Super Admin can toggle any
-- council's `active` column via the admin UI and the public page
-- reflects it on the next request.
--
-- IDs below use the seed's own grouping in 011_org_model_seed.sql. The
-- first 15 state councils in that seed form the initial live set; the
-- remaining 13 are preserved in the database (NOT deleted) with
-- active=false so IPF retains historical records + relationships
-- (events, news, galleries, people, appointments) intact and can
-- activate them later at any time via CMS without a code change.
--
-- The 3 live special councils (business, cultural, womens) are already
-- the only special council records in the seed — no change required
-- there; this migration explicitly re-asserts their active=true for
-- idempotency.

-- Deactivate the 13 state councils that are NOT in the currently
-- approved live set. Records remain in the database; only the public
-- visibility flag flips. CMS admin can reactivate any of these at any
-- time by setting active=true via the Central Admin UI.
update councils
set active = false, updated_at = now()
where kind = 'state'
  and id in (
    'haryana',
    'jharkhand',
    'chhattisgarh',
    'uttarakhand',
    'himachal-pradesh',
    'goa',
    'arunachal-pradesh',
    'manipur',
    'meghalaya',
    'mizoram',
    'nagaland',
    'sikkim',
    'tripura'
  );

-- Reassert active=true on the 15 live state councils (defensive — the
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
    'assam',
    'odisha',
    'west-bengal',
    'madhya-pradesh'
  );

-- Reassert active=true on the 3 live special councils (same defensive
-- reasoning as above).
update councils
set active = true, updated_at = now()
where kind = 'special'
  and id in ('business', 'cultural', 'womens');
