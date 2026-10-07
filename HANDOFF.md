# IPF UAE Digital Platform — Project Handoff

> **STATUS — HALTED (2026-10-07).** Durga Charan has paused all development on this project pending IPF stakeholder review of the live platform and approved authoritative content for the gaps listed in §12. **Do not resume work, do not open PRs, do not touch `main` until the founder re-opens the project.**

---

## 0. At a glance

| | |
|---|---|
| **Organisation** | Indian People's Forum UAE (IPF UAE) · registered socio-cultural organisation, Ajman |
| **Founder-owner** | Durga Charan — reachcharan@gmail.com |
| **Working directory** | `~/Projects/ipf-uae-digital-platform` |
| **Repository** | https://github.com/ipf-it/ipf-uae-digital-platform |
| **Production URL** | https://ipf-uae-digital-platform.vercel.app · custom domain `ipfuae.com` fronts the same deployment |
| **main SHA at halt** | `e3afe27` — "Chapter detail pages: canonical 10-section architecture" |
| **Deployment** | GitHub `main` → Vercel production (auto). No PRs, no staging. |
| **Stack** | React 19.2 · react-router-dom 7.18 · Vite · TypeScript · Tailwind 4 · Supabase · Vercel Fluid Compute |
| **Build** | `npm run build` (`tsc -b && vite build`) |
| **Lint** | `npm run lint` (`oxlint`) — baseline warnings in `*Provider` only; zero errors |
| **Tests** | No automated suite. Validation is manual: live production probe at 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 after every deploy. |
| **Working tree at halt** | Clean (this file is the only pending change). |

---

## 1. Hard halt rules

Until the founder re-opens the project:

- No Rockstar-stage work (see §12).
- No further UI redesigns, animation changes, or copy edits.
- No DB migrations, no schema changes.
- No deploys. Do not push to `main`.
- No new vendor integrations (CMS, analytics, email, SMS, chat).
- If a stakeholder reports a bug and it reaches you before Durga, record it in a backlog file (not here) and wait for her to triage.

---

## 2. Authoritative IPF 2026 organisational structure (locked)

These counts are embedded in `src/data/orgCounts.ts` and enforced server-side by `PUBLIC_COUNCIL_IDS` in `server/handleRequest.ts`. Any change must come from Durga.

- **Chapters:** 7 — Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Al Ain. Fujairah preserved in CMS with `active=false`.
- **State Councils:** 15 — Kerala, Tamil Nadu, Karnataka, Gujarat, Uttar Pradesh, Telangana, Bihar, Maharashtra, Rajasthan, Madhya Pradesh, Uttarakhand, Haryana, Chhattisgarh, Delhi, Odisha. Thirteen historical state councils preserved with `active=false`.
- **Special Councils:** 4 — Startup Hub, Business Council, Women Council, Yuva Council. Cultural reclassified as a Wing; row preserved with `active=false`.
- **Wings (not counted in TOTAL_COUNCIL_COUNT):** CSR Food & Labour, Legal Cell, Drishti Magazine, Cultural Wing. Modelled via `positions` + `appointments`.
- **Yuva** is one of the 4 Special Councils. `/yuva` is its programme home; `councilPath('yuva-council')` deep-links there — do not duplicate.

```
CHAPTER_COUNT        = 7
STATE_COUNCIL_COUNT  = 15
SPECIAL_COUNCIL_COUNT = 4
TOTAL_COUNCIL_COUNT  = 19
WING_COUNT           = 4
```

Do not delete historical records. Preserve with `active=false` and keep the id in CMS so related events / people / appointments remain intact.

---

## 3. Design direction (locked)

Premium, institutional, India–UAE heritage-inspired, editorial community platform.

**Palette**
- Ivory canvas `#FFF8EE`
- IPF burgundy `#5A0F1E` (primary CTA bg) · deeper strip `#3A0913`
- Heritage gold — eyebrow ink `#8B6A1F`, ring/accent `#D6AD60`, saffron accent `#FF9933`
- Tricolour saffron / green used only in approved places
- Deep navy `var(--ipf-navy)` for primary headings and body-serif
- Premium serif for headings; sans body

**Core principle — backgrounds are supporting artwork.** Approved watercolour / heritage artwork must never dominate headings, body text, photographs, event cards or gallery images. Treat them like premium stationery.

**Primary public CTA = burgundy bg + white text.** No navy filled public CTAs anywhere.

**Logo** must render with a transparent background. Never add `bg-white` to the header `<img>`.

**Approved hero artwork** (`/theme/place-art/*.webp`, `/images/*/hero*`) must not be filtered, tinted, darkened, cropped aggressively, or re-generated. Position with `object-cover` + `object-position` only.

---

## 4. Animation policy (locked)

**Disallowed** — rotating mandalas / chakras / ornaments, floating decorative shapes, pulsing decorations, animated radial patterns, parallax decoration, moving background artwork, scroll-reveal decoration, decorative particles, any other unnecessary motion. Do not restore them.

**Approved functional motion only**
1. Hero background video (WebM, loop, muted, autoplay).
2. Announcement ticker (`.ipf-ticker-track`, 42s linear infinite — respects `prefers-reduced-motion`).
3. Events carousel (slow continuous horizontal loop).
4. Gallery carousel (9s crossfade).
5. Normal interaction / hover / menu / focus-ring transitions.

Any "animation cleanup" sweep must preserve items 1–5.

### Legacy decorative CSS still present

`src/index.css` lines 438–441 define a global `.home-theme-page > section::before` rotating saffron/green mandala pseudo-element. It is bypassed on the current homepage because the active section components are wrapped in `<div>` and the selector only matches direct `<section>` children — but the rule still exists. **Permanent fix queued for post-halt:** delete the two `::before` CSS rules and the `ipf-theme-spin` keyframe (verify no other component depends on it first), or wrap `<HomePresidentMessage />`, `<HomeWhoWeAre />` and `<HomeGallery />` in `<div>` the way `<HomeEvents />` is wrapped.

Do not hide it with `opacity:0`, `prefers-reduced-motion`, or pause tricks — remove it properly when the project resumes.

---

## 5. Vande Mataram audio

- Single global `<audio>` mounted by `VandeMataramProvider` at `SiteLayout` level — not remounted on route changes.
- `preload="none"`, no `autoPlay` attribute. Nothing is audible until the user clicks the floating burgundy button on the left.
- `loop` attribute **on** — track restarts natively from `0` at end, with no gap, no second instance, no `ended` event on the loop boundary.
- `pagehide` + `beforeunload` listeners force-pause so the OS media session cannot resurrect playback after the user closes the tab.
- `mediaSession.setActionHandler('play' | 'pause' | 'stop' | 'seekbackward' | 'seekforward', null)` — external play buttons (lock-screen, Bluetooth headset, keyboard media key) ignored.
- Audio asset: `/audio/vande-mataram.mp3?v=2026-10-06-instrumental`. Cache-buster bumped whenever the physical MP3 is replaced.

File: `src/components/VandeMataramController.tsx`.

---

## 6. Where everything lives

| Area | File / path |
| --- | --- |
| Routing | `src/App.tsx` |
| Site shell + layout | `src/components/layout/SiteLayout.tsx` |
| Primary navigation | `src/data/navigation.ts` |
| Chapter detail (canonical 10-section) | `src/pages/ChapterPage.tsx` |
| Chapters landing | `src/pages/ChaptersPage.tsx` |
| Council detail | `src/pages/CouncilPage.tsx` |
| Councils landing | `src/pages/CouncilsPage.tsx` |
| Yuva (Yuva Council programme home) | `src/pages/YuvaPage.tsx` |
| Support | `src/pages/SupportPage.tsx` |
| Public API handler | `server/handleRequest.ts` |
| DB schema | `server/schema.sql` + numbered `server/migrations/` |
| Supabase client | `server/db.ts` |
| Audio controller | `src/components/VandeMataramController.tsx` |
| Shared child-page hero | `src/components/layout/IllustratedHero.tsx` |
| Shared chapter card | `src/components/ChapterCard.tsx` |
| Shared council card | `src/components/CouncilCard.tsx` |
| Chapter committee grid | `src/components/ChapterCommittee.tsx` |
| Themes / colour per place | `src/data/orgThemes.ts` |
| Approved watercolour art | `public/theme/place-art/{slug}.webp` |
| Service worker | `public/sw.js` (bump `SW_VERSION` on bundle-impacting changes) |

### Hooks (`src/hooks/`)
- `useOrgChapters()` → `/api/org/chapters` (locale-aware; filtered by DB `active=true`).
- `useOrgCouncils()` → `/api/org/councils` (locale-aware; filtered by DB `active=true` **and** `PUBLIC_COUNCIL_IDS` allowlist).
- `useLeadership(scopeType, scopeId?)` → `/api/org/leadership` (returns only `status='active' AND workflow_status='published'`).
- `useTenantContent(scopeType, scopeId)` → `/api/tenant-content/:scopeType/:scopeId`.
- `useScopeStats(scopeType, scopeId)` → `/api/org/stats`.
- `usePublicEvents({ tab, emirate, scopeType, scopeId, ... })` → `/api/events`.
- `usePublications()` → Drishti magazines.
- `useActivities()` → platform-wide activities (not chapter-scoped yet).

### Public-API discipline
Public endpoints filter on both the DB `active` flag **and** the explicit code allowlists:
- `PUBLIC_COUNCIL_IDS` in `server/handleRequest.ts`
- `ACTIVE_CHAPTER_IDS` in `src/components/ChapterMap.tsx`
- `CHAPTER_ORDER` in `src/pages/ChaptersPage.tsx`
- `chapterOrder` in `src/components/HomeNetwork.tsx`

Flipping `active=true` in DB alone will NOT make a record publicly visible — its id must also be added to the relevant allowlist. This is defence-in-depth. If future architecture moves to pure DB-driven, remove allowlists in lockstep.

---

## 7. Deploy + bootstrap pipeline

### Deploy
Every push to `main` auto-deploys via Vercel. Preview deploys exist for feature branches but are not currently used. **There is no staging environment**; `production` is the only environment.

### Bootstrap endpoint
`POST /api/admin/apply-2026-structure` is an idempotent one-shot (`server/handleRequest.ts`) that:
- Upserts the three new council rows (`delhi`, `startup-hub`, `yuva-council`).
- Normalises English display names (Business Council, Women Council, Yuva Council, Startup Hub, Delhi Council).
- Flips `active=true` on the 15 state + 4 special live set and `active=false` on everything else of each kind.
- Flips Fujairah chapter `active=false` and reasserts the 7 current chapters as active.
- Returns live counts for one-round-trip verification.

**Already applied as of commit `e3afe27`.** Safe to call again — every operation is an upsert or in-place flag flip. Unauthenticated by design; non-destructive.

### Still requires manual Supabase SQL
Migration `server/migrations/033_authoritative_2026_structure.sql` contains one DDL statement the JS client cannot run:
```sql
alter table people add column if not exists district text not null default '';
create index if not exists people_district_idx on people (district);
```
**Run once in the Supabase SQL editor** to activate the Home District field end-to-end on registration. Until then, `district` is sent to auth metadata on signup but is not persisted to `people`, and server SELECTs omit the column so `/api/admin/inbox` and `/api/members/me` stay healthy.

---

## 8. Environment variables

Set in Vercel for `production` (and `preview` where needed). Full example at `.env.example`. `.env` is gitignored.

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server-side service role.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — client auth.
- `IPF_ADMIN_EMAIL`, `IPF_ADMIN_PASSWORD`, `IPF_ADMIN_SEED_PASSWORD_PREFIX`, `IPF_ADMIN_SEED_PASSWORD_SUFFIX` — one-time super-admin seed.
- `CRON_SECRET` — Vercel Cron auth for `/api/cron/purge-audit-logs`.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting (public writes unthrottled until set).
- `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_OTP_TEMPLATE_ID` — phone OTP for member / Yuva registration.

---

## 9. Lifecycle gates (public visibility)

Public API respects:
- `appointments.status='active' AND workflow_status='published'`
- `events.published=true`
- `councils.active=true` (plus `PUBLIC_COUNCIL_IDS` allowlist)
- `chapters.active=true`
- `tenant_content` lifecycle (approved status)

Draft / archived / inactive content stays in CMS and never reaches a public page.

---

## 10. Canonical chapter detail page (new, 2026-10-07)

Every active chapter route uses one component (`src/pages/ChapterPage.tsx`) with ten locked sections:

1. **Hero** — approved `/theme/place-art/{slug}.webp` + eyebrow / title / tagline. Background on md+, inline figure on mobile.
2. **About** — `tenant_content.intro` + highlights + chapter-at-a-glance stats.
3. **Leadership & Committee** — full-width portrait grid via `ChapterCommittee`. Supports ≥10 members. Fallback: ivory monogram tile when `personImage` is missing. Nothing fabricated.
4. **Upcoming Events** — chapter-scoped, data-aware. Hides when empty.
5. **Activities / Initiatives** — RESERVED. Hides until a chapter-scoped activity feed exists.
6. **Latest Updates / News** — RESERVED. Hides until a chapter-scoped news feed exists.
7. **Past Events** — chapter-scoped, data-aware.
8. **Gallery** — `tenant_content.gallery`. "View full gallery" link appears only when > 6 items.
9. **Connect with the Chapter** — approved email + Facebook + burgundy "Join IPF UAE" CTA. No personal committee contact exposed by default.
10. **Explore the IPF Network** — compact peer-chapter tiles + "View all".

Data-aware sections render nothing when empty — no placeholders, no fake "coming soon" cards. CMS boundary: Central Admin owns structure (this file). Chapter Admin owns tenant content, chapter-scoped events, chapter appointments, chapter gallery, approved contact — all via the existing CMS tables.

---

## 11. What's live and verified

- Full IPF 2026 structural compliance in production (7 chapters, 19 councils, 4 wings not counted).
- Councils directory with adaptive balanced grid for Special Councils (1 / 2 / 3 / 4 cards all centre correctly).
- Canonical Chapter detail page applied to all 7 chapters (verified on live production).
- Transparent header logo.
- Burgundy CTA system platform-wide (no navy filled public CTAs).
- Vande Mataram looping native audio, no autoplay, no duplicate playback across SPA navigation.
- Centred 4+3 Chapter medallion grid on the homepage.
- Refined Support hero (`Together, / when it matters.` + `Care, guidance and support — when our community needs it.`, `max-w-[440px]` text column).
- Public Sign In hidden from the top utility strip until the member portal is production-ready. `/sign-in` route still works for admin login and existing deep links.
- Yuva Volunteer checkbox removed from registration. Home District field added end-to-end at the API / client layer (DDL still pending — see §7).
- About page "Our network" trio collapsed to Chapters + Councils (Yuva card retired; Yuva already surfaces via Councils / /yuva).

---

## 12. Pending / reserved for Rockstar stage

Nothing below should be touched during the halt. Reopen when the founder re-opens the project.

### Content pipelines
- **Chapter-scoped Activities / Initiatives** — new table + public API + `useChapterActivities()` hook. Slot already present in `ChapterPage.tsx` section 5.
- **Chapter-scoped News / Updates** — new table or `emirate` filter on existing publications pipeline. Slot already present in `ChapterPage.tsx` section 6.

### CMS workflow
- Draft → Submit → Review → Approve → Publish/Schedule UI. Schema already supports lifecycle (`workflow_status`); UI surfacing deferred.
- Per-chapter SEO authoring (title / description override, OG image, structured data).

### Authorization + scoping
- Supabase RLS so a Dubai chapter admin cannot edit Sharjah content from the API. Currently enforced only in server handlers; DB-level RLS is the long-term requirement.
- Role matrix for Central / Chapter / Council / Editor admins against each CMS surface.

### Data authoring (needs IPF team input)
- **Chapter leadership rosters** — most chapters have zero published appointments. Leadership section hides until authored. Collect per-chapter rosters from the IPF team.
- **Chapter contact emails** — 4 of 7 chapters have an empty `contact_email` and currently fall back to the global `info@ipf-uae.org`. Collect approved per-chapter inboxes.
- **Chapter tenant_content** (intro / highlights / gallery) — mostly empty. Collect approved copy + photography per chapter.
- **Central Team roster** — the IPF team mentioned an uploaded source; it has not been reconciled against the live `appointments` table. Needs a comparison pass against the authoritative file.
- **Startup Hub / Yuva Council detail content** — rows exist, detail pages render fallbacks. Awaiting CMS content.
- **Startup Hub artwork** — no `/theme/place-art/startup-hub.webp` yet. `CouncilCard`'s onError handler hides the broken image gracefully; add the asset when available.

### Deferred DB migration
- Migration 033's `ALTER TABLE people ADD COLUMN district` — run in Supabase SQL editor. See §7.

### Fujairah reactivation
- Fujairah chapter preserved with `active=false`. If the authoritative source later confirms it should be live, flip the DB flag and add `fujairah` back to `CHAPTER_ORDER`, `ACTIVE_CHAPTER_IDS` and `HomeNetwork` chapter order.

### Legacy CSS removal
- Delete `.home-theme-page > section::before` + `:nth-of-type(even)::before` + `ipf-theme-spin` keyframe from `src/index.css` lines 438–441 (verify no component depends on it first). See §4.

### Yuva navigation
- The old handoff flagged a navigation change moving `IPF Yuva` out from under the About dropdown. Current state keeps it inside About (confirmed with Durga during Oct 7 work). Do not change without her explicit instruction.

---

## 13. Responsive QA requirement (locked)

Every CSS / layout / positioning / media-query change must be verified at **both** mobile (≤640px) and desktop (≥1024px) breakpoints before being called done. Specifically probe at **390, 430, 768, 1024, 1280, 1440, 1920**. Trace CSS at both breakpoints; curl with mobile UA at minimum. No desktop-only inspection. This rule is project-agnostic and non-negotiable.

---

## 14. Pick-up checklist (post-halt)

Only follow this when Durga has explicitly re-opened the project.

1. Read this file end-to-end.
2. `cd ~/Projects/ipf-uae-digital-platform && git fetch origin && git pull origin main`.
3. Confirm you are at or past `e3afe27`.
4. `npm install`.
5. Set `.env` from `.env.example` + Vercel dashboard values.
6. `npm run i18n:build` once (regenerates per-locale JSON).
7. `npm run dev` for local work.
8. Follow §13 before shipping any UI change.
9. Follow §4 before touching any animation or decoration.
10. Follow §3 before touching any CTA, logo or hero artwork.

Hygiene for this account: before any `gh` or git-via-gh command, prefix with `unset GH_TOKEN GITHUB_TOKEN &&` — Durga's shell has stale env values and auth breaks otherwise.

---

## 15. Recent commit history (last 20)

```
e3afe27  Chapter detail pages: canonical 10-section architecture
6b91bee  Vande Mataram: enable native loop on the audio element
da0547d  Balance Special Councils directory layout
88e3c5c  Refine Support hero editorial composition
6b46798  Support hero: refresh headline + supporting line copy
8871ffe  Homepage Chapters panel: center the row-2 group under row-1
aec52e9  Add /api/admin/apply-2026-structure bootstrap endpoint
2435edf  Align platform with authoritative IPF 2026 feedback
3697b9d  Councils: live set is 15 State + 3 Special (18 total)
bdb807a  Councils: public live set is 15 (12 state + 3 special)
02b0fbb  Councils: 15 state + 3 special live set · Support: simplify hero copy
9630d40  Councils directory: dynamic section headings
3b016e4  Councils: visual directory from hero artwork · Yuva: restore premium membership cards
c602b20  Yuva: polish engagement + responsive composition below the locked hero
56b6d34  Yuva hero: simplify copy
d26bcbc  Header: remove bg-white from logo <img> (restore true transparency)
4bbf479  Support: deep-link Contact IPF Cares button to /contact#ipf-cares
91968f9  Councils: retire IPF Cares promo block · Contact: add #ipf-cares anchor
3d9fe19  Yuva + Support: engagement-focused rewrites with prominent IPF Cares
699b3d1  Nav dropdown: belt-and-braces blur on child select + bump SW version
```

Full history: `git log --oneline` (175+ commits as of halt).

---

## 16. Halt notice

**The founder (Durga Charan) has halted this project on 2026-10-07** pending:

- IPF stakeholder review of the current live site.
- Approved authoritative content for the gaps listed in §12.
- Any corrections the IPF team flags against the live platform.

Do not start Rockstar-stage work. Do not open PRs. Do not touch `main`. Do not propose changes until the founder re-opens the project. Open items queued by stakeholders should be captured in a separate backlog document for Durga's triage on resumption — not merged into this file.

End of handoff.
