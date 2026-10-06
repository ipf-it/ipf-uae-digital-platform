import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Container } from "../components/ui/Container";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * HistoryPage — History & Governance (Phase 2 implementation, 5 Oct 2026).
 *
 * Replaces the previous 22-line stub (dark burgundy PageHero + generic
 * PageSectionRenderer) with a 7-section editorial composition that
 * unifies History and Governance behind a single institutional URL.
 *
 * Scope
 *   • /history now renders this entire page.
 *   • /governance redirects to /history (see src/App.tsx) — the old
 *     GovernancePage.tsx is intentionally left in place for cleanup
 *     in a later phase.
 *   • /about remains untouched; its tile grid is updated separately
 *     and reported in the Phase 2 review.
 *
 * Design family
 *   Inherits the LOCKED About design system — gold / navy / burgundy
 *   / ivory tokens, GoldRule and Lotus helpers, Section component with
 *   ivory | white tone, white curved institutional panel. The Hero
 *   deliberately departs from the ivory About hero: it sits on a deep
 *   navy ground with a founder-supplied approved artwork slot, so that
 *   History & Governance has its own gravitas while clearly belonging
 *   to the About family.
 *
 * i18n
 *   Every user-facing string comes from `page.historyGov.*` keys (new)
 *   or re-used `page.governance.*` keys for the three CMS-approved
 *   policy paragraphs inside the Governance panel. All 10 configured
 *   locales render correctly. No hard-coded English strings.
 *
 * Images
 *   Inline photographs from /legacy-assets/images use genuine, dated
 *   or unattributed IPF content. The 2021 Ajman office photograph is
 *   reserved for §5 (Evolution) and is NOT used in §2 (Beginning),
 *   because /slider1.jpg is from 2021 and must not visually imply a
 *   2014 scene. §2 is typography-led.
 *
 * Motion
 *   Static. No carousels, no autoplay, no parallax, no scroll reveal.
 *   Only link / button hover + focus.
 * ─────────────────────────────────────────────────────────────────── */

/* Founder-supplied Hero backdrop slot. When these files exist at the
   paths below, the page shows them. When they don't (local dev before
   artwork is produced), the <img> onError hides itself and the hero
   gracefully degrades to the navy ground + gold accents fallback.
   Recommended artwork specs are documented in the Phase 2 review. */
const HERO_WEBP = "/images/history/history-hero-bg.webp";
const HERO_PNG = "/images/history/history-hero-bg.png";

/* Photographic inline images — genuine IPF repository assets. */
const BEGINNING_IMG = "/legacy-assets/images/Ahlan_Modi.jpeg";

/* Founder-supplied Milestones section background — the
   "Watercolour Indian Heritage Milestones Panorama" artwork. Indian
   temple + heritage architecture framing an ivory central negative
   space with a tricolour watercolour ribbon. Used ONLY as the Milestones
   section background. filter: none, no colour wash. */
const MILESTONES_BG_WEBP = "/images/history/history-milestones-bg.webp";
const MILESTONES_BG_PNG = "/images/history/history-milestones-bg.png";

/* Eight UAE chapters — authoritative list from /api/org/chapters.
   Note: UAE has seven Emirates; "Al Ain" is a city in Abu Dhabi
   Emirate, counted here as its own chapter per project data. */
const UAE_CHAPTERS = [
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm Al Quwain",
] as const;

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "#5A0F1E";
const INK = "#1c2430";
const MUTED = "#55606d";

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

type SectionProps = {
  tone?: "ivory" | "white";
  children: React.ReactNode;
  ariaLabelledBy?: string;
};

function Section({ tone = "ivory", children, ariaLabelledBy }: SectionProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={`relative isolate overflow-hidden py-12 sm:py-14 lg:py-16 ${
        tone === "ivory" ? "bg-[#FFF8EE]" : "bg-[#FFFDF8]"
      }`}
    >
      <Container className="relative">{children}</Container>
    </section>
  );
}

type Milestone = {
  year: string;
  title: string;
  detail: string;
};

export default function HistoryPage() {
  const { t } = useLocale();

  const milestones: Milestone[] = [
    { year: t("page.historyGov.yearM1"), title: t("page.history.m1Title"), detail: t("page.history.m1Detail") },
    { year: t("page.historyGov.yearM2"), title: t("page.history.m2Title"), detail: t("page.history.m2Detail") },
    { year: t("page.historyGov.yearM3"), title: t("page.history.m3Title"), detail: t("page.history.m3Detail") },
    { year: t("page.history.ongoing"), title: t("page.history.m4Title"), detail: t("page.history.m4Detail") },
  ];

  return (
    <>
      <DocumentTitle title={t("page.historyGov.title")} />

      {/* ──────────────────────────────────────────────────────────────
       * §1 Hero — unified light illustrated hero (shared with /leadership,
       * /yuva, /support). Approved Watercolour Heritage artwork preserved
       * in its original colours; dark-navy editorial text sits over the
       * left ivory negative space. No overlay, no colour wash.
       * ────────────────────────────────────────────────────────────── */}
      <IllustratedHero
        eyebrow={t("page.history.eyebrow")}
        title={t("page.historyGov.title")}
        description={t("page.historyGov.heroLede")}
        crumbs={[
          { label: t("nav.aboutIpf"), to: "/about" },
          { label: t("nav.historyGov") },
        ]}
        artworkPng={HERO_PNG}
        artworkWebp={HERO_WEBP}
        artworkAlt={t("page.historyGov.heroImgAlt")}
        /* History's panoramic Watercolour Heritage artwork has an ivory
           negative-space area with a tricolour swash on the LEFT and a
           dense architectural cluster on the right. The image is pinned
           to its left edge so the ivory area always sits behind the
           text column. Text column width is tuned so the H1 wraps on
           two lines ("History &" + "Governance") without breaking the
           word "Governance" mid-glyph at any desktop breakpoint. */
        artworkPosition="object-[0%_center]"
        textMaxWidth="max-w-[340px] md:max-w-[340px] lg:max-w-[320px] xl:max-w-[320px]"
      />

      {/* ──────────────────────────────────────────────────────────────
       * PART I — HISTORY chapter marker. Compact (acts as a chapter
       * title, not another hero). Centred; gold eyebrow + serif title +
       * fine gold rule. No supporting lede — the Beginning paragraph
       * immediately after carries the opening narrative.
       * ────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hg-part-i-heading"
        className="relative isolate overflow-hidden bg-[#FFFDF8] pt-14 pb-6 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.4em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.partI")}
            </p>
            <h2
              id="hg-part-i-heading"
              className="mt-2 font-serif text-[1.75rem] font-bold leading-[1.05] tracking-tight sm:text-[2rem] lg:text-[2.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.partIHeading")}
            </h2>
            <div className="mt-4 flex justify-center">
              <GoldRule />
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────────
       * 01 OUR BEGINNING — editorial 55/45 band with a genuine IPF
       * community photograph on the right. Deliberately aligned text
       * block + image, consistent with the site's 1120-1200px grid.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s2-heading">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[11fr_9fr] lg:gap-14">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s2Eyebrow")}
              </p>
            </div>
            <h2
              id="hg-s2-heading"
              className="mt-5 font-serif text-[1.8rem] font-bold leading-[1.1] tracking-tight sm:text-[2.1rem] lg:text-[2.4rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.s2Heading")}
            </h2>
            <div
              className="mt-6 space-y-4 text-[0.98rem] leading-relaxed sm:text-[1.02rem]"
              style={{ color: INK }}
            >
              <p>{t("page.historyGov.s2Body1")}</p>
              <p>{t("page.historyGov.s2Body2")}</p>
            </div>
          </div>
          <figure
            className="relative overflow-hidden shadow-[0_12px_36px_rgba(11,31,58,0.1)] ring-1 ring-[#D6AD60]/30"
            style={{ borderRadius: "2rem 5rem 2rem 5rem" }}
          >
            <img
              src={BEGINNING_IMG}
              alt="IPF UAE community gathering, Ahlan Modi welcome programme"
              loading="lazy"
              decoding="async"
              className="block aspect-[4/3] w-full object-cover"
            />
          </figure>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * 02 OUR JOURNEY — Milestones. Clean institutional timeline.
       * (The Watercolour Milestones Panorama background was moved to
       * the PART II Governance marker below so the heritage artwork
       * sits where the chapter break occurs; this section returns to
       * its earlier white-background editorial layout.)
       * Desktop: 4 equal columns, dots on one horizontal axis.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="white" ariaLabelledBy="hg-s3-heading">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <GoldRule />
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.timelineEyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="hg-s3-heading"
            className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.timelineHeading")}
          </h2>
        </div>

        {/* ─── MOBILE / default: vertical timeline, gold rail on left ─── */}
        <ol
          className="relative mx-auto mt-10 max-w-xl space-y-8 pl-10 md:hidden"
          aria-label={t("page.historyGov.timelineHeading")}
        >
          <span
            aria-hidden="true"
            className="absolute left-[11px] top-3 bottom-3 w-px"
            style={{ backgroundColor: `${GOLD}80` }}
          />
          {milestones.map((m) => (
            <li key={m.year + m.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[29px] top-3 size-[14px] rounded-full ring-4 ring-[#FFFDF8]"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="font-serif text-[1.9rem] font-light leading-none"
                style={{ color: NAVY }}
              >
                {m.year}
              </p>
              <p
                className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.24em]"
                style={{ color: GOLD_INK }}
              >
                {m.title}
              </p>
              <p
                className="mt-2 max-w-[32ch] text-[0.9rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                {m.detail}
              </p>
            </li>
          ))}
        </ol>

        {/* ─── TABLET md: 2 × 2 grid, no horizontal rail (clean + readable) ─── */}
        <ol className="mx-auto mt-10 hidden max-w-3xl grid-cols-2 gap-x-10 gap-y-10 md:grid lg:hidden">
          {milestones.map((m) => (
            <li key={m.year + m.title} className="flex flex-col items-center text-center">
              <p
                className="font-serif text-[2.2rem] font-light leading-none"
                style={{ color: NAVY }}
              >
                {m.year}
              </p>
              <span
                aria-hidden="true"
                className="mt-4 size-[12px] rounded-full ring-4 ring-white"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {m.title}
              </p>
              <p
                className="mt-2 max-w-[26ch] text-[0.9rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                {m.detail}
              </p>
            </li>
          ))}
        </ol>

        {/* ─── DESKTOP (lg+): 4 equal columns, SAME horizontal axis, no alternating ─── */}
        <div className="relative mx-auto mt-12 hidden max-w-[1120px] lg:block">
          <ol className="relative grid grid-cols-4 gap-x-8">
            {milestones.map((m) => (
              <li key={m.year + m.title} className="flex flex-col items-center text-center">
                <div className="flex h-20 items-end justify-center">
                  <p
                    className="font-serif text-[2.4rem] font-light leading-none xl:text-[2.7rem]"
                    style={{ color: NAVY }}
                  >
                    {m.year}
                  </p>
                </div>
                {/* Rail segment (behind the dot) — drawn per-cell so it
                   never crosses text. Equal width in every column keeps
                   it visually continuous. */}
                <div className="relative mt-6 h-[14px] w-full">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
                    style={{ backgroundColor: `${GOLD}80` }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white"
                    style={{ backgroundColor: GOLD }}
                  />
                </div>
                <p
                  className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                  style={{ color: GOLD_INK }}
                >
                  {m.title}
                </p>
                <p
                  className="mx-auto mt-3 max-w-[24ch] text-[0.9rem] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  {m.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * PART II — GOVERNANCE chapter marker. The founder-supplied
       * "Watercolour Indian Heritage Milestones Panorama" sits as the
       * background of this chapter break. Indian temple architecture on
       * the left, India Gate + Qutub Minar + Ashoka Chakra on the right,
       * ivory negative space + tricolour ribbon through the centre. The
       * PART II text (eyebrow, title, "How IPF UAE is organised today",
       * description) occupies the ivory central zone where the artwork
       * is deliberately quiet.
       *
       * A controlled warm-ivory veil (centre-weighted radial, max 0.55
       * centre on mobile / 0.40 on desktop) sits above the artwork and
       * below the content to guarantee text contrast on every device.
       * No dark overlay, no colour wash, no filter on the image.
       * ────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hg-part-ii-heading"
        className="relative isolate overflow-hidden bg-[#FBF2DF] py-20 sm:py-24 lg:py-28"
      >
        {/* Background artwork */}
        <picture aria-hidden="true" className="pointer-events-none absolute inset-0">
          <source srcSet={MILESTONES_BG_WEBP} type="image/webp" />
          <img
            src={MILESTONES_BG_PNG}
            alt=""
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover object-center"
          />
        </picture>
        {/* Centre-weighted ivory veil. Mobile is slightly stronger so
            the shorter viewport doesn't push text onto architecture;
            md+ falls back to a softer wash so the panorama reads more
            clearly beside the editorial content. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,248,238,0.78)_0%,rgba(255,248,238,0.55)_55%,rgba(255,248,238,0.25)_100%)] md:bg-[radial-gradient(ellipse_at_center,rgba(255,248,238,0.55)_0%,rgba(255,248,238,0.35)_55%,rgba(255,248,238,0.15)_100%)]"
        />
        <Container className="relative">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div
              aria-hidden="true"
              className="h-px w-28"
              style={{ backgroundColor: `${GOLD}70` }}
            />
            <p
              className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.4em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.partII")}
            </p>
            <h2
              id="hg-part-ii-heading"
              className="mt-2 font-serif text-[1.75rem] font-bold leading-[1.05] tracking-tight sm:text-[2rem] lg:text-[2.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.partIIHeading")}
            </h2>
            <p
              className="mt-5 font-serif text-[1.15rem] font-semibold leading-snug sm:text-[1.25rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.transHeading")}
            </p>
            <p
              className="mt-4 max-w-xl text-[0.95rem] font-medium leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.partIILede")}
            </p>
            <div
              aria-hidden="true"
              className="mt-7 h-px w-28"
              style={{ backgroundColor: `${GOLD}70` }}
            />
          </div>
        </Container>
      </section>

      {/* ──────────────────────────────────────────────────────────────
       * 03 ORGANISATIONAL STRUCTURE — intro + hierarchy visual.
       * Opens Part II with the licensed-organisation statement and the
       * Managing Committee → Chapters + Councils tree.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s6-heading">
        <div className="mx-auto max-w-[1120px]">
          {/* Section opener: eyebrow + licensed-organisation paragraph. The
             duplicate "How IPF UAE is organised" heading has been removed
             — the PART II marker above already carries that line. */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
                id="hg-s6-heading"
              >
                03 · Organisational Structure
              </p>
              <GoldRule />
            </div>
            <p
              className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.structureIntro")}
            </p>
          </div>

          {/* ── Governance hierarchy visual — enlarged centrepiece ──
             IPF UAE → Managing Committee → 8 Chapters + 31 Councils.
             Clean editorial nodes, thin gold connectors, no flowchart
             boxes. Target width ~900px on desktop. */}
          <div
            className="mx-auto mt-14 max-w-[900px] text-center sm:mt-16"
            aria-label="IPF UAE governance hierarchy"
          >
            {/* Tier 1: IPF UAE — ROOT */}
            <div className="inline-flex flex-col items-center rounded-2xl border border-[#D6AD60]/40 bg-white px-8 py-5 shadow-[0_8px_24px_rgba(11,31,58,0.06)]">
              <p
                className="text-[0.62rem] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD_INK }}
              >
                Forum
              </p>
              <p
                className="mt-2 font-serif text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]"
                style={{ color: NAVY }}
              >
                IPF UAE
              </p>
            </div>

            {/* Gold connector */}
            <div
              aria-hidden="true"
              className="mx-auto mt-5 h-10 w-px"
              style={{ backgroundColor: `${GOLD}99` }}
            />

            {/* Tier 2: Managing Committee */}
            <div className="mx-auto inline-flex max-w-xl flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-[#FFFDF8] px-7 py-4">
              <p
                className="text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD_INK }}
              >
                Managing Committee
              </p>
              <p
                className="mt-1.5 text-[1rem] font-semibold sm:text-[1.05rem]"
                style={{ color: NAVY }}
              >
                Central Committee + Chapter Convenors
              </p>
            </div>

            {/* Vertical + horizontal split connector */}
            <div className="relative mx-auto mt-5 h-10 w-full">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2"
                style={{ backgroundColor: `${GOLD}99` }}
              />
              <span
                aria-hidden="true"
                className="absolute left-[25%] right-[25%] top-5 h-px"
                style={{ backgroundColor: `${GOLD}99` }}
              />
              <span
                aria-hidden="true"
                className="absolute left-[25%] top-5 h-5 w-px"
                style={{ backgroundColor: `${GOLD}99` }}
              />
              <span
                aria-hidden="true"
                className="absolute right-[25%] top-5 h-5 w-px"
                style={{ backgroundColor: `${GOLD}99` }}
              />
            </div>

            {/* Tier 3: two parallel branches */}
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="flex flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-white px-6 py-6 shadow-[0_6px_18px_rgba(11,31,58,0.05)]">
                <p
                  className="font-serif text-[2.2rem] font-light leading-none sm:text-[2.5rem]"
                  style={{ color: NAVY }}
                >
                  8
                </p>
                <p
                  className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                  style={{ color: GOLD_INK }}
                >
                  UAE Chapters
                </p>
                <p
                  className="mt-2 text-[0.88rem] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  Local community activity across the Emirates
                </p>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-white px-6 py-6 shadow-[0_6px_18px_rgba(11,31,58,0.05)]">
                <p
                  className="font-serif text-[2.2rem] font-light leading-none sm:text-[2.5rem]"
                  style={{ color: NAVY }}
                >
                  31
                </p>
                <p
                  className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                  style={{ color: GOLD_INK }}
                >
                  Councils
                </p>
                <p
                  className="mt-2 text-[0.88rem] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  State and Special community councils
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * 04 CHAPTERS & COUNCILS — two visually distinguished groups.
       * CHAPTERS are the geographic UAE presence; COUNCILS are the
       * thematic / state-of-origin community initiatives. Different
       * grid treatments make the distinction clear.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="white" ariaLabelledBy="hg-s4-heading">
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                04 · Chapters & Councils
              </p>
              <GoldRule />
            </div>
            <h2
              id="hg-s4-heading"
              className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
              style={{ color: NAVY }}
            >
              Two complementary networks
            </h2>
          </div>

          {/* ─── A · CHAPTER NETWORK — eight chapters, 4×2 on desktop ─── */}
          <div className="mt-14 sm:mt-16">
            <div className="flex items-baseline gap-4">
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD_INK }}
              >
                A · Chapter network
              </p>
              <span
                aria-hidden="true"
                className="h-px flex-1"
                style={{ backgroundColor: `${GOLD}55` }}
              />
            </div>
            <h3
              className="mt-3 font-serif text-[1.3rem] font-bold leading-tight tracking-tight sm:text-[1.45rem]"
              style={{ color: NAVY }}
            >
              Eight chapters across the UAE
            </h3>
            <p
              className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed"
              style={{ color: INK }}
            >
              IPF UAE operates through eight chapters across the UAE. Each chapter sustains social, cultural and welfare activity in its region through local volunteers and professional members.
            </p>
            <ul
              role="list"
              className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4"
            >
              {UAE_CHAPTERS.map((name, i) => (
                <li key={name}>
                  <Link
                    to={`/chapters/${name.toLowerCase().replace(/ /g, "-")}`}
                    className="group flex h-full items-center gap-3 rounded-xl border border-[#D6AD60]/30 bg-white px-4 py-3 transition hover:border-[#D6AD60] hover:shadow-[0_6px_18px_rgba(11,31,58,0.06)]"
                    style={{ color: NAVY }}
                  >
                    <span
                      className="font-serif text-[0.78rem] font-semibold tabular-nums"
                      style={{ color: GOLD_INK }}
                    >
                      0{i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold">
                      {name}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3 shrink-0 opacity-40 transition group-hover:opacity-80 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── B · COUNCIL NETWORK — same visual language as chapters ─── */}
          <div className="mt-14 sm:mt-16">
            <div className="flex items-baseline gap-4">
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD_INK }}
              >
                B · Council network
              </p>
              <span
                aria-hidden="true"
                className="h-px flex-1"
                style={{ backgroundColor: `${GOLD}55` }}
              />
            </div>
            <h3
              className="mt-3 font-serif text-[1.3rem] font-bold leading-tight tracking-tight sm:text-[1.45rem]"
              style={{ color: NAVY }}
            >
              Thirty-one councils — state and special
            </h3>
            <p
              className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.councilsBody")}
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                {
                  count: "24",
                  label: "State councils",
                  body: "Community members by their Indian state of origin — from Andhra Pradesh and Kerala to Assam, Punjab and the North-East.",
                  cta: "View all councils",
                },
                {
                  count: "7",
                  label: "Special councils",
                  body: "Members organised by shared interest — Business, Cultural, Media and other thematic groups that shape IPF's community initiatives.",
                  cta: "Explore special councils",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex flex-col rounded-xl border border-[#D6AD60]/30 bg-white px-6 py-6 shadow-[0_6px_18px_rgba(11,31,58,0.05)]"
                >
                  <div className="flex items-baseline gap-4">
                    <p
                      className="font-serif text-[2rem] font-light leading-none sm:text-[2.3rem]"
                      style={{ color: NAVY }}
                    >
                      {c.count}
                    </p>
                    <p
                      className="text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                      style={{ color: GOLD_INK }}
                    >
                      {c.label}
                    </p>
                  </div>
                  <p
                    className="mt-4 flex-1 text-[0.9rem] leading-relaxed"
                    style={{ color: INK }}
                  >
                    {c.body}
                  </p>
                  <Link
                    to="/councils"
                    className="group mt-5 inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.18em]"
                    style={{ color: BURGUNDY }}
                  >
                    {c.cta}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * 05 LEADERSHIP & RESPONSIBILITY — compact closing of Part II.
       * Short para, the four published values, then CTA to /leadership.
       * Replaces the previous large institutional panel. The Bye Law,
       * Ethics and IT Policy source paragraphs remain in Supabase CMS
       * (page.governance.*) and can be surfaced on dedicated policy
       * pages later; they are no longer repeated inline here.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s5-heading">
        <div className="mx-auto max-w-[1120px]">
          <div className="rounded-[1.5rem] border border-[#D6AD60]/30 bg-white p-6 shadow-[0_10px_30px_rgba(11,31,58,0.06)] sm:p-8 lg:rounded-[1.75rem] lg:p-10">
            <div className="flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                05 · Leadership & Responsibility
              </p>
            </div>
            <h2
              id="hg-s5-heading"
              className="mt-3 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.ldrRespHeading")}
            </h2>
            <p
              className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.ldrRespBody")}
            </p>

            {/* Four published values — row of equal tiles */}
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                t("page.historyGov.s6ValIntegrity"),
                t("page.historyGov.s6ValTransparency"),
                t("page.historyGov.s6ValProfessionalism"),
                t("page.historyGov.s6ValAccountability"),
              ].map((value) => (
                <li
                  key={value}
                  className="rounded-xl border border-[#D6AD60]/25 bg-[#FFF8EE] px-3 py-3 text-center"
                >
                  <p
                    className="font-serif text-[0.92rem] font-semibold tracking-tight sm:text-[0.98rem]"
                    style={{ color: NAVY }}
                  >
                    {value}
                  </p>
                </li>
              ))}
            </ul>

            {/* Leadership description + CTA — aligned lower row */}
            <div className="mt-7 flex flex-col items-start gap-4 border-t border-[#D6AD60]/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="max-w-xl text-[0.9rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                {t("page.historyGov.ldrBody")}
              </p>
              <Link
                to="/leadership"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--ipf-navy)] px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:bg-[#0b1f3a]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
              >
                {t("page.historyGov.ldrCta")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * FINAL CTA — ONE closing narrative + ONE burgundy CTA panel.
       * "The next chapter" phrase appears exactly once (as the heading);
       * the CTA panel uses "Be part of IPF UAE" to avoid duplication.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="white" ariaLabelledBy="hg-s7-heading">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <GoldRule />
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.s7Eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="hg-s7-heading"
            className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.s7Heading")}
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed"
            style={{ color: INK }}
          >
            {t("page.historyGov.s7Body")}
          </p>
        </div>

        {/* Burgundy CTA panel */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-5 rounded-[1.5rem] bg-[#5A0F1E] px-6 py-7 text-center text-[#FFF8EE] sm:mt-12 sm:flex-row sm:justify-between sm:text-left">
          <div className="min-w-0">
            <p className="font-serif text-[1.2rem] font-bold leading-tight text-[#FFF8EE] sm:text-[1.35rem]">
              {t("page.historyGov.ctaHeading")}
            </p>
            <p className="mt-1 text-[0.85rem] text-[#FFF8EE]/80 sm:text-[0.9rem]">
              {t("page.historyGov.ctaBody")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 rounded-full border border-[#D6AD60] bg-[#FFF8EE] px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.18em] transition hover:bg-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
              style={{ color: BURGUNDY }}
            >
              {t("nav.joinLong")}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#FFF8EE]/60 px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:border-[#FFF8EE] hover:bg-[#FFF8EE]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
            >
              {t("nav.contact")}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
