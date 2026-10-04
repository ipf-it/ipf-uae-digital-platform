# IPF UAE Digital Platform — Project Brief

_For priming an outside LLM (ChatGPT or similar) with enough context to help write code, draft content, or review changes without seeing the repo. Factual snapshot of the codebase as of 2026-10-04. Everything below is derived directly from the repository at `github.com/ipf-it/ipf-uae-digital-platform`._

---

## 1 · What this is

**Indian People's Forum UAE (IPF UAE) — official community website and member platform** for the Indian diaspora in the United Arab Emirates. It serves three audiences from one codebase:

- **Public visitors** — browse chapters, councils, events, publications, news, blog, sponsors, discover-India / explore-UAE content, support information, membership details, and donate.
- **Members and Yuva (youth wing)** — register (free), hold a membership number, carry a digital ID card (QR), see events scoped to their chapter/council, RSVP, volunteer, submit inquiries, access a member portal.
- **Admins (5 roles)** — operate the whole platform through a tabbed admin workspace: event lifecycle, registrations/check-in, approvals, sponsors, chapter/council committee rosters, CMS for every page, navigation editor, publications, support inboxes.

The platform's organising principle is the **chapter × council model**: a chapter is UAE-emirate-scoped (where the member lives), a council is Indian-home-state-scoped (where they're from). Every member belongs to both; events and content can be scoped to global / a specific chapter / a specific council. Everything scoped goes through a draft → submit → central-review → publish workflow.

---

## 2 · Technology stack

| Layer | Choice |
|---|---|
| Frontend | **React 19 + TypeScript + Vite 8** (single-page app, client-rendered, HMR via Vite) |
| Router | **react-router-dom v7** (`BrowserRouter`, lazy-loaded routes) |
| UI primitives | **Radix UI** (accordion, checkbox, dialog, dropdown-menu, label, select, slot, toast) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` plugin |
| Animations | **motion** (Framer-Motion successor) |
| Icons | **lucide-react** |
| Maps | **@svg-maps/india** (India state map for chapter/council selection) |
| QR codes | **qrcode** (member digital ID cards) |
| Image optimisation | **sharp** (local script `optimize-images.mjs`) |
| Backend (serverless) | **Vercel Functions** — a single `/api/handler` endpoint that routes everything |
| Database | **Supabase PostgreSQL** |
| Auth | **Supabase Auth** (email + password; migrated from legacy custom cookies in migration 006) |
| File storage | **Supabase Storage**, public bucket named `ipf-uploads` |
| Rate limiting | **@upstash/ratelimit + @upstash/redis** (public-write endpoints throttled when configured) |
| SMS OTP | **MSG91** integration present but **temporarily disabled** via migration 013 (no SMS provider funded yet) |
| Cron | **Vercel Cron** — one monthly job: `/api/cron/purge-audit-logs` on `0 3 1 * *` |
| Linting | **Oxlint** (not ESLint) |
| Deploy | **Vercel** |

**Key architectural note:** The backend is **not** split into many route files. A single file `server/handleRequest.ts` (2,414 lines) owns every API endpoint; `api/handler.ts` is a thin Vercel adapter that forwards to it. The pattern is intentional — one place to see the whole surface.

---

## 3 · Repository layout

```
ipf-uae-digital-platform/
├── index.html                     ← Vite entry; preloads Noto Sans for 10 Indian scripts
├── vite.config.ts                 ← Vite + React + Tailwind + CMS plugin
├── vercel.json                    ← SPA rewrites + cron
├── package.json                   ← Scripts: dev, build, lint, seed:admins, i18n:build, optimize:images
├── .env.example                   ← Supabase + Upstash + MSG91 + CRON_SECRET + IPF_ADMIN seed
│
├── api/
│   └── handler.ts                 ← Vercel Function adapter → server/handleRequest.ts
│
├── server/
│   ├── schema.sql                 ← Base Postgres schema (the "run first" file)
│   ├── migrations/                ← 31 numbered forward-only migrations (002…031)
│   ├── handleRequest.ts           ← MONOLITHIC request router (2,414 lines)
│   ├── db.ts                      ← Supabase service-role client factory
│   ├── crypto.ts                  ← bcrypt-ish helpers
│   ├── http.ts                    ← Cookie + response helpers
│   ├── nodeAdapter.ts             ← Local dev adapter
│   ├── rateLimit.ts               ← Upstash wrapper
│   ├── sms.ts                     ← MSG91 wrapper
│   └── translate.ts               ← Translation helper for i18n content
│
├── src/
│   ├── main.tsx                   ← React root
│   ├── App.tsx                    ← Routes (37 public + 9 admin routes)
│   ├── pages/                     ← One file per public page
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminProvider.tsx      ← Admin auth + role context
│   │   ├── EditorList.tsx
│   │   ├── tabs/                  ← Dashboard, Operations, Organisation, Pages, Publications,
│   │   │                            Navigation, CMS, Support, People, Content, TenantContent
│   │   └── operations/            ← Events, Registrations, Sponsors, Approvals, Activities,
│   │                                CheckIn, AuditLog
│   ├── cms/                       ← Draft-ephemera + rendering helpers for page_sections
│   ├── components/
│   │   ├── layout/                ← SiteLayout, Header, Footer, PageLoader
│   │   ├── forms/
│   │   ├── ui/                    ← Toast + Radix wrappers (shadcn-style)
│   │   └── <feature components>   ← CommitteeHierarchy, DigitalIdCard, EventCard, QrCode, etc.
│   ├── data/                      ← Static fallback / legacy data (most now moved to DB via migrations)
│   ├── hooks/
│   ├── i18n/
│   │   └── dict/                  ← en, bn, gu, hi, kn, ml, mr, pa, ta, te — 10 languages
│   └── lib/
│
├── cms/                           ← Vite plugin for live CMS reload
├── data/                          ← Legacy content files (being migrated to DB)
├── design-assets/
├── design-review/                 ← Logo system reference
├── public/                        ← Static assets
└── scripts/
    ├── seed-admins.mjs            ← One-off: seed the first super-admin
    ├── optimize-images.mjs
    ├── split-messages.mjs         ← i18n build step
    ├── generate-logo-review.mjs
    ├── export-logo-hd.mjs
    └── package-logo-suite.mjs
```

---

## 4 · Data model (current state after all 31 migrations)

Everything lives in the `public.*` schema except Supabase Auth tables under `auth.*`.

### Identity

| Table | Purpose |
|---|---|
| `people` | Members and Yuva. Links to `auth.users(id)`. Carries `kind` ∈ {member, yuva}, `membership_no`, `name`, `email`, `phone`, `emirate` (UAE), `chapter`, `home_state` (India), `is_volunteer` flag. |
| `admin_users` | Admin accounts. Links to `auth.users(id)`. Carries `role` ∈ {super_admin, central_content_admin, chapter_admin, council_admin, editor}, `scope_type` ∈ {global, chapter, council}, `scope_id`, `mfa_required`. |
| `verified_phones` | Phone numbers that have passed OTP (window: `expires_at`). |
| `phone_otp_codes` | OTP delivery store: phone → code_hash + attempts + consumed_at. |

### Organisation

| Table | Purpose |
|---|---|
| `chapters` + `chapters_i18n` | UAE emirate-level chapters (admin-manageable, previously hardcoded). |
| `councils` + `councils_i18n` | Indian home-state-level councils. |
| `positions` + `positions_i18n` | Committee role vocabulary (Convenor, Co-Convenor, General Secretary, Joint Secretary, Treasurer, Executive Committee Member …). Scoped per central / chapter / council. |
| `appointments` | A person holding a position in a committee (central / chapter / council). Workflow-gated — chapter/council admin edits need central approval before going live (migration 027). |

### Events, activities, volunteering

| Table | Purpose |
|---|---|
| `events` | Public events. `scope_type` ∈ {global, chapter, council}, `scope_id`, `workflow_status` ∈ {draft, submitted, changes_requested, rejected, approved, published}, optional `starts_at`/`ends_at`, `category`, `emirate`, `is_free`, `featured` flag for homepage curation (migration 031). |
| `event_registrations` | Public RSVPs. `participation_as` ∈ {member, volunteer}, `status` ∈ {registered, cancelled, attended}. Carries a unique `registration_no`. |
| `event_volunteers` | Volunteers accepted onto a specific event. `status` ∈ {assigned, confirmed, attended}. |
| `event_sponsors` | Per-event sponsor linkage (also global sponsors in `sponsors`). |
| `activities` | Admin-managed activity directory. |
| `volunteer_hours` | Logged volunteering per person (`activity_date`, `hours`, `activity`). |

### Content (CMS)

| Table | Purpose |
|---|---|
| `pages` | Fixed list of known pages (`about`, `history`, `governance`, `membership`, `yuva`, `privileges`, `testimonials`, `discover-india`, `explore-uae`, `support`, …). |
| `page_sections` + `page_sections_i18n` | Generic ordered content blocks per page. Types include `carousel`, `richText`, `photoGrid`, `cta`. Schedulable (`starts_at`/`ends_at`, migration 023). Replaces every hardcoded page body (migration 016–018). |
| `tenant_content` | Per-chapter and per-council editable landing-page content, same draft → approve → publish workflow. Includes editable hero tagline (migration 015). |
| `home_content` + `home_content_i18n` | Single-row admin-editable homepage hero (badge, title, intro, key sections). Replaces hardcoded home strings (migration 026). |
| `nav_items` + `nav_items_i18n` | Site navigation hierarchy (primary nav + footer groups + mobile tabs + utility links). Flat table with `parent_id`. Previously hardcoded `src/data/navigation.ts` (migration 024–025). |
| `site_content` | Legacy JSON blob store, kept for backwards compatibility — only `extras` section still read from here. |
| `terms` | T&Cs / policy pages. |
| `publications` | Drishti e-Magazine issues. `file_url` holds either an external reader link (fliphtml5/issuu) or an uploaded PDF path in `ipf-uploads` (migration 022). |

### Interactions

| Table | Purpose |
|---|---|
| `inquiries` | Contact / support / membership / jobs submissions. `intent` tags the entry point. `status` tracks admin triage (migration 009). `person_id` links to the submitting member when they were signed in (migration 012). |
| `donations` | Donation pledges (no payment integration yet — status defaults to `pledge`). |
| `sponsors` | Organisation-level sponsors (migration 019). |

### Workflow + audit

| Table | Purpose |
|---|---|
| `approval_requests` | Generic polymorphic workflow queue. `entity_type` + `entity_id` identifies the thing (event, tenant_content, appointment, page_section …). `status` ∈ {draft, submitted, under_review, changes_requested, rejected, approved, scheduled, published}. Unique on (entity_type, entity_id). |
| `audit_logs` | Append-only log. `actor_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `request_id`. Monthly cron purge at `/api/cron/purge-audit-logs`. |

### DB functions

- `event_participation_counts(event_ids text[])` → returns per-event member_count + volunteer_count. Used by the public events page to render RSVP counters without an N+1.

### Row Level Security

RLS is **enabled on every table**. Only two public SELECT policies defined in `schema.sql`:
- `events` with `published = true` → public read
- `site_content` → public read

Everything else is **service-role-only** — the Vercel Function uses `SUPABASE_SERVICE_ROLE_KEY` and performs its own authorisation in `handleRequest.ts`. The React client uses the publishable (anon) key purely for Supabase Auth; all data reads route through `/api/*`.

---

## 5 · Admin roles and scope model

Five roles with a two-dimensional scope (role × scope_type/scope_id):

| Role | Default scope | Can do |
|---|---|---|
| `super_admin` | global | Everything — users, events across all scopes, publications, nav, sponsors, approvals as reviewer, audit log, system settings |
| `central_content_admin` | global | Content across all pages, home, nav, publications; can review scoped submissions |
| `chapter_admin` | chapter | Edit their chapter's tenant content, create chapter-scoped events + committee appointments (all go through central approval) |
| `council_admin` | council | Same as chapter_admin but for a council |
| `editor` | global | Draft content; cannot publish |

The scoping is enforced server-side in `handleRequest.ts`. Every scoped mutation emits an `approval_request` row; a reviewer with central scope flips it to `published` (or returns `changes_requested`), at which point the live table shows the change.

---

## 6 · Public pages (routes defined in `src/App.tsx`)

```
Public (37 routes):
  /                      HomePage
  /about                 AboutPage
  /leadership            LeadershipPage
  /governance            GovernancePage
  /history               HistoryPage
  /chapters              ChaptersPage              (list of UAE chapters)
  /chapters/:chapterId   ChapterPage               (per-chapter landing)
  /councils              CouncilsPage              (list of state councils)
  /councils/:councilId   CouncilPage               (per-council landing)
  /discover-india        DiscoverIndiaPage         (map + content for India)
  /explore-uae           ExploreUaePage            (content for UAE)
  /drishti               DrishtiPage               (e-magazine index)
  /events                EventsPage
  /events/:eventId       EventDetailPage
  /activities            ActivitiesPage
  /sponsors              SponsorsPage
  /publications → part of /drishti
  /resources             ResourcesPage
  /blog                  BlogPage, ArticlePage
  /news                  NewsPage, ArticlePage
  /testimonials          TestimonialsPage
  /membership            MembershipPage
  /privileges            PrivilegesPage            (member benefits)
  /yuva                  YuvaPage                  (youth wing)
  /jobs                  JobsPage
  /support               SupportPage               (grievance + counselling)
  /contact               ContactPage
  /donate                DonatePage
  /register              RegisterPage              (member + Yuva signup)
  /sign-in               SignInPage
  /portal                PortalPage                (member dashboard, auth-gated)
  /portal/card           PortalCardPage            (digital ID card with QR)
  *                      NotFoundPage

Admin (9 tabs):
  /admin                 DashboardTab
  /admin/operations      OperationsTab             → Events / Registrations / Sponsors /
                                                      Approvals / Activities / CheckIn / AuditLog
  /admin/organisation    OrganisationTab           (chapters/councils, positions, appointments)
  /admin/pages           PagesTab                  (page_sections editor)
  /admin/publications    PublicationsTab           (Drishti editions)
  /admin/navigation      NavigationTab             (nav_items editor)
  /admin/cms             CmsTab
  /admin/support         SupportTab                (inquiries triage)
  /admin/people          PeopleTab                 (member + Yuva directory)
```

Lazy-loaded via `React.lazy` + `Suspense`. Admin requires an authenticated admin user; member portal requires a signed-in person.

---

## 7 · Multilingual support

**10 languages**, all Indian scripts loaded via Noto Sans in `index.html`:

| Code | Language |
|---|---|
| `en` | English (base) |
| `bn` | Bengali |
| `gu` | Gujarati |
| `hi` | Hindi |
| `kn` | Kannada |
| `ml` | Malayalam |
| `mr` | Marathi |
| `pa` | Punjabi (Gurmukhi) |
| `ta` | Tamil |
| `te` | Telugu |

Dictionaries live at `src/i18n/dict/<lang>.json`. Build step `pnpm i18n:build` (= `scripts/split-messages.mjs`) manages them. **Arabic was explicitly dropped** in commit `4c41a1f`.

Every content table that's user-facing has a parallel `_i18n` table (`chapters_i18n`, `councils_i18n`, `positions_i18n`, `page_sections_i18n`, `home_content_i18n`, `nav_items_i18n`) with (`parent_id`, `lang`) + translated columns. English is treated as the canonical source; translations fall back to English when missing.

---

## 8 · Branding

- **Legal name:** Indian People's Forum UAE
- **Theme colour:** `#0b1f3a` (navy / Indian flag base-tone)
- **Typefaces:** Noto Sans for all scripts + Playfair Display for display serifs
- **Design assets:** logo system under `design-review/ipf-logo-system/`
- **Watercolour tricolor flag motif** used across the public site (see `TricolorWaves.tsx`)
- **India-UAE flags image** on homepage hero (recently recropped — commit `ffdf16c`)

---

## 9 · Integrations and external services

| Service | Purpose | Configured by |
|---|---|---|
| **Supabase** | Auth + Postgres + Storage (`ipf-uploads` public bucket) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Upstash Redis** | Rate limiting on public-write endpoints (registration, inquiries, donations). **Unthrottled when unset.** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **MSG91** | Phone OTP SMS for member registration. **Currently disabled** (migration 013) because no SMS provider is funded; registration accepts correctly-formatted UAE mobile numbers without SMS verification. Falls back to logging the OTP to the server console in dev. | `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_OTP_TEMPLATE_ID` |
| **Vercel Cron** | Monthly audit-log purge at `0 3 1 * *` (3 AM UTC on the 1st) | `CRON_SECRET` |
| **IPF super-admin bootstrap** | First API request creates/links the Supabase Auth user named here as the initial super-admin | `IPF_ADMIN_EMAIL`, `IPF_ADMIN_PASSWORD` (12+ chars), `IPF_ADMIN_SEED_PASSWORD_PREFIX`, `IPF_ADMIN_SEED_PASSWORD_SUFFIX` |

No payment gateway integrated. Donations are pledges only. No analytics or tracking.

---

## 10 · Build + run

```bash
# One-time setup
cp .env.example .env
# Fill in Supabase + Upstash + MSG91 + CRON_SECRET + IPF_ADMIN

# Install
npm install  # or pnpm

# Dev server
npm run dev

# Build (TypeScript check + Vite build)
npm run build

# Lint (Oxlint, not ESLint)
npm run lint

# Seed the first super admin (reads .env)
npm run seed:admins

# Build i18n dictionaries from source
npm run i18n:build

# Optimise images
npm run optimize:images
```

Default dev URL: `http://localhost:5173` (Vite default).

---

## 11 · What has been built (feature inventory)

Everything below is live in the current `main` branch:

### Public site
- Multi-page content site with the 37 routes listed in §6
- Live homepage with admin-editable hero + featured events (pinned by super-admin)
- Chapter directory + per-chapter landing page with committee roster, tagline, scoped events, page sections
- Council directory + per-council landing page (same shape as chapters)
- Full event system — list + detail + RSVP + volunteer-opt-in + add-to-calendar
- Discover India (interactive India state map via @svg-maps/india)
- Explore UAE content
- Drishti e-Magazine with issue list + reader links
- Blog + News + Articles
- Sponsors page (central + per-event)
- Membership page + registration + Yuva registration (youth wing)
- Member sign-in + portal + digital ID card (QR)
- Contact + Support + Donate forms (land in `inquiries` or `donations`)
- 10-language toggle, mobile-friendly, PWA manifest

### Admin workspace
- Admin login (Supabase Auth, MFA-required flag per account)
- Dashboard with ops metrics
- Operations: events CRUD + registrations + check-in + sponsors + approvals + activities + audit log
- Organisation: chapters/councils + positions + committee appointments
- Pages: page_sections editor for every public page (carousel / richText / photoGrid / cta blocks)
- Publications: Drishti issue management
- Navigation: nav_items hierarchy editor
- Support: inquiry inbox with status tracking (new / in_progress / resolved)
- People: member + Yuva + Yuva directory
- Content + TenantContent: editable homepage + per-chapter/council hero/tagline/sections
- Scoped workflow (draft → submit → central-review → publish) on everything a non-central admin can touch
- Full audit log viewer (super-admin)
- Monthly audit log purge via Vercel Cron

---

## 12 · Known gaps / things not built

- **Phone OTP verification disabled** (migration 013) — SMS provider not funded; relying on client-side format validation.
- **No payment integration** — donations are pledges; no event ticketing.
- **No notifications** — email notifications on inquiry status change / approval decisions are not wired.
- **Legacy static-content fallbacks still present** in `src/data/` and English-only i18n keys for some sections — many pages went through a "stop hardcoding" cutover in migrations 016/017/018/025/026, but the fallback files remain.
- **Arabic was explicitly dropped** — if UAE government or audience requirements change, re-adding it means reseeding every `_i18n` table.
- **No search** — no search backend; `SearchDialog.tsx` component exists but is client-side-only over currently-loaded content.
- **MFA enforcement is a flag, not a flow** — `admin_users.mfa_required = true` is stored but the actual MFA enrolment/challenge isn't visible in `handleRequest.ts`.

---

## 13 · Session history worth knowing

Recent commits (newest first) describe the kind of work that's been going on:

```
5418b12  Fix three concrete chapter/council page performance issues
f014e95  Let a super admin pin specific events to the homepage across every scope
9e33722  Fix the councils dropdown being unreachable below Nagaland
ffdf16c  Crop the India-UAE flags photo to remove its dead right-side margin
a1db849  Group chapter/council committee lists by role instead of one flat column
d6b75c6  Seed real chapter/council committee rosters, fix oversized image placeholders, enhance homepage hero
fe27193  Fix general contact email to match the real address
d4b8f8d  Fix admin sidebar scrolling away with the page on desktop
a747883  Add a super-admin audit log viewer and lazy-load remaining admin thumbnails
4af711a  Modernize public page design, consolidate Events+Gallery, and remove legacy redirect routes
```

Pattern: single-purpose commits, each addressing a specific user-visible issue or admin capability. 31 migrations in the repo tell the longer story — the platform has moved steadily from hardcoded TypeScript arrays into database-managed content with workflow + audit.

---

## 14 · Vocabulary quick-reference (useful when prompting an LLM)

- **Member** — adult IPF member, has a `membership_no` prefix (sequence `ipf_member_number_seq`).
- **Yuva** — youth wing member, has a parallel `membership_no` prefix (sequence `ipf_yuva_number_seq`).
- **Chapter** — a UAE-emirate-level organisational unit (where a member lives).
- **Council** — an Indian-home-state-level organisational unit (where a member is from).
- **Appointment** — a person holding a committee position for a term.
- **Scope** — one of `global`, `chapter`, `council` + a `scope_id`. Governs who can edit what and whose approval is needed.
- **Workflow** — the shared draft → submitted → under_review → changes_requested / rejected / approved → scheduled → published state machine on `approval_requests`.
- **Drishti** — the e-magazine (publications table).
- **Portal** — the signed-in member's dashboard, including the digital ID card.
- **Tenant content** — a chapter's or council's editable landing-page content.
- **Page section** — a reusable content block (carousel / richText / photoGrid / cta) placed on a public page.

---

## 15 · For an LLM reviewing or writing code for this project

**When you work on this code, prefer:**
- Keeping backend changes inside `server/handleRequest.ts` — one file, one surface. Don't scatter new endpoints across new files.
- Adding to `server/migrations/NNN_<slug>.sql` for every schema change; migration files are forward-only, numbered sequentially, idempotent (`if not exists`), and self-describing in their top comment.
- Using Supabase service-role for data access from the server (never from the client). The React side uses only `VITE_SUPABASE_PUBLISHABLE_KEY` and only for Supabase Auth sessions.
- Running everything scoped (chapter/council) through `approval_requests` — do not expose a direct publish path to non-central admins.
- Keeping translations: add every new user-facing string to the English dictionary first; all 10 `_i18n` tables accept null for missing languages and fall back to English.
- Treating `src/data/*` as legacy — new content should live in the database tables listed in §4, not as hardcoded TypeScript arrays.
- Respecting the admin role hierarchy (`super_admin > central_content_admin > chapter_admin / council_admin > editor`) and the scope dimension — no implicit elevation.
- Not introducing payment flow, SMS, notifications, or MFA-enrolment code without checking first; these are known gaps and the Founder decides when they are picked up.
- Keeping the component library consistent with Radix + Tailwind utility classes + the existing `src/components/ui/` wrappers.

**When reasoning about requirements, know:**
- The platform is a working production platform for a real diaspora community — changes affect live members in UAE.
- Content work tends to move from hardcoded files into database-managed CMS tables through numbered migrations (see 016/017/018/025/026 for the pattern).
- Every scoped mutation is auditable (`audit_logs`) and reversible (append-only history).
- The Vercel-Cron audit purge runs monthly, so audit retention is roughly 1 month unless the cron changes.

---

_End of brief. Repo: `github.com/ipf-it/ipf-uae-digital-platform`, branch `main`._
