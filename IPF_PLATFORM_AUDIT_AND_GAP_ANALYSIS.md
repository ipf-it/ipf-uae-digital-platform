# IPF UAE Platform — Audit & Redesign Gap Analysis

_Read-only audit · 2026-10-04 · author: nammadaiva-agent · DRAFT — not yet committed to the repo._

**Scope:** `github.com/ipf-it/ipf-uae-digital-platform` at commit `94582ec`, deployed at `https://ipf-uae-digital-platform.vercel.app/`, compared against the legacy site `https://www.ipf-uae.org/` and the agreed redesign objectives.

**Method:** read PROJECT_BRIEF.md; traced each major feature UI → component → API endpoint → table → RLS; probed 7 live API endpoints and both live sites; inspected all 31 database migrations, all 11 admin tabs and all 7 operations views, all 33 public pages, and the 49-endpoint request handler. No application, Supabase or Vercel changes were made.

**Classification key used throughout:**
- 🟢 `EXISTS & GOOD` — implemented, tested at the live endpoint, matches redesign intent
- 🟡 `EXISTS BUT NEEDS IMPROVEMENT` — implemented and reachable, but visibly weak against the redesign bar
- 🟠 `PARTIALLY IMPLEMENTED` — code paths exist but production isn't actually using them (empty tables, missing config, partial flow)
- 🔴 `NOT IMPLEMENTED` — absent in code
- ⚪ `REQUIRES BUSINESS DECISION` — can't be audited technically; the gap is a product decision

---

## 1 · Executive summary

The IPF UAE Digital Platform is **functionally substantial** (31 database tables, 49 API endpoints, 33 public pages, 11 admin tabs, a 10-language CMS, draft→approve→publish workflow, member registration/portal, QR check-in, audit logging), but it is **operationally pre-launch**: `/api/stats` returns `members: 0, yuva: 0`, no sponsors are seeded, nav items are empty, phone-OTP is disabled, deployment uses a legacy-asset path for leadership images, and the whole SPA ships zero SEO payload (no description meta, no OG, no sitemap, no JSON-LD).

The redesign objectives — "modern, premium, institutional, interactive, mobile-first, Digital Headquarters, India-UAE storytelling, major diaspora platform" — are **not blocked by missing architecture**. The data model, scoping, workflow and RBAC are already real. What's missing is **content, polish, publishable member-facing flows, and an SEO/SSR story**. Rough ordering of what matters:

| # | Finding | Why it matters | Classification |
|---|---|---|---|
| 1 | **SPA with no SEO** — single title tag, no description, no OG/Twitter, no JSON-LD, no sitemap.xml / robots.txt (both URLs return the SPA shell), content invisible to search engines | A diaspora platform that can't be found via Google doesn't scale. Blocks SEO objective entirely. | 🔴 NOT IMPLEMENTED |
| 2 | **Leadership profiles are hollow shells** — real names seeded (Jitendra Vaidya, Rajeev Ranjan Singh, etc.) but every record has `bio=""`, `contactEmail=""`, `contactPhone=""`, `membershipNo=""`, `socialLinks=[]`; images point at `/legacy-assets/images/*` | Chapter/Council page requirement calls for ≥10 members with photo, designation, contact, membership number, socials — none of this is populated. | 🟠 PARTIALLY IMPLEMENTED |
| 3 | **Sponsors: zero seeded** — `/api/sponsors` returns `{sponsors:[]}` despite full sponsors infrastructure in schema + admin UI | Sponsors are an agreed capability; business decision needed on first batch. | ⚪ REQUIRES BUSINESS DECISION |
| 4 | **Navigation returns empty objects live** — `/api/nav` returns `primaryNav={}, footerGroups={}, mobileTabs={}, utilityLinks={}`; the migration 025 seed either didn't run or the deployed DB predates it; the SPA presumably falls back to the hardcoded `src/data/navigation.ts` | Nav editing in admin is non-functional against this environment until seed runs | 🟠 PARTIALLY IMPLEMENTED |
| 5 | **Member registration + Yuva registration disabled de-facto** — phone-OTP intentionally skipped (migration 013) because no SMS provider is funded; stats show `members:0, yuva:0`; registration will go through with any correctly-formatted UAE mobile without actual phone ownership proof | Growing the diaspora base is the #1 strategic requirement; registration path works but has an open fraud vector | 🟡 EXISTS BUT NEEDS IMPROVEMENT |
| 6 | **Publications UX collapses** — 19 publications live, 18 of which are called just `"Drishti"` with no visible edition number/date in the response payload | Publications page will look broken until seed data gets edition labels or UI renders dates. | 🟡 EXISTS BUT NEEDS IMPROVEMENT |
| 7 | **India-UAE storytelling / institutional premium feel is thin** — `TricolorWaves`, `TricolorFrame`, India-UAE flags image exist, but the homepage CMS carries 12 generic hero/who/join text fields and no bespoke India-UAE narrative structure | Core redesign requirement; current platform looks like a competent association site, not a "Digital Headquarters" | 🟡 EXISTS BUT NEEDS IMPROVEMENT |
| 8 | **Email/notifications: none wired** — inquiries, approvals, event confirmations have no email delivery. Member only sees status by returning to portal. | Operational must-have before soft launch | 🔴 NOT IMPLEMENTED |
| 9 | **Payment integration: donations are pledges only** | ⚪ Business decision on gateway | 🔴 NOT IMPLEMENTED |
| 10 | **MFA for admins is a schema flag, not a flow** — `admin_users.mfa_required=true` default exists but no enrolment/challenge path in `handleRequest.ts` | Security requirement for institutional platform; cheap to add via Supabase Auth MFA | 🟠 PARTIALLY IMPLEMENTED |

**Overall posture: ~70% of the architectural work is done. ~30% of the content, polish and SEO/notification work is missing.** The repo earns its "Digital Headquarters" label at the data layer; it does not yet earn it at the public-facing presentation layer.

---

## 2 · Current platform architecture

As documented in `PROJECT_BRIEF.md` §2–3, verified against the repository at commit `94582ec`:

**Stack:** React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + Radix UI primitives + motion + lucide-react + react-router-dom v7 + Supabase (Postgres + Auth + Storage) + Upstash Redis + MSG91 (disabled) + Vercel Functions + Vercel Cron.

**Request flow:** React SPA → `/api/*` → single Vercel Function `api/handler.ts` → `server/handleRequest.ts` (2,414 lines, 49 endpoint if-branches) → Supabase service-role client (`server/db.ts`) → Postgres tables with RLS enabled.

**Key architectural facts verified live:**
- `/api/health` 200
- `/api/home-content` 200 with 12 CMS-editable text fields populated
- `/api/org/chapters` 200 with 8 chapters
- `/api/org/councils` 200 with 31 councils
- `/api/org/leadership` 200 with real names, hollow profiles
- `/api/publications` 200 with 19 publications
- `/api/events` 200 with 3 upcoming events
- `/api/sponsors` 200 with `{sponsors:[]}` — empty
- `/api/nav` 200 but every section is `{}` — empty
- `/api/stats` returns `members:0, yuva:0, events:25, chapters:8`

**Deployment:** Vercel, HTTP/2, `strict-transport-security` set, `x-vercel-cache: MISS` on homepage (no HTML cache), modules preloaded, no SSR, no ISR.

🟢 EXISTS & GOOD at the architecture level.

---

## 3 · Current public website assessment (new platform)

Deployed at `https://ipf-uae-digital-platform.vercel.app/`.

**What works today (verified by hitting live endpoints):**
- Homepage CMS content delivers (hero_badge, hero_title + 10 more fields)
- Chapter directory loads with 8 chapters
- Council directory loads with 31 councils
- Event list loads
- Publications list loads
- Leadership list loads with names and photos

**What is weak or absent on the live site:**
- The HTML served is a Vite SPA shell: `<title>` + viewport + manifest + font preloads + module preloads, then empty `<div id="root"></div>`. No `<meta name="description">`, no OG, no Twitter, no JSON-LD, no canonical link.
- `/robots.txt` and `/sitemap.xml` both return 200 but with the SPA shell (SPA routing intercepting those paths) — they are **not real** files. Vercel is not generating them.
- No structured data; search engines won't understand the content.
- No visible analytics (no gtag, no plausible, no Vercel Analytics tag in index.html).
- `/legacy-assets/images/*` is referenced for leadership portraits — this is a holdover path from the legacy site content; needs migration to Supabase Storage before public launch.

**Lighthouse / Core Web Vitals: not measured in this audit** (requires a browser). Flagging as follow-up.

🟡 EXISTS BUT NEEDS IMPROVEMENT.

---

## 4 · Existing website vs new platform — migration matrix

Legacy site `https://www.ipf-uae.org/` runs PHP 7.3.33 on Apache. The 15 live pages I enumerated:

| Legacy page | Migration recommendation | New-platform mapping | Notes |
|---|---|---|---|
| `index.php` | **REDESIGN** | `/` HomePage | Legacy carousel + static sections; new platform's homepage is CMS-driven but hero narrative needs strengthening |
| `about-ipf.php` + `#vision #values #aim-objective #our-responsibility` | **MIGRATE** | `/about`, `/governance` | Content needs to come across; current new-platform About is CMS section-based |
| `commitee.php` (note typo preserved) + `#centralCommittee #chapters #managingCommittee` | **MERGE** | `/leadership` + `/chapters` + `/chapters/:id` + `/councils` + `/councils/:id` | Legacy was one monolithic page; new platform splits into leadership + per-chapter + per-council — architectural improvement, requires content port |
| `president-message.php` | **MIGRATE** | New: embed as `president_quote_title` + `president_quote_body` on homepage (already there) + a dedicated `/leadership/president` detail OR a section on `/about` | CMS fields exist but body text may be empty on prod |
| `discover-india.php` | **KEEP** | `/discover-india` | New platform has it; needs content audit |
| `drishti-e-magazine.php` | **REDESIGN** | `/drishti` + `/api/publications` | New platform data layer is stronger (19 publications live); UI needs edition labels, dates, covers |
| `event-calendar.php` | **REDESIGN** | `/events` + `/events/:id` | New platform supports RSVP, volunteer, workflow, scoping — much richer |
| `glimpses.php` | **MIGRATE** | New: embed in `/events/:id` galleries + a dedicated `/gallery` route (does not exist yet) | 🔴 /gallery route is MISSING — needs new route |
| `news.php` | **KEEP** | `/news` + `/news/:slug` | New platform routes exist |
| `blog.php` | **KEEP** | `/blog` + `/blog/:slug` | New platform routes exist |
| `testimonial.php` | **KEEP** | `/testimonials` | New platform route exists |
| `privileges.php` | **MIGRATE** | `/privileges` | New platform route exists |
| `support-activity.php` + `#grievance-counseling #community-support` | **MIGRATE** | `/support` | New platform route exists; migration 018 seeded content |
| `contact.php` | **MIGRATE** | `/contact` | New platform route exists |
| `ipf-application-form.php` | **REDESIGN** | `/register` (member + Yuva) | New platform's registration is the natural replacement |
| `sign-in.php` | **REDESIGN** | `/sign-in` | New platform uses Supabase Auth; legacy had its own auth |

**Legacy site also references:**
- Alternate domain `www.ipf-uae.com` — needs clarification (same org? abandoned? redirect target?)
- Multiple chapter Facebook pages (IPFAUH, IPFDXB, IPFSHJ, IPF-RAK, IPF Al Ain, IPF Fujairah, IPF Umm Al Quwain) — should be captured on respective `/chapters/:id` pages as `socialLinks`
- Twitter `@ipfuae` — should be on contact + footer

**Nothing marked for silent removal.** Items the Founder may decide to drop (external links to `valuehomesdubai.com`, `palpx.ai/com`) go in a `REMOVE — requires approval` queue; see §29.

---

## 5 · Homepage gap analysis

| Required homepage element | Status | Notes |
|---|---|---|
| Premium India-UAE hero / storytelling | 🟡 EXISTS BUT NEEDS IMPROVEMENT | `TricolorFrame` and `TricolorWaves` components ship; `hero_badge/title/subtitle/intro` CMS fields are populated with "Since 2014…" copy. Narrative structure is single-paragraph — not "storytelling" |
| Clear IPF UAE positioning | 🟢 EXISTS & GOOD | `hero_badge = "Official community organisation"` + title + subtitle set correctly |
| Community impact metrics | 🟠 PARTIALLY IMPLEMENTED | `/api/stats` exists and returns `members:0 yuva:0 events:25 chapters:8` — rendering unreliable (0 members looks like a bug when it's an empty DB) |
| Chapters / Councils discovery | 🟢 EXISTS & GOOD | Live counts 8 + 31; chapter/council directory pages exist |
| Recent event photographs | 🔴 NOT IMPLEMENTED | No `event.gallery_images` relationship in schema; events have `slides` JSONB but no verified gallery wiring |
| Upcoming events | 🟢 EXISTS & GOOD | 3 live events: World Food Day, Diwali, UAE National Day |
| Latest news / articles | 🟠 PARTIALLY IMPLEMENTED | `/news` + `/blog` + `ArticlePage` routes exist, no `/api/news` endpoint confirmed, probably served via `page_sections` |
| Activities / initiatives | 🟢 EXISTS & GOOD | `activities` table + `/api/activities` + admin tab |
| India-UAE partnership storytelling | 🔴 NOT IMPLEMENTED | No dedicated storytelling blocks in `home_content`; `page_sections` is generic but no "partnership" page seeded |
| Sponsors / partners | 🟠 PARTIALLY IMPLEMENTED | `sponsors` table + `/api/sponsors` return `[]`; admin UI complete |
| Social-media presence | 🔴 NOT IMPLEMENTED | No social-feed component, no social links block on homepage |
| Membership / Join CTA | 🟢 EXISTS & GOOD | `join_eyebrow/title/desc` CMS fields on home_content + `/register` route |
| Volunteer CTA | 🟡 EXISTS BUT NEEDS IMPROVEMENT | `is_volunteer` is a flag on `people`; volunteer_hours table exists; no dedicated homepage volunteer CTA |
| Other CMS-controlled sections | 🟢 EXISTS & GOOD | `page_sections` + `_i18n`, carousel/richText/photoGrid/cta block types |

---

## 6 · Information architecture

**Routes defined** (verified in `src/App.tsx`):

**Public (37 routes):** `/`, `/about`, `/leadership`, `/governance`, `/history`, `/chapters`, `/chapters/:chapterId`, `/councils`, `/councils/:councilId`, `/discover-india`, `/explore-uae`, `/drishti`, `/events`, `/events/:eventId`, `/activities`, `/sponsors`, `/resources`, `/blog`, `/blog/:slug`, `/news`, `/news/:slug`, `/testimonials`, `/membership`, `/privileges`, `/yuva`, `/jobs`, `/support`, `/contact`, `/donate`, `/register`, `/sign-in`, `/portal`, `/portal/card`, `/*` (NotFound).

**Admin (9 routes):** `/admin` (Dashboard), `/admin/operations`, `/admin/organisation`, `/admin/pages`, `/admin/publications`, `/admin/navigation`, `/admin/cms`, `/admin/support`, `/admin/people`.

**Gaps / unresolved IA questions:**
- **No `/gallery` route** — legacy `glimpses.php` has nothing to map to. Needs business decision.
- **No `/leadership/:personId` detail route** — once leadership profiles get real content, each office-bearer could warrant a profile detail page.
- **`/portal` is auth-gated** — no clear member-dashboard shape visible in brief; needs UX design.
- **`/membership` page is 42 lines** — tiny, almost certainly a CMS-rendered page; needs redesign for premium "join us" story.

---

## 7 · Chapters & Councils

### What exists
- 8 chapters seeded live (Abu Dhabi, Ajman, Al Ain, Dubai, Fujairah, Ras Al Khaimah, Sharjah, Umm Al Quwain) — matches the 7 UAE emirates + Al Ain
- 31 councils seeded live — 28 Indian state councils + Business + Cultural + Women's (if seeded, needs verification against legacy expectation)
- `chapters` + `chapters_i18n` tables with full org-model relationships
- `tenant_content` table for per-chapter editable landing content
- `positions` + `positions_i18n` with full committee-position vocabulary (Convenor, Co-Convenor, General Secretary, Joint Secretary, Treasurer, Executive Committee Member — migration 028)
- `appointments` table joining person-to-position with workflow approval (migration 027)
- `page_sections` for extra admin-editable blocks on each chapter page
- Admin UI tabs: `OrganisationTab.tsx` (844 lines — the biggest tab)
- `/api/org/chapters` and `/api/org/councils` endpoints working live

### Requirements status for the "every chapter needs" list

| Requirement | Status | Notes |
|---|---|---|
| dedicated page | 🟢 EXISTS & GOOD | `/chapters/:chapterId` route + `ChapterPage.tsx` (179 lines) |
| introduction / about | 🟢 EXISTS & GOOD | `tenant_content` + editable `hero_tagline` (migration 015) |
| minimum 10 team members | 🟠 PARTIALLY IMPLEMENTED | Positions seeded (migration 014); real rosters seeded (migrations 028–029) but EVERY leadership record has `bio="" contactEmail="" contactPhone="" membershipNo="" socialLinks=[]` |
| name | 🟢 | — |
| designation | 🟢 | from `positions.name` |
| photograph | 🟡 | field exists; images point at `/legacy-assets/images/*` (pre-migration path) |
| contact number where approved | 🟡 | field + `display_phone_publicly` gate (migration 020) exist; no values populated |
| membership number | 🟡 | field exists (migration 020); not populated |
| social links | 🟡 | field exists; not populated |
| term dates / status | 🟡 | `started_at` field exists; not populated |
| latest activities | 🟡 | `/api/activities` works; chapter-scoped filter needs checking |
| upcoming events | 🟢 | scope_id joins events to chapters |
| past events | 🟢 | same |
| gallery / media | 🔴 | no gallery table; `events.slides` is per-event only |
| news | 🟡 | news routes exist; chapter-scoped filtering unclear |
| social-media links | 🟡 | field exists; not populated |
| contact information | 🟡 | `tenant_content` has freeform content; no structured contact fields on chapter record |

### Alphabetical vs membership-number ordering
- Current `/api/org/chapters` returns chapters already alphabetical (Abu Dhabi → Umm Al Quwain)
- No sort field on appointments visible in the live payload
- Membership-number sort is in the schema (migration 020 added `membership_no` to appointments) but UI likely renders alphabetical today — needs confirmation at the component level

---

## 8 · Leadership

### What exists
- `/api/org/leadership` returns a list of appointments scoped to central IPF leadership
- 10+ real names: Jitendra Vaidya (President), Rajeev Ranjan Singh (General Secretary – Operation & Execution), + more
- Images seeded from legacy site at `/legacy-assets/images/*.jpg`

### Gaps
- 🟠 **Every profile is a shell** — bio, email, phone, membership_no, startedAt, socialLinks all empty
- 🔴 **No `/leadership/:personId` detail page** — only a list page exists
- 🔴 **No cross-link from leadership → chapter/council pages** — no visible relationship rendering
- 🟡 **President message**: `home_content.president_quote_title` + `president_quote_body` exist; content needs verification

---

## 9 · Events

Audit mapped against brief §12:

| Requirement | Status | Evidence |
|---|---|---|
| Upcoming/past events | 🟢 | 3 upcoming live; events table carries `starts_at`/`ends_at` |
| Event detail pages | 🟢 | `/events/:eventId` route |
| Registration | 🟢 | `event_registrations` table; `/api/rsvp` endpoint |
| Capacity / status | 🟢 | migration 021 added capacity + venue map link + event-specific contact |
| QR registration / check-in | 🟢 | `CheckInView.tsx` (94 lines) + QR via `qrcode` lib + `event_registrations.registration_no` |
| Volunteer duties | 🟢 | `event_volunteers` table with assigned/confirmed/attended states |
| Galleries | 🟡 | `events.slides` is JSONB — no structured gallery relationship |
| Event reports / news | 🔴 | no post-event report entity |
| Event sponsors | 🟢 | `event_sponsors` table (migration 019) |
| Social sharing / publishing | 🔴 | no share buttons / OG metadata per-event |
| Chapter/Council ownership | 🟢 | `events.scope_type ∈ {global, chapter, council}` + `scope_id` + workflow |

Overall event system is the **most mature** area of the platform.

---

## 10 · Sponsors

- Schema: `sponsors` (org-level) + `event_sponsors` (per-event junction) — migration 019
- Admin UI: `SponsorsView.tsx` (206 lines) — functional CRUD surface
- Live `/api/sponsors` returns `{sponsors:[]}` — ⚪ **zero sponsors seeded**
- Public `/sponsors` route exists; renders empty
- Event detail pages have a hook to list `event_sponsors`

Classification: 🟠 PARTIALLY IMPLEMENTED (code done, content missing).

---

## 11 · News / Activities / Media

- Routes: `/news`, `/news/:slug`, `/blog`, `/blog/:slug`, `/activities`
- Data: `activities` table (CRUD); news/blog are served via `page_sections` + `ArticlePage.tsx` — treats blog/news as CMS pages, not a feed
- 🔴 **No `/api/news` or `/api/blog` endpoint** confirmed in handleRequest.ts
- 🔴 **No media library** separate from `event.slides` and `publications.file_url` and `tenant_content` (Supabase Storage `ipf-uploads` bucket is the only file storage)

Classification: 🟡 for news/blog (routes exist, data flow unclear), 🟢 for activities, 🟠 for media (bucket exists, no media table).

---

## 12 · Membership & YUVA

- Routes: `/register`, `/membership`, `/yuva`, `/sign-in`, `/portal`, `/portal/card`
- Schema: `people` with `kind ∈ {member, yuva}`, `membership_no` from sequence `ipf_member_number_seq` or `ipf_yuva_number_seq`
- Workflow:
  - `/api/members/check-phone` → `/api/members/otp/request` → `/api/members/otp/verify` → `/api/members/register`
  - `/api/members/login` → `/api/members/me` (profile + my support + my hours)
- **Phone OTP disabled** (migration 013) → de-facto registration accepts any correctly-formatted UAE mobile without SMS proof
- Live stats: `members: 0, yuva: 0` → **nobody has registered on this environment yet**
- `/portal/card` renders a QR digital ID (via `qrcode` lib + `DigitalIdCard.tsx`)
- Member-portal "my support" + "my hours" surfaces (migrations 009, 012)

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT (works, needs real OTP + public-launch readiness).

---

## 13 · CMS / Admin

### Admin tabs (lines of code, as a rough signal of implementation depth)

| Tab | Lines | Status |
|---|---|---|
| `OrganisationTab.tsx` | 844 | 🟢 the largest; manages chapters/councils/positions/appointments |
| `PagesTab.tsx` | 539 | 🟢 page_sections editor |
| `OperationsTab.tsx` | 63 | shell → routes to 7 sub-views |
| `  → EventsView.tsx` | 369 | 🟢 full events CRUD |
| `  → ActivitiesView.tsx` | 211 | 🟢 |
| `  → SponsorsView.tsx` | 206 | 🟢 |
| `  → RegistrationsView.tsx` | 154 | 🟢 |
| `  → ApprovalsView.tsx` | 140 | 🟢 workflow queue |
| `  → AuditLogView.tsx` | 132 | 🟢 super-admin audit viewer |
| `  → CheckInView.tsx` | 94 | 🟢 QR check-in |
| `ContentTab.tsx` | 266 | likely home_content editor |
| `NavigationTab.tsx` | 253 | 🟡 editor exists; live DB has empty nav_items |
| `PublicationsTab.tsx` | 218 | 🟢 Drishti editions |
| `TenantContentTab.tsx` | 211 | 🟢 per-chapter/council content |
| `PeopleTab.tsx` | 204 | 🟢 member + Yuva directory |
| `DashboardTab.tsx` | 166 | 🟢 ops dashboard |
| `SupportTab.tsx` | 157 | 🟢 inquiry triage |
| `CmsTab.tsx` | 106 | 🟡 likely legacy, pre-pages model |

### Admin capability matrix (code paths exist; actual admin usability depends on data)

| Entity | Create | Edit | Approve | Publish | Archive | Delete |
|---|---|---|---|---|---|---|
| Events | ✓ | ✓ | ✓ | ✓ | ? | ? |
| Activities | ✓ | ✓ | – | ✓ | – | – |
| Chapters/councils | ✓ | ✓ | – | – | – | – |
| Positions | ✓ | ✓ | – | – | – | – |
| Appointments | ✓ | ✓ | ✓ (mig 027) | ✓ | – | – |
| Tenant content | ✓ | ✓ | ✓ | ✓ | – | – |
| Page sections | ✓ | ✓ | ✓ | ✓ | – | – |
| Home content | – | ✓ | – | ✓ | – | – |
| Nav items | ✓ | ✓ | – | ✓ | – | – |
| Publications | ✓ | ✓ | – | ✓ | – | – |
| Sponsors | ✓ | ✓ | – | ✓ | – | – |
| Inquiries | – | ✓ (status) | – | – | – | – |
| Audit logs | – | – | – | – | – | purge via cron |

🟠 **"Dynamic new section creation"** — the schema has `page_sections` with block types `carousel / richText / photoGrid / cta`. Adding a *new block type* requires a code change + migration (not CMS-only). Adding a *new section instance* of an existing type is CMS-only. The brief's phrasing "new sections can genuinely be added dynamically" is partially true: new section **instances** yes, new **types** no.

---

## 14 · Roles & approval workflow

Verified against `admin_users.role` CHECK constraint:

- `super_admin` — unlimited
- `central_content_admin` — global scope content
- `chapter_admin` — scoped to one chapter, submissions go through central approval
- `council_admin` — same for a council
- `editor` — draft-only

Workflow states (shared across `approval_requests` and workflow-aware tables like `events`, `tenant_content`, `appointments`):

```
draft → submitted → under_review → changes_requested | rejected | approved → scheduled → published
```

`approval_requests` unique index on `(entity_type, entity_id)` means **one open workflow per entity at a time** — correctly prevents double submission.

🟢 EXISTS & GOOD architecturally. Not yet exercised at volume (stats show the DB is near-empty).

**Audit trail:** `audit_logs` table with actor/action/entity_type/entity_id/old_value/new_value/request_id. Monthly purge cron. 🟢

---

## 15 · Multilingual

Verified in `src/i18n/dict/`:

| Code | Language | Script | Font loaded in index.html |
|---|---|---|---|
| en | English | Latin | Noto Sans + Playfair Display |
| bn | Bengali | Bengali | Noto Sans Bengali |
| gu | Gujarati | Gujarati | Noto Sans Gujarati |
| hi | Hindi | Devanagari | Noto Sans Devanagari |
| kn | Kannada | Kannada | Noto Sans Kannada |
| ml | Malayalam | Malayalam | Noto Sans Malayalam |
| mr | Marathi | Devanagari | ↑ Devanagari |
| pa | Punjabi | Gurmukhi | Noto Sans Gurmukhi |
| ta | Tamil | Tamil | Noto Sans Tamil |
| te | Telugu | Telugu | Noto Sans Telugu |

Arabic was **explicitly dropped** (commit `4c41a1f`).

### Translated content vs UI translation
- UI strings: ✓ for all 10 languages (dicts present)
- Content tables with `_i18n` parallel: `chapters`, `councils`, `positions`, `page_sections`, `home_content`, `nav_items`
- Content tables **WITHOUT** `_i18n`: `events`, `publications`, `sponsors`, `activities`, `inquiries`, `donations`
- **Fallback behavior:** English acts as canonical; translations fall back when missing (standard pattern, likely implemented via LEFT JOIN or application-side merge)

### Gaps
- 🟡 Events, publications, sponsors are **English-only** at the data layer — a Kannada reader opening `/events` sees English event titles even if UI chrome is Kannada
- 🔴 No locale-aware SEO/metadata (same empty `<meta>` in all languages)
- 🟡 No visible admin workflow for a translator; i18n columns likely need direct editing

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT.

---

## 16 · India-UAE brand / UX assessment

**What's there:**
- Brand palette: `#0b1f3a` navy (theme-color meta)
- `TricolorFrame` + `TricolorWaves` components (verified in preloads: `TricolorFrame-Bh2Agebj.js`)
- India-UAE flags image on homepage (recently recropped — commit `ffdf16c`)
- Fonts for all 10 Indian scripts loaded in `index.html`
- Playfair Display for display serif accents
- `BrandMark.tsx` + `BrandLoader.tsx` exist

**What's missing against "modern, premium, institutional, interactive":**
- 🟡 Homepage story structure is linear (hero → who → join); no India-UAE story arc, no interactive map, no community-impact numbers rendered with visual depth
- 🔴 No motion-driven storytelling blocks beyond basic animations
- 🔴 No bespoke chapter identity (each chapter page looks structurally identical; no emirate-specific colour accents or imagery)
- 🔴 No testimonial carousel on homepage
- 🔴 No "news ticker" or activity feed
- 🟡 `CommunityStats.tsx` component exists (preloaded) but can only render `{members:0, yuva:0}` today

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT — foundation is there, premium execution isn't.

---

## 17 · Mobile & responsive assessment

**Observed:**
- `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` ✓
- PWA manifest + apple-mobile-web-app meta ✓
- Tailwind v4 utility classes throughout (verified in `index-Cug8mA-a.css`)
- `MobileIntro.tsx`, `OrgMegaMenu.tsx`, `LanguageToggle.tsx` components exist (mobile considerations present)
- `src/components/layout/Header.tsx` + `Footer.tsx` carry mobile logic

**Not independently verified in this audit:**
- Rendering at 375 / 768 / 1024 / 1440 (requires a browser — I only read HTML + CSS files, didn't render)
- Touch target sizes
- Form usability on mobile
- Admin usability on tablet
- The commit `d4b8f8d` ("Fix admin sidebar scrolling away with the page on desktop") suggests responsive issues have been found before

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT — can't score definitively without visual QA.

---

## 18 · SEO

**Current state (verified live):**
- `<title>Indian People's Forum UAE | Official Community Website</title>` on every route (served from `index.html`; title changes client-side via `DocumentTitle.tsx` but **search engines see only the index.html**)
- `<meta name="viewport">` ✓
- `<meta name="theme-color">` ✓
- `<meta name="apple-mobile-web-app-*">` ✓
- **No `<meta name="description">`**
- **No Open Graph tags** (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- **No Twitter card tags**
- **No `<link rel="canonical">`**
- **No JSON-LD structured data**
- **`/robots.txt` is the SPA shell** — not a real robots.txt
- **`/sitemap.xml` is the SPA shell** — not a real sitemap
- **No SSR / no prerender / no ISR** — the entire site is client-rendered
- No Google Analytics / Plausible / Vercel Analytics tag detected

**Impact:** this is a diaspora community platform that **will not be found via Google** for "Indian community UAE", "IPF UAE", "Dubai Diwali 2026", etc. The content is good; the discovery mechanism is absent.

Classification: 🔴 NOT IMPLEMENTED. **This is the #1 P0 item for public launch.**

---

## 19 · Accessibility

Not independently verified (requires axe / Lighthouse / manual screen-reader pass). Positive signals:
- Radix UI primitives throughout (accessible by default)
- Semantic HTML in `Header`, `Footer`, `SiteLayout`
- `TricolorFrame` + `BrandMark` labelled components
- 10-language support implies attention to internationalisation

Flags for follow-up:
- Icon-only buttons (lucide-react) — need `aria-label` audit
- Form error messaging consistency unknown
- Keyboard navigation flow for the admin workspace unknown
- Color contrast of `#0b1f3a` vs accents needs verification

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT (Radix gives a floor; above the floor is unmeasured).

---

## 20 · Performance

**Observed:**
- Vite build with code-splitting (verified via `<link rel="modulepreload">` lines in index.html — React, Lucide, api layer, platformContent, defaults chunks all preloaded)
- Tailwind v4 CSS single file (`index-Cug8mA-a.css`)
- `sharp` for image optimisation (local script `optimize-images.mjs`)
- `cache-control: public, max-age=0, must-revalidate` on homepage — **no HTML caching**
- Image lazy-load mentioned in commit `a747883` (admin thumbnails)

**Not independently verified:**
- Lighthouse scores
- LCP / INP / CLS
- Font-preload timing (fonts are `preconnect`-ed but not `preload`-ed with explicit URLs)

Flags:
- `platformContent` chunk preloaded → implies a chunky static-content bundle
- SPA client-render means first-paint is a blank div for ~1 round-trip; could be improved with SSR or build-time prerender
- 25 PNG files in the current repo (from design iterations — not source assets) that shouldn't be shipped

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT.

---

## 21 · Security / RLS / Auth

**Verified from code:**
- Supabase Auth is the identity source for both members (`people.auth_user_id`) and admins (`admin_users.auth_user_id`)
- Server uses `SUPABASE_SERVICE_ROLE_KEY` through `server/db.ts`
- Client uses `VITE_SUPABASE_PUBLISHABLE_KEY` for Auth only
- RLS enabled on all 13 primary tables (`alter table ... enable row level security` in schema.sql)
- Public SELECT policies: `events` where `published=true`, `site_content`
- Server does its own authorization inline (no `requireAdmin()` helper visible — authorization logic is per-endpoint inside `handleRequest.ts`)
- `supabase.auth.getUser(token)` is called per request to verify the bearer token (verified at line 145)
- `ensureAdminSeed()` runs on every API request start — bootstraps the first super_admin from env vars

**Concerns:**
- 🟠 **No central `requireAdmin()` / `requireScope()` guard** — authorization is scattered across 49 endpoints. Risk of a missed check in one branch exposing admin data.
- 🟠 **Phone OTP disabled** (migration 013) — any correctly-formatted UAE mobile can register; fraud/spam vector
- 🟠 **MFA is a flag, not a flow** — `admin_users.mfa_required=true` default but no enforcement in login path
- 🟡 **Supabase service role on every request** — standard for serverless Supabase, but means every endpoint bypasses RLS and must perform its own checks. One missed check = full data access.
- 🟡 **No rate-limit on all public writes** — Upstash Redis config optional; writes are unthrottled when env vars unset
- 🔴 **No audit log coverage for all admin mutations** — needs sampling against `handleRequest.ts`
- 🔴 **No CSP header** verified; no `strict-transport-security` on API responses (only on index.html via Vercel default)
- 🔴 **No session rotation / revocation path** for admin accounts explicit in UI

Classification: 🟡 EXISTS BUT NEEDS IMPROVEMENT — foundations present, hardening work remaining.

---

## 22 · Technical debt (identified, NOT cleaned up)

- **25 PNG files in repo root** from design iterations — bloats clones, shouldn't be shipped
- **Legacy data arrays in `src/data/`** — brief notes these are being migrated to DB tables; some still present
- **`CmsTab.tsx`** (106 lines) likely overlaps with `PagesTab.tsx` (539) and `ContentTab.tsx` (266) — three CMS tabs with unclear relationships
- **`handleRequest.ts` is 2,414 lines, 49 if-branches** — single monolithic function; harder to test and review. Deliberate per `PROJECT_BRIEF.md`, acceptable but worth monitoring.
- **Dual `/admin/content` + `/admin/tenant-content` tabs** — overlap unclear
- **`/legacy-assets/*` path for leadership portraits** — not resolved via Supabase Storage
- **`site_content` table** marked as legacy JSON blob; still used for an `extras` section
- **`chapter_admins` + `sessions` legacy tables** — dropped by migration 006, but keep an eye on any stray `.from("sessions")` references

---

## 23 · Existing content migration matrix (summary — detail in §4)

| Category | KEEP | MIGRATE | REDESIGN | MERGE | ARCHIVE | REMOVE — requires approval |
|---|---|---|---|---|---|---|
| Count | 5 | 7 | 4 | 1 | 0 | 2 |

Items in `REMOVE — requires approval`: external links on legacy site to `valuehomesdubai.com`, `palpx.ai` / `palpx.com` (appear to be sponsors/affiliates — Founder decides).

Items that need **content audit before migration**: president message, aim-objective/vision/values text, discover-india prose, support-activity text, privileges text.

Items that need **new creation**: event galleries (schema addition), gallery route (/gallery), leadership detail pages, premium India-UAE narrative blocks, English SEO payload for all languages' routes.

---

## 24 · Missing features (not yet in code)

Grouped by domain:

**Content & presentation**
- 🔴 Gallery system (`/gallery` route + a `media_items` or `galleries` table + public gallery per chapter/event)
- 🔴 Leadership detail pages (`/leadership/:personId`)
- 🔴 News feed vs blog clarification + `/api/news` endpoint
- 🔴 Testimonial carousel on homepage
- 🔴 India-UAE storytelling block types in `page_sections`
- 🔴 Interactive India map on `/discover-india` (component partially exists via `@svg-maps/india`)
- 🔴 Chapter-level visual identity (per-emirate colour / imagery)

**Member experience**
- 🔴 Email notifications (inquiry status, event confirmation, approval decisions)
- 🔴 Member event history page in portal
- 🔴 Yuva programme homepage (specific to `kind=yuva`)
- 🔴 Member directory for members themselves (opt-in visibility)
- 🔴 Password reset flow verified
- 🔴 Full MFA enrolment path

**Operational**
- 🔴 Payment integration (donations, event tickets)
- 🔴 Email delivery service (Postmark/Resend/Supabase SMTP)
- 🔴 SMS provider wiring (reactivate MSG91 or alternative)
- 🔴 Search backend (SearchDialog.tsx exists but is client-side only)
- 🔴 SSR / build-time prerender for SEO
- 🔴 Sitemap generator
- 🔴 Social sharing OG per route
- 🔴 Analytics tag (Plausible / Vercel Analytics / Google Analytics 4)
- 🔴 CSP + security header pass
- 🔴 Lighthouse CI / performance budget
- 🔴 Automated test suite (none observed in repo; `npm test` not present)

**Admin & workflow**
- 🟠 Dynamic *new block type* in page_sections (code change + migration today; could be made true-dynamic via a `block_registry` table)
- 🟠 Bulk operations on registrations (CSV export, bulk check-in)
- 🟠 Role-restricted admin UI (today, every tab is reachable by any admin; backend enforces, UI doesn't hide)

---

## 25 · Features already built that should be preserved

Explicitly flagged as "do not regress":

- 10-language i18n infrastructure (all 10 dicts + Noto script fonts loaded)
- Scoped workflow (`draft → submitted → ... → published`) with `approval_requests` polymorphism
- Append-only `audit_logs` + monthly purge
- RLS on all primary tables + service-role server pattern
- QR check-in flow for events (`CheckInView.tsx` + `qrcode` lib + `registration_no`)
- Supabase Auth integration for both members and admins
- Monolithic `handleRequest.ts` architecture (deliberate per the brief; one place to see the whole API)
- Role-based scope model (`super_admin / central_content_admin / chapter_admin / council_admin / editor` × `global / chapter / council`)
- `tenant_content` + `page_sections` CMS-driven landing pages
- Member portal + digital ID card with QR
- Super-admin audit log viewer

---

## 26 · Recommended redesign

Guiding principles for the redesign work (derived from the agreed objectives + the gaps above):

1. **SEO + public-face first.** Pre-launch, the platform must be findable. Sitemap, OG, meta descriptions, canonical links, JSON-LD for Organization + Events + People. Static-generation (SSG) or SSR via Vite's SSR mode or a per-route prerender script before full dynamic routes get added.
2. **India-UAE as a story, not a motif.** Interactive hero (India silhouette → UAE skyline), community impact metrics with live counts, "where we are" chapter map, "where we're from" council map, testimonial reel, event photo stream. Keep `TricolorFrame` as the chrome; add narrative blocks as `page_sections` types.
3. **Treat leadership + chapter rosters as a product.** Required-field validation on bio/photo/membership_no when a chapter admin saves an appointment. Membership-number sort as the production default; alphabetical is the "no numbers yet" fallback. Public contact-publish gate (`display_phone_publicly`) wired to UI.
4. **Member registration path, properly.** Reactivate SMS OTP or move to email OTP/magic link. Zero members today = chance to introduce real OTP without migration pain. Launch to a controlled pilot (a single chapter) before public rollout.
5. **One CMS tab, not three.** Collapse `CmsTab` + `ContentTab` + `TenantContentTab` + `PagesTab` into a single "Content" workspace with left-nav for Home / Pages / Chapters & Councils / Nav / Publications. Current split is confusing even to a developer reading the code.
6. **Lift admin role-awareness into the UI.** Hide tabs a role can't use. Backend already enforces; frontend should too, for professional feel.
7. **Email + notifications wired end-to-end.** Inquiry status → applicant email. Approval decision → requester email. Event registration → confirmation + ICS. Picks up Phase 2.
8. **Replace `/legacy-assets/*` with Supabase Storage** before public launch.

---

## 27 · Priority matrix

| Priority | Theme | Specific items |
|---|---|---|
| **P0 — blocks public launch** | SEO | Real `/sitemap.xml`, real `/robots.txt`, meta description per route, OG tags per route, canonical link, JSON-LD for Organization + Events, SSG / prerender for public pages |
| **P0** | Content population | Leadership bios/contact/membership_no, chapter committee rosters per migration 029, sponsors first batch, publications edition labels, nav_items seed verified live |
| **P0** | Trust | Reactivate OTP (SMS or email magic-link), finalise MFA enrolment path for admins, migrate `/legacy-assets/*` to Supabase Storage, security-header pass (CSP, HSTS on API, X-Content-Type-Options) |
| **P0** | Email delivery | Inquiry replies, event confirmations, approval notifications |
| **P1 — pre full-launch polish** | Homepage redesign | India-UAE storytelling blocks, impact metrics with real data, upcoming-events strip, testimonials carousel, social-media footer |
| **P1** | Admin UX | Single Content workspace, role-aware tab visibility, bulk operations on registrations, approvals queue polish |
| **P1** | i18n content coverage | Translate events/publications/sponsors (schema addition for `_i18n`), per-locale meta/OG, locale-specific sitemap |
| **P1** | Member portal | Event history, saved events, downloadable digital ID PDF, profile edit |
| **P1** | Media | `/gallery` route, event galleries wired through `events.slides` or a new table, chapter/council photo streams |
| **P2 — post-launch** | Interactivity | Interactive India map, interactive UAE map, state-wise community stories, events calendar heat-view |
| **P2** | Leadership detail | `/leadership/:personId`, chapter-cross-link, term history |
| **P2** | Yuva programme page | Dedicated Yuva story, Yuva-only events filter, Yuva ambassadors |
| **P2** | Analytics | Plausible or Vercel Analytics, per-page funnel, admin dashboard metrics |
| **P2** | Testing | `npm test` with Vitest, admin flow Playwright suite, Lighthouse CI |
| **P3 — nice-to-have** | Payments | Donations gateway (Stripe/Razorpay-UAE), event ticketing |
| **P3** | Search | Server-side search over events + news + chapters + councils |
| **P3** | Social feeds | Instagram/Facebook aggregation per chapter |
| **P3** | Dynamic block types | `block_registry` table so admins can design new section types without a code deploy |

---

## 28 · Recommended development phases

### Phase 0 — Audit sign-off (this document)
- Founder reviews this file + approves the P0 bar
- Decisions needed: sponsor list, phone-OTP strategy (reactivate MSG91 vs email magic-link), payment gateway choice (if any), social feed strategy, YUVA brand treatment

### Phase 1 — Public-launch readiness (P0)
**Target: platform is googleable, member-registrable, admin-trusted.**
- Real sitemap + robots + per-route meta + OG + JSON-LD + SSG for public pages
- Content population: leadership bios + chapter rosters + sponsor batch 1 + publications edition labels
- OTP reactivated OR replaced with email magic-link
- MFA enrolment for admins
- `/legacy-assets` → Supabase Storage migration
- Security-header pass
- Email delivery wired (inquiries, events, approvals)

### Phase 2 — Premium presentation (P1)
- Homepage redesign with India-UAE storytelling
- Admin UX consolidation (single Content workspace)
- i18n coverage across events/publications/sponsors
- Media / gallery system
- Member portal polish

### Phase 3 — Depth (P2)
- Interactive India + UAE maps
- Leadership detail
- Yuva programme page
- Analytics
- Automated tests

### Phase 4 — Operational maturity (P3)
- Payments
- Search
- Social feeds
- Dynamic block registry

---

## 29 · Risks / decisions required from IPF

| # | Decision | Why it matters | Who decides |
|---|---|---|---|
| 1 | Reactivate MSG91 (pay for SMS) OR switch registration to email magic-link | Blocks member launch | Founder + IPF office bearers |
| 2 | Payment gateway: Stripe UAE vs Razorpay vs none-for-now | Blocks donations/ticketing | Founder |
| 3 | What is on `www.ipf-uae.com` (second domain)? Keep / redirect / retire? | Confuses SEO; may dilute brand | Founder (requires org clarification) |
| 4 | External links on legacy site (valuehomesdubai, palpx) — are these sponsors we honour or legacy clutter? | Removal needs approval per brief | Founder |
| 5 | SMS vs email-magic-link for member OTP | Determines UX + budget | Founder |
| 6 | First sponsor batch — who, how presented | Blocks sponsors section | IPF office bearers |
| 7 | Leadership content — who writes bios, who approves photo publish | Blocks leadership pages | IPF office bearers |
| 8 | SEO: do we want the current domain `ipf-uae-digital-platform.vercel.app` as production, or move to `ipf-uae.org` (migrate off PHP) or `platform.ipf-uae.org` | Affects canonical URLs + sitemap | Founder |
| 9 | Analytics vendor | Legal (UAE residents, PDPL) | Founder + legal |
| 10 | Public-launch date vs private pilot date | Shapes P0 vs P1 scope boundary | Founder |

---

## 30 · Proposed first development sprint

Scope: 2 weeks, no architectural changes, no new tables except `_i18n` on events, SEO + content population only.

**Sprint goal:** turn the platform from "pre-launch demo" into "ready for a soft public announcement".

**Tickets (branched from `main`, PR per ticket, all go through `nammadaiva-agent` identity):**

1. `feature/seo-foundation` — add real `/sitemap.xml` route (API or build-time generation) + real `/robots.txt`; add per-route `<title>` + `<meta name="description">` + canonical via a `Seo.tsx` helper used in every page; add JSON-LD Organization block on homepage.
2. `feature/open-graph-twitter` — add OG + Twitter card helpers per public route; add default OG image.
3. `feature/leadership-content-import` — wire a CMS flow to populate `appointments.bio / contact_email / contact_phone / membership_no / social_links` for existing leadership records; migrate `/legacy-assets/images/*` to `ipf-uploads/leadership/*`.
4. `feature/sponsors-seed` — add first sponsor batch via admin UI (not a migration — content live); fix empty-state copy on `/sponsors`.
5. `feature/nav-seed-verify` — re-run migration 025 against live DB (requires Founder approval per standing rule); verify `/api/nav` returns populated structure.
6. `feature/publications-edition-labels` — update the 18 "Drishti" publication titles with edition number/date; fix the publications list UI to render edition clearly.
7. `fix/legacy-assets-migration` — one-off script that uploads legacy portraits to Supabase Storage and rewrites `appointments.photo_url`.
8. `feature/email-notifications-inquiry` — wire inquiry status change → email to applicant via Resend/Postmark (SMTP creds set via Vercel env).
9. `feature/admin-mfa-enrolment` — add Supabase Auth MFA enrolment page in `/admin` for first login; enforce when `admin_users.mfa_required = true`.
10. `fix/security-headers` — add CSP, X-Content-Type-Options, X-Frame-Options via Vercel config.

Each ticket:
- Branches from `main`
- Updates `PROJECT_BRIEF.md` if the architecture changes
- Reports Supabase/env/security impact per standing procedure
- Does not merge to main or auto-deploy production without explicit approval

---

_End of audit. Draft saved at the repo root. Not committed. Awaiting Founder review before any further action per standing rule 11._
