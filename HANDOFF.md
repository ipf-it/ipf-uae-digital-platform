# IPF UAE Digital Platform — Project Handoff

**Date of handoff:** 5 October 2026

| | |
|---|---|
| **Organisation** | Indian People's Forum UAE (IPF UAE) |
| **Production URL** | https://ipf-uae-digital-platform.vercel.app/ |
| **Repository** | https://github.com/ipf-it/ipf-uae-digital-platform |
| **Stack** | React 19.2 · react-router-dom 7.18 · Vite 8.2 · TypeScript ~6.0 · Tailwind CSS 4.3 |
| **Deployment** | GitHub → Vercel production (push to `main` auto-deploys) |
| **main SHA at handoff** | `b59f170d0e02b77d3cd9c50d655f381eae5dc0a0` |
| **Latest production deployment** | SHA `b59f170…` · Vercel deployment `6846284403` · state `success` |
| **Build command** | `npm run build` (`tsc -b && vite build`) |
| **Lint command** | `npm run lint` (`oxlint`) · baseline 8 warnings (all `react(only-export-components)` from `LocaleProvider` / `Toast` / `PageTheme` / `MemberProvider` / `AdminProvider` / `ContentProvider`) — zero new, zero errors |
| **Tests** | No automated test suite is wired up in `package.json` scripts at the time of handoff. Validation is manual: live production CDP captures at eight responsive widths after every deploy. |
| **Working tree at handoff** | Clean. |

---

## Founder-Approved Design Direction

The homepage is being deliberately redesigned as a **premium, institutional, India–UAE heritage-inspired, editorial community platform**.

Visual language:

- Warm ivory canvas (`#FFF8EE`)
- IPF burgundy (`#5A0F1E`) · deeper legal-strip burgundy (`#3A0913`)
- Heritage gold (`#8B6A1F` text eyebrow · `#D6AD60` ring/accent · `#FF9933` saffron accent)
- Restrained saffron/green tricolour used only in approved specific places
- Premium serif typography for headings; sans body
- Subtle Indian / India–UAE architectural artwork as background stationery
- Large authentic IPF photography as the dominant content
- Restrained decorative treatment — no clutter

**Core principle — backgrounds are SUPPORTING artwork.**
They must never dominate headings, body text, photographs, event cards or gallery images. Approved backgrounds should read like premium stationery / heritage illustration.

---

## CRITICAL — Animation Policy

**The founder does NOT want legacy decorative animations.**

Disallowed:

- Rotating mandalas / chakras / ornaments
- Floating decorative shapes
- Pulsing decorations
- Animated radial patterns
- Parallax decoration
- Moving background artwork
- Scroll-reveal decoration
- Decorative particles
- Any other unnecessary motion

Do NOT introduce or restore these.

### Approved functional motion ONLY

1. Hero background video (WebM, loop, muted, autoplay)
2. Announcement ticker (`.ipf-ticker-track`, 42 s linear infinite — respects `prefers-reduced-motion`)
3. Events carousel (slow continuous horizontal loop — approved by founder for this redesign)
4. Gallery carousel (9 s crossfade — approved by founder for this redesign)
5. Normal interaction / hover / menu / focus-ring transitions

These are explicitly approved and must survive any future "animation cleanup" sweep.

### Pending issue — legacy rotating decorative animation STILL VISIBLE

The founder has reported that a rotating legacy decorative animation is still visible around **President's Message** and **Who We Are**. The responsible implementation has been identified and documented but has NOT yet been removed.

**Root cause (verified in code 2026-10-05):** `src/index.css` lines **438–441** define a global pseudo-element rule:

```
.home-theme-page { position:relative; background:var(--ipf-ivory); }
.home-theme-page > section { overflow:hidden; }
.home-theme-page > section::before {
  content:"";
  position:absolute; width:22rem; aspect-ratio:1;
  right:-13rem; top:10%; opacity:.14;
  background:repeating-conic-gradient(from 20deg, var(--ipf-saffron) ...);
  animation: ipf-theme-spin 38s linear infinite;
  mask-image: radial-gradient(...);
}
.home-theme-page > section:nth-of-type(even)::before { ...reverse direction... green ... }
```

The CSS targets every **direct** `<section>` child of `.home-theme-page`. In `src/pages/HomePage.tsx` the following components render as unwrapped direct `<section>` children and therefore STILL have the rotating saffron/green mandala pseudo-element behind them:

- `<HomePresidentMessage />`
- `<HomeWhoWeAre />`
- `<HomeGallery />`  *(founder report mentioned the first two; Gallery is also affected by the same CSS and should be fixed in the same pass)*

`<HomeEvents />`, `<HomeGetInvolved />`, and the hero/identity/stats composition are already wrapped in a `<div>` which prevents the selector from matching — this is the established project pattern.

**Permanent fix (next session, do NOT short-cut):**

- **Preferred:** delete the `.home-theme-page > section::before` + `:nth-of-type(even)::before` CSS rules entirely and remove the `ipf-theme-spin` keyframe if no other component depends on it (verify first). This removes the legacy decoration from the whole homepage design in one move.
- **Acceptable alternative:** wrap `<HomePresidentMessage />`, `<HomeWhoWeAre />` and `<HomeGallery />` in `<div>…</div>` inside `HomePage.tsx` the same way `<HomeEvents />` is wrapped. This keeps the pseudo-element rule for any theoretical future use but neutralises it on this page.

Do NOT merely:

- Hide it, set opacity to 0, pause it, slow it, or rely only on `prefers-reduced-motion`.

Verify on LIVE production after the fix at 1440 and 390.

---

## Current Homepage Order

Verified from `src/pages/HomePage.tsx` at main SHA `b59f170`:

| # | Section | Component | Notes |
|---|---|---|---|
| 1 | Mobile hero (<lg) | `<HomeHeroVideo />` + `<VandeMataramToggle />` inside `<section class="ipf-home-hero">` wrapped by `<div class="lg:hidden">` | Full-viewport mobile hero |
| 2 | Desktop hero (≥lg) | Same inside `<div class="hidden lg:block">` | Full-viewport desktop hero |
| 3 | Identity + Stats block | `<HomeIdentityStrip />` + `<div id="community-stats"><CommunityStats /></div>` inside a shared `<div>` | Deliberately ONE continuous hero block |
| 4 | Mobile photo band (<lg only) | `<section id="home-photos">` with `<ImageCarousel slides={content.heroSlides}>` | Mobile only |
| 5 | Home-extras CMS slot | `<PageSectionRenderer pageId="home-extras" startTone="ivory" />` | CMS-driven dynamic sections (currently empty by default) |
| 6 | President's Message | `<HomePresidentMessage />` | Direct `<section>` child — see animation pending issue above |
| 7 | Who We Are | `<HomeWhoWeAre />` | Direct `<section>` child — see animation pending issue above. Replaces the deleted homepage Leaders block. |
| 8 | Events | `<div><HomeEvents /></div>` (wrapped) | Six-card seamless carousel; mandala wrapper neutralised |
| 9 | Gallery | `<HomeGallery />` | Direct `<section>` child — see animation pending issue above |
| 10 | Get Involved + Follow Us | `<div><HomeGetInvolved /></div>` (wrapped) | Social group lives here (moved out of footer) |
| 11 | Page extras CMS slot | `<PageExtras page="home" />` | CMS tail content |
| 12 | Footer | `<Footer />` (rendered by site shell, not HomePage) | Artwork region + solid legal strip |

**IMPORTANT:** Leadership / Leaders was intentionally removed from the homepage (prior commit `0ce2bf9`). Do NOT restore a Leaders homepage section. The `/leadership` route, `src/pages/LeadershipPage.tsx`, `useLeadership` hook, and leadership data remain available for the dedicated Leadership page and are reached via About → Leadership in the primary nav.

---

## Hero — Current Approved State

**Component:** `src/components/HomeHeroVideo.tsx`

**Assets (all return HTTP 200 from live production):**

| Role | Path | Size |
|---|---|---|
| Desktop WebM | `/hero/ipf-uae-hero-desktop.webm` | 8.4 MB |
| Mobile WebM | `/hero/ipf-uae-hero-mobile.webm` | 5.3 MB |
| Desktop poster | `/hero/ipf-uae-hero-desktop-poster.webp` | 95 KB |
| Mobile poster | `/hero/ipf-uae-hero-mobile-poster.webp` | 47 KB |

**Behaviour:**

- `autoplay`, `loop`, `muted`, `playsInline` — browser-level requirements for autoplay on mobile
- Breakpoint switch via `<source media="…">` so the browser chooses the correct asset
- Poster swap at the same breakpoint
- Vande Mataram audio toggle anchored to bottom-right as the ONLY interactive element over the video (see next section)

**IMPORTANT:** The Hero video itself is intentionally clean. All former overlay content (BrandLoader / BrandMark / badge / h1 / subtitle / tricolour divider / intro paragraph / CTAs / scroll chevron) was removed in the current redesign and must NOT be reintroduced. The content structure that follows the video (identity strip + stats + president's message) is intentionally designed as the textual continuation of the hero.

---

## Vande Mataram Audio

**Component:** `src/components/VandeMataramToggle.tsx`
**Audio asset:** `/audio/vande-mataram.mp3` (returns HTTP 200 from production)
**Placement:** anchored to the bottom-right of the hero `<section>` on both mobile and desktop
**Behaviour:** manual toggle (play / pause) — never autoplays audio. This is intentional founder-approved functionality.

Do NOT remove during any animation / audio cleanup unless explicitly instructed.

---

## Identity / Introduction Strip

**Component:** `src/components/HomeIdentityStrip.tsx`
**Section ID:** `ipf-identity-heading`

Current content (verbatim from current code):

- Eyebrow (gold, Devanagari): `सेवा · संस्कृति · समुदाय`
- H1: **Indian People's Forum UAE**
- Tricolour hairline divider (saffron / white / green)
- Subheading: *Serving the Indian community in the UAE through service, culture, leadership and community engagement.*

**Responsive copy constraint:** paragraph `max-width` is `850px` at mobile / tablet and `1000px` at `lg+` so the full sentence sits on **one line** at every width ≥ 1024 — the founder specifically required that the word *community* must not fall onto a second line on desktop (prior fix commit `e14001c`).

Do NOT redesign this section without explicit instruction.

---

## Statistics Strip

**Component:** `src/components/CommunityStats.tsx`
**Data source:** `src/data/homeStats.ts` (static TypeScript export)

Current values:

| Key | Label | Value | Suffix |
|---|---|---|---|
| `members`  | MEMBERS       | 5000 | `+` |
| `yuva`     | IPF YUVA      | 1000 | `+` |
| `events`   | EVENTS        |   25 |     |
| `chapters` | UAE CHAPTERS  |    8 |     |

**IMPORTANT:** these are **temporary presentation values**, intended to become CMS-editable / replaced with verified figures. They are NOT verified permanent organisational statistics.

Treatment:

- Thin burgundy band directly under the identity strip
- Serif gold tabular numerals, uppercase ivory labels
- One-shot `easeOutCubic` count-up when the strip enters view (1200 ms); `prefers-reduced-motion` sets the final value immediately with no animation
- Four equal cells divided by hairline ivory dividers at `lg+`

**CMS readiness:** `homeStats.ts` is intentionally the compile-time contract and default. A future CMS `HomeStats` model should emit the same shape (`key` / `label` / `value` / `suffix`); a hook can then merge the CMS payload over `homeStats` without any component redesign — only the data source changes.

---

## President's Message

**Component:** `src/components/HomePresidentMessage.tsx`

| Element | Source |
|---|---|
| Background | `/backgrounds/ipf-heritage-ivory-background.webp` (approved IPF heritage ivory artwork). Dims `2156 × 729`. Returns HTTP 200 live. |
| Photograph | `img.president` → `/legacy-assets/images/shri-jitendra-vedya-president-uae.jpg` (verified in `src/data/site.ts:31`) |
| Name | `site.president` → "Shri Jitendra Vaidya" |
| Role | `site.presidentRole` → "President, IPF UAE" |
| Quote title | CMS `president_quote_title` via `useHomeContent()` → `/api/home-content?locale=…` — i18n key `home.presidentMsg` is the fallback |
| Quote body | CMS `president_quote_body` same hook — fallback `home.presidentQuote` |
| CTA | `Read the full message →` → `/leadership` |

Layout: two-column grid at `lg+` (`1.55fr / 1fr`), text left, portrait right. Background is `object-cover object-[85%_center]` so the busier right-side ornament sits behind the portrait and the left stays as clean ivory for the quote.

**Rendered opacity after today's audit:** `0.95` (unchanged — the live render reads balanced).

**IMPORTANT — President continuity:** the President may change. Photograph, name, designation and message must remain CMS-manageable / replaceable. Nothing about the person is baked into the decorative background artwork — the portrait is a separate `<img>`, and the name / role / quote are plain React content.

**Pending issue:** the global `.home-theme-page > section::before` rotating mandala pseudo-element still renders over this section (see Animation Policy above). Permanent fix required next session.

---

## Who We Are

**Component:** `src/components/HomeWhoWeAre.tsx`

| Element | Source |
|---|---|
| Background WebP | `/images/home/who-we-are-background.webp` (85 KB) |
| Background PNG | `/images/home/who-we-are-background.png` (1.7 MB — provenance fallback) |
| Background source artwork | "Elegant Cream Arabesque Skyline Background.png" (founder-approved, 1774 × 887) |
| Content photograph | `content.whoWeAreImage` via `useCms()` → `/api/cms/content`. Default fallback is `/legacy-assets/images/Ahlan_Modi.jpeg`. |
| Headline | *A community connected by service, culture and purpose.* |
| Body | Two short paragraphs about IPF UAE's mandate (hard-coded; moving to CMS would need a schema addition) |
| CTA | `Discover IPF UAE →` → `/about` |

Layout: `lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12` — photograph on the LEFT at ≥lg, editorial content on the RIGHT. The Container caps at `max-w-6xl` so the photograph remains ~578 px at 1440 and does not grow beyond ~600 px at 1920. Mobile stacks with the photo first and text below.

Background `object-cover object-[center_55%]` keeps the clean ivory centre + lower skyline band visible while the upper ornaments crop first at narrow viewports.

**Rendered opacity after today's audit:** `0.90` (reduced from `1.00`).

**IMPORTANT:**

- The content photograph (`content.whoWeAreImage`) is **independently CMS-replaceable** without touching the decorative background.
- Who We Are **replaced** the Leaders homepage section (commit `0ce2bf9`). Do NOT reintroduce Leaders below it.
- Pending issue: the global rotating mandala pseudo-element still renders over this section — see Animation Policy above.

---

## Events — Current Final Implementation

**Component:** `src/components/HomeEvents.tsx`
**Data source:** `content.eventHighlights` via `useCms()`. Seeds live in `src/data/platformContent.ts` → `homeEventsCarousel` (6 entries). CMS-editable per entry through the existing admin pipeline at `/admin/operations/EventsView.tsx` → PUT `/api/admin/events`.

### Six current events (all drawn verbatim from pre-existing project data — no invented details)

| # | id | Title | Date | Location | Image | Primary source |
|---|---|---|---|---|---|---|
| 1 | `office-inauguration-ajman`           | IPF Office Inauguration in Ajman | 21 January 2021 | Horizon Towers, Al Rashidiya, Ajman | `/legacy-assets/images/slider1.jpg` | `archiveEvents.office-inauguration-2021` + `newsItems.ipf-office-inauguration` |
| 2 | `meeting-external-affairs-abu-dhabi`  | Meeting with Minister of State for External Affairs in Abu Dhabi | 2021 | Abu Dhabi | `/legacy-assets/images/news2.jpg` | `newsItems.meeting-external-affairs-abu-dhabi` (Shri V. Muraleedharan) |
| 3 | `nris-invest-opportunities`           | NRIs Urged to Invest & Explore Opportunities in Key Sectors | 2021 | United Arab Emirates | `/legacy-assets/images/news3.jpg` | `newsItems.nris-urged-to-invest` |
| 4 | `upskilling-blue-collar-workers`      | Upskilling of Blue-Collared Workers in the UAE | January 2021 | Dubai | `/legacy-assets/images/community-support.png` | `newsItems.upskilling-blue-collared-workers` |
| 5 | `suchetha-felicitated-piyush-goyal`   | Guinness World Record Holder Suchetha Felicitated by Shri Piyush Goyal | 2021 | Oberoi Hotel, Business Bay, Dubai | `/legacy-assets/images/Sucheta.jpg` | `newsItems.sucheta-felicitated-business-conclave` + `archiveEvents.business-conclave-2021` |
| 6 | `ahlan-modi-community-programme`      | AHLAN MODI — IPF UAE Community Welcome | 2024 | United Arab Emirates | `/legacy-assets/images/Ahlan_Modi.jpeg` | `featuredHomeEvents.ahlan-modi` + `archiveEvents.ahlan-modi-event` |

All seven image URLs (6 event images + the Events background) return HTTP 200 from production.

### CMS management

Admins can **add / edit / image-upload / toggle homepage / submit for workflow approval / change title / change date / change location / change body / change category / change emirate** per entry via the existing Admin UI. No schema change, no DB migration, no code change needed to add or remove an event.

Display order on the homepage is the array order in `content.eventHighlights` (so admin reordering reflects immediately).

### Carousel behaviour

| Attribute | Value |
|---|---|
| Autoplay cycle | 5000 ms (≈ 4.2 s hold + ≈ 800 ms native smooth-scroll per advance) |
| Looping method | Content duplicated: 6 real + 6 identical clones = 12 LIs rendered. Scroll-handler debounced 80 ms; when `scrollLeft ≥ halfWidth` the handler sets `el.style.scrollBehavior = 'auto'`, subtracts `halfWidth`, and restores. User sees continuous forward motion with an invisible wrap. |
| Cards visible | 375/390/430: 1 + ~12 % peek · 768: ~2 · 1024: ~2.5 · 1280/1440: 3 + 4th peek · 1920: 3–4 |
| Prev button | Handles the left-edge case symmetrically (invisible forward reset before smooth back-step) |
| Pause triggers | Hover · keyboard focus-within · touch (3 s grace) · `document.hidden` |
| Keyboard | Arrows receive native focus; cards are `<Link>` elements so Tab traverses them |
| Touch / swipe | Native via `overflow-x-auto` + `snap-x snap-mandatory` |
| Reduced motion | `prefers-reduced-motion: reduce` disables autoplay entirely; manual controls remain functional |

### Background

| | |
|---|---|
| WebP | `/images/home/events-background.webp` (101 KB) |
| PNG | `/images/home/events-background.png` (1.78 MB — fallback) |
| Source artwork | "Elegant Indian-Arabian Waterfront Banner.png" (founder-approved, 1774 × 887) |
| Positioning | `object-cover object-[35%_center]` so the bottom-left tricolour detail stays visible when horizontal crop occurs |
| Rendered opacity | `0.90` (reduced from `1.00` during today's audit) |

### Seamless-loop fix (today's commit `b59f170`)

**Root cause of previous visible rewind:** the `<ul>` track had Tailwind's `scroll-smooth` utility, which applies CSS `scroll-behavior: smooth`. That property animates ALL scrolling on the element — including direct `scrollLeft` property assignments — so the wrap-reset was animated instead of instant, producing a slow visible rewind.

**Fix (three layers of defence):**

1. **Removed `scroll-smooth` CSS class** on the track. Autoplay + prev / next still animate via per-call `scrollBy({behavior: 'smooth'})`; native touch/swipe is unaffected.
2. **Forced `scrollBehavior: 'auto'`** on the direct `scrollLeft` write (restored on the next animation frame). Belt-and-braces against any future CSS change.
3. **80 ms trailing debounce** on the scroll handler — the reset now fires only AFTER the smooth scroll has settled past the boundary, not mid-animation.

**Verified via live CDP recording:** 55 s of `scrollLeft` sampled at 100 ms resolution on live production — exactly one backward delta (the wrap, expected), completed in a single 99 ms tick. Zero multi-sample slow-rewind sequences.

**DO NOT reintroduce `scroll-smooth`** on this looping track without understanding the above.

---

## Gallery — Current Final Implementation

**Component:** `src/components/HomeGallery.tsx`
**Data source:** `content.galleryImages` via `useCms()`. Chunked into triples; each triple renders as one feature image + two companion images.

### Background

| | |
|---|---|
| WebP | `/images/home/gallery-background.webp` (147 KB) |
| PNG | `/images/home/gallery-background.png` (1.98 MB — fallback) |
| Source artwork | "Serene Temple River Panorama with Tricolour Waves (1).png" (founder-approved, 1774 × 887) |
| Positioning | `object-cover object-[75%_bottom]` at < lg · `lg:object-[center_bottom]` at ≥ lg. Anchors the bottom at every width so the temple band bottom-left and the tricolour band bottom-right both stay visible. Horizontal 75 % bias on narrow viewports keeps the tricolour visible when the image crops horizontally; at `lg+` the full image width fits so the bias resets to centre. |
| Rendered opacity | `0.88` (reduced from `1.00` during today's audit — slightly stronger than the other backgrounds because the bottom-left temple silhouettes were the strongest competing architectural element) |

**APPROVED ART DIRECTION — DO NOT CHANGE:**

- Gallery **tricolour remains on the RIGHT** at every width
- Do NOT mirror, flip, recolour, or crop the source artwork
- Do NOT replace the artwork without founder instruction

### Structure

**Desktop (≥lg):** `lg:grid-cols-[1.6fr_1fr]` — one feature image on the LEFT + two stacked companions on the RIGHT. Thin progress bar + ivory arrow buttons below.

**Tablet (sm–md):** `sm:grid-cols-2` — feature + two side-by-side companions.

**Mobile:** feature image spans full column, two companions become a `grid-cols-2` row directly beneath. Progress bar + arrows below. Mobile-only `Open gallery →` link under the carousel.

### Carousel behaviour

| Attribute | Value |
|---|---|
| Autoplay cycle | 9000 ms (deliberately slower than Events' 5000 ms so the two sections never pulse together) |
| Transition | 900 ms `cubic-bezier(.2,.8,.2,1)` opacity + 4 px slide-up (`@keyframes ipf-gallery-fade` in `src/index.css`) |
| Pause triggers | Hover · keyboard focus-within · touch (3 s grace) · `document.hidden` |
| Reduced motion | `prefers-reduced-motion: reduce` disables autoplay; renders the first triple as a static mosaic; arrows + progress remain functional |
| Navigation | Ivory 40 × 40 circle buttons with burgundy inline-SVG chevrons |

**Pending issue:** the global `.home-theme-page > section::before` rotating mandala pseudo-element still renders over this section. Permanent fix required next session (same approach as President's Message and Who We Are).

---

## Background Opacity Audit — Today's Final State

Live production audit executed 5 October 2026 at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920. Changes applied at the `<img>` element inside each decorative `<picture>` — **source artwork was NOT modified**.

| Section | Before | After | Status | Reason |
|---|---|---|---|---|
| President's Message | 0.95 | **0.95** | unchanged | Live render already read balanced; ivory canvas recedes behind quote + portrait |
| Who We Are         | 1.00 | **0.90** | adjusted  | Right-side ornamental arches read slightly stronger than text; 10 % reduction softens them to stationery feel |
| Events             | 1.00 | **0.90** | adjusted  | Left-edge gold mandalas + bottom tricolour ribbon read stronger than the card photography deserves |
| Gallery            | 1.00 | **0.88** | adjusted  | Bottom-left temple silhouettes were the strongest competing architectural element page-wide |

**Key points:**

- Source artwork was NOT modified
- Opacity is presentation-level only (`class="… opacity-{N}"` on the decorative `<img>`)
- No additional overlay / wash was required — the tricolour remains recognisable at 0.88–0.90 saturation
- Purpose: consistent visual hierarchy while scrolling so photography / content dominate decorative backgrounds

Opacity-balance commit: **`172dbe5362a1248c7674750643a0e3de72dd09ea`**

---

## Get Involved + Follow Us

**Component:** `src/components/HomeGetInvolved.tsx`

Founder-approved direction: **Follow Us was intentionally moved OUT OF THE FOOTER and INTO the Get Involved section.** Social icons now live in exactly one place on the public site.

Current structure (verified in code):

- **Burgundy background** (`#5A0F1E`), ivory text
- **Desktop grid** `lg:grid-cols-[1.9fr_1fr]` — LEFT ~65 %, RIGHT ~35 %
- **LEFT column**
  - Eyebrow (gold): `Get involved`
  - H2: `Join the IPF mission in the UAE`
  - Supporting paragraph
  - Four buttons: `Join IPF` (saffron, deep-burgundy text) · `Yuva` · `Contact IPF` · `Donate`
- **RIGHT column**
  - Label: `Follow Us`
  - Four social icons (Facebook / Instagram / X / YouTube) — inline SVGs so no icon library dependency

Content is CMS-aware via `useHomeContent()` (`join_eyebrow` / `join_title` / `join_desc`) with i18n fallbacks.

Thinner / cleaner / consistent burgundy — no decorative legacy animation. Wrapped in a `<div>` in `HomePage.tsx` so the mandala pseudo-element does not apply.

**Do NOT restore the Follow Us group to the footer.**

---

## Footer

**Component:** `src/components/Footer.tsx`

Two sibling regions in a plain `<footer>`:

1. **Artwork region** (`.footer-artwork-section`)
   - Full-bleed panoramic India–UAE artwork at `/footer-india-uae.webp`
   - Breakpoint-tuned `object-position`: mobile `50 % 70 %` · tablet `50 % 60 %` · desktop `centre`
   - Burgundy fallback `#5a0f1e` behind the image during load
   - Two navigation columns (Explore + Get involved) rendered on top

2. **Legal strip** (`.footer-legal-strip`)
   - Solid dark burgundy `#3A0913` — no `rgba`, no backdrop filter, no gradient
   - Border-top ivory 10 %
   - Copyright + `Co-built and managed by` credit

**Important approved elements:**

- India–UAE artwork
- Navigation columns
- Solid dark `#3A0913` legal strip
- Copyright
- `Co-built and managed by` credit

**Do NOT restore social icons to Footer Column 1** (they live in Get Involved now).

---

## Announcement Bar

**Component:** inside `src/components/Header.tsx` (not a standalone file)

Current structure (verified):

```
[ LATEST ] [ scrolling news ticker ] [ Sign in ] [ EN ]
```

- Desktop-only (`md:block`)
- Burgundy background
- CSS class `.ipf-ticker-track` with `animation: ipf-ticker 42s linear infinite` (in `src/index.css`)
- Reduced-motion rule in `src/index.css` disables the ticker animation
- `Donate` was intentionally **removed** from this strip (prior commits `3410565` + `bee82ef` — the second also filters a CMS `/api/nav` override of Donate at render time)
- Email address was intentionally removed from this strip

**Do NOT restore Donate or email to the announcement bar.**

---

## Pending Navigation Change — Yuva

The founder has requested:

**YUVA must move under ABOUT.**

Verified against `src/data/navigation.ts` at main SHA `b59f170`:

- `primaryNav` (desktop) already has About with `IPF Yuva` as a child dropdown item (lines 16–24). Top-level items are: About · Chapters · Councils · Events · Gallery · News — Yuva is NOT a separate top-level desktop entry.
- `mobileTabs` has `Home · Leaders · Events · Gallery · Join` — Yuva is not present there either.
- However, `footerGroups.Programmes` and `footerGroups.Get involved` still carry separate `IPF Yuva → /yuva` entries. These may need review for the final hierarchy consistency.

**The founder's stated desired About dropdown (desktop):**

```
About
├── About IPF
├── History
├── Governance
├── Support
├── Leaders
└── Yuva
```

Mobile navigation must reflect the same logical hierarchy.

**Pending verification tasks for the next session (do NOT implement here):**

1. Verify the live-rendered desktop header shows Yuva under About with no duplicate top-level Yuva entry anywhere (desktop main nav OR mobile tab bar OR hamburger drawer).
2. Verify Yuva appears exactly once in the About dropdown and nowhere else as a top-level nav item.
3. Keep the existing `/yuva` route and page (`src/pages/YuvaPage.tsx`). Do NOT create a new Yuva page or duplicate the route. Do NOT merge Yuva with Leadership. Do NOT alter Yuva content.

Document the result. If any duplicate placement exists, remove it in that session.

**DO NOT implement this while writing HANDOFF.md.** It is documented as PENDING only.

---

## CMS Principle

Homepage content currently connected to CMS versus static:

| Content | CMS-controlled? | Source |
|---|---|---|
| President photograph | ❌ static — `img.president` in `src/data/site.ts` | Hard-coded path to `/legacy-assets/images/shri-jitendra-vedya-president-uae.jpg`. **Should become CMS-managed when President changes.** |
| President name | ❌ static — `site.president` | Hard-coded "Shri Jitendra Vaidya". **Should become CMS-managed.** |
| President designation | ❌ static — `site.presidentRole` | Hard-coded. **Should become CMS-managed.** |
| President quote title | ✅ CMS — `useHomeContent().president_quote_title` | `/api/home-content?locale=…` with i18n fallback `home.presidentMsg` |
| President quote body | ✅ CMS — `useHomeContent().president_quote_body` | Fallback `home.presidentQuote` |
| Who We Are photograph | ✅ CMS — `content.whoWeAreImage` via `useCms()` | Fallback `/legacy-assets/images/Ahlan_Modi.jpeg` |
| Who We Are text + title | ❌ static — hard-coded in `HomeWhoWeAre.tsx` | Would need a schema addition on `CmsContent` to become CMS-managed |
| Events (6 cards) | ✅ CMS — `content.eventHighlights` via `useCms()` | Seeds in `src/data/platformContent.ts → homeEventsCarousel`. Admin UI: `/admin → Operations → Events` with create / edit / image upload / toggle homepage |
| Gallery photographs | ✅ CMS — `content.galleryImages` via `useCms()` | Admin-editable list |
| Statistics (members / yuva / events / chapters) | ❌ static — `src/data/homeStats.ts` | **CMS-ready contract** — the file documents the shape a future CMS `HomeStats` model should emit. No component redesign needed when CMS is wired up. |
| Get Involved copy | ✅ CMS — `useHomeContent().join_eyebrow / join_title / join_desc` | Fallbacks `home.getInvolved` / `home.joinTitle` / `home.joinDesc` |
| Hero WebM / posters | ❌ static assets under `/hero/*` | Replaced by git-committed asset swap |
| Vande Mataram audio | ❌ static `/audio/vande-mataram.mp3` | |
| Backgrounds (President / Who-We-Are / Events / Gallery) | ❌ static design assets under `/backgrounds/*` and `/images/home/*` | **Decorative design assets — separate from CMS content pipeline.** |

**CONTENT ASSETS vs DECORATIVE DESIGN ASSETS — the distinction is binding:**

CMS replaces **content** (photographs of people and events; text; event records; gallery images) **without destroying the approved section design or background**. Decorative background artwork is a static design asset and must NOT be merged into the CMS payload or editable through CMS admin surfaces.

---

## Responsive Design Requirement

Standard verification widths used throughout this redesign:

**375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920**

Every future homepage change must be checked at these widths unless there is a specific reason otherwise. Required outcome at each:

- No horizontal overflow
- No text clipping
- No unintended wrapping
- No broken image cropping
- No desktop-only assumption

Local verification is not sufficient — final sign-off happens by CDP capture against **live Vercel production** after each push.

---

## Today's Important Commits (5 October 2026)

All verified against `git log` on `main`:

| SHA | Description |
|---|---|
| `b59f170d0e02b77d3cd9c50d655f381eae5dc0a0` | **fix(home-events): true infinite loop — no visible rewind at wrap point** (removes `scroll-smooth` from the Events track, forces `scrollBehavior:'auto'` on the reset, adds 80 ms trailing debounce) |
| `172dbe5362a1248c7674750643a0e3de72dd09ea` | **chore(home): balance decorative background opacity across sections** (Who-We-Are 0.90 · Events 0.90 · Gallery 0.88) |
| `3359798f508495494c60e588f53016cbdd708c33` | fix(home-events): remove duplicate mobile 'View all events →' link |
| `1f23c6203163283fd04fcfd390c66796ab495678` | **feat(home-events): premium editorial 6-event CMS carousel with seamless slow continuous loop** |
| `94fda83e5e0d34b538497bef353e913aa11371d1` | **feat(home-gallery): swap background to approved Serene Temple River Panorama** |
| `ea8f759565f3fc1bb0bd5f9cacf39577e5408804` | feat(home): premium Events carousel + Gallery mosaic (approved backgrounds) |

Repository git history is authoritative. If any detail in a previous session's chat conflicts with the committed code, the committed code wins.

---

## Known Pending Work

- [ ] **Permanently remove the unwanted legacy rotating decorative animation** still rotating around President's Message, Who We Are AND Gallery. Root cause is the `.home-theme-page > section::before` CSS rule at `src/index.css:440–441` plus the `ipf-theme-spin` keyframe. See *Animation Policy → Pending issue* above for the exact fix options.
- [ ] **Move Yuva under About** in both desktop header dropdown AND mobile navigation; verify no duplicate top-level Yuva entry remains anywhere. Reuse existing `/yuva` route — do NOT duplicate.
- [ ] **Verify / update actual organisational statistics** through CMS when final numbers are supplied. `src/data/homeStats.ts` is already shaped for a drop-in CMS merge; the current values are presentation defaults.
- [ ] **Promote `site.president` / `site.presidentRole` / `img.president`** from hard-coded in `src/data/site.ts` to CMS-managed so a future presidential change can be made without a code deploy.
- [ ] **Wire a real admin UI for `content.whoWeAreImage`** on the CMS content editor if one is not already surfaced (verify in `src/admin/*` before adding).
- [ ] Continue homepage / inner-page work only from the current approved design state above.

---

## DO NOT REGRESS THESE DECISIONS

- Do NOT restore a Leaders section to the homepage.
- Do NOT restore the Follow Us group to the footer.
- Do NOT restore Donate or email to the announcement bar.
- Do NOT move the Gallery tricolour away from the right.
- Do NOT replace approved backgrounds without founder instruction.
- Do NOT modify source artwork merely to tune opacity (CSS-level only).
- Do NOT introduce decorative animations (rotations / pulses / parallax / particles / scroll-reveal / mandalas / rays / orbits / drift / float).
- Do NOT reintroduce `scroll-smooth` onto the Events infinite-loop track (`<ul>` with role `list`) — it breaks the seamless wrap.
- Do NOT cover the Hero video with excessive text; the overlay content was intentionally stripped.
- Do NOT hard-code CMS-manageable content (people / events / gallery / stats) into decorative artwork files.
- Do NOT duplicate the `/yuva` route when moving navigation.
- Do NOT redesign approved sections while fixing isolated bugs.
- Do NOT skip live production verification at the eight responsive widths after any homepage change.

---

## Recommended Next Session Order

1. **Pull latest `main`** and verify a clean working tree.
2. **Confirm production SHA** at `https://ipf-uae-digital-platform.vercel.app/` matches the expected `main` HEAD.
3. **Remove the unwanted legacy rotating decorative animation** from President's Message, Who We Are, and Gallery:
   - Preferred: delete the `.home-theme-page > section::before` + `:nth-of-type(even)::before` rules at `src/index.css:440–441` and the `ipf-theme-spin` keyframe (after verifying nothing else depends on it).
   - Acceptable alternative: wrap `<HomePresidentMessage />`, `<HomeWhoWeAre />`, `<HomeGallery />` in a `<div>…</div>` in `HomePage.tsx` the same way `<HomeEvents />` is wrapped.
4. **Verify removal on LIVE production** at 1440 AND 390 — no rotating saffron/green ornament behind any homepage section.
5. **Move Yuva into the About dropdown** (desktop + mobile) and remove any duplicate top-level Yuva entry. Reuse `/yuva` route. Verify at 1440 AND 390.
6. **Continue** with the next founder-requested homepage / site section.

**IMPORTANT:** these are instructions for the NEXT session — do not auto-execute while reading this handoff.

---

*Handoff written 5 October 2026 against main SHA `b59f170d0e02b77d3cd9c50d655f381eae5dc0a0`.*
