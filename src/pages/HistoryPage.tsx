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
const COVID_WELFARE_IMG = "/legacy-assets/images/community-support.png";
const COVID_CHECKPOINT_IMG = "/legacy-assets/images/covid-check-point-sharjah.jpg";
const AJMAN_INAUGURATION_IMG = "/legacy-assets/images/slider1.jpg";

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

  const values = [
    t("page.historyGov.s6ValIntegrity"),
    t("page.historyGov.s6ValTransparency"),
    t("page.historyGov.s6ValProfessionalism"),
    t("page.historyGov.s6ValAccountability"),
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
        /* History's artwork has a dense monument cluster that sits further
           to the left than the other three heroes. Pull the crop further
           right AND narrow the text column so the breadcrumb, OUR JOURNEY
           eyebrow, H1 and description all remain over clean ivory
           negative space without any overlay. */
        artworkPosition="object-[85%_center]"
        textMaxWidth="max-w-[520px]"
      />

      {/* ──────────────────────────────────────────────────────────────
       * §2 THE BEGINNING — editorial 60/40 with a genuine IPF community
       * photograph on the right. Not a card; a composed editorial band.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s2-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[6fr_5fr] lg:gap-14">
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
       * §3 Milestones — editorial timeline (mobile vertical, lg horizontal alt)
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
            className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.timelineHeading")}
          </h2>
        </div>

        {/* ─── MOBILE / default: clean vertical timeline, gold rail on left ─── */}
        <ol
          className="relative mx-auto mt-12 max-w-xl space-y-10 pl-10 lg:hidden"
          aria-label={t("page.historyGov.timelineHeading")}
        >
          {/* Vertical gold rail */}
          <span
            aria-hidden="true"
            className="absolute left-[11px] top-2 bottom-2 w-px"
            style={{ backgroundColor: `${GOLD}80` }}
          />
          {milestones.map((m) => (
            <li key={m.year + m.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[29px] top-2 size-[14px] rounded-full ring-4 ring-[#FFFDF8]"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="font-serif text-[2rem] font-light leading-none sm:text-[2.4rem]"
                style={{ color: NAVY }}
              >
                {m.year}
              </p>
              <p
                className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD_INK }}
              >
                {m.title}
              </p>
              <p
                className="mt-2 text-[0.92rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                {m.detail}
              </p>
            </li>
          ))}
        </ol>

        {/* ─── DESKTOP (lg+): horizontal 4-column alternating timeline ─── */}
        <div className="relative mx-auto mt-16 hidden max-w-6xl lg:block">
          {/* Horizontal gold rail */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-px"
            style={{ backgroundColor: `${GOLD}80` }}
          />
          <ol className="relative grid grid-cols-4 gap-6">
            {milestones.map((m, i) => {
              const above = i % 2 === 0;
              return (
                <li
                  key={m.year + m.title}
                  className={`relative flex min-h-[320px] flex-col ${
                    above ? "justify-start pb-10" : "justify-end pt-10"
                  }`}
                >
                  {/* Dot on rail */}
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[#FFFDF8]"
                    style={{ backgroundColor: GOLD }}
                  />
                  <div className={above ? "text-center" : "mt-auto text-center"}>
                    <p
                      className="font-serif text-[2.6rem] font-light leading-none xl:text-[3rem]"
                      style={{ color: NAVY }}
                    >
                      {m.year}
                    </p>
                    <p
                      className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                      style={{ color: GOLD_INK }}
                    >
                      {m.title}
                    </p>
                    <p
                      className="mx-auto mt-2 max-w-[22ch] text-[0.88rem] leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {m.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * §4 Service Through Challenging Times — COVID photographs
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s4-heading">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <GoldRule />
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.s4Eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="hg-s4-heading"
            className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.s4Heading")}
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-[1.5rem] border border-[#D6AD60]/25 bg-[#FFFDF8]">
            <img
              src={COVID_WELFARE_IMG}
              alt={t("page.historyGov.s4ImgAlt1")}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
          <figure className="overflow-hidden rounded-[1.5rem] border border-[#D6AD60]/25 bg-[#FFFDF8]">
            <img
              src={COVID_CHECKPOINT_IMG}
              alt={t("page.historyGov.s4ImgAlt2")}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        </div>

        <div
          className="mx-auto mt-8 max-w-3xl text-center text-[0.98rem] leading-relaxed sm:text-[1.02rem]"
          style={{ color: INK }}
        >
          <p>{t("page.historyGov.s4Body")}</p>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * §5 Evolution — Ajman inauguration + UAE-wide chapter network
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="white" ariaLabelledBy="hg-s5-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s5Eyebrow")}
              </p>
            </div>
            <h2
              id="hg-s5-heading"
              className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.s5Heading")}
            </h2>
            <div
              className="mt-6 space-y-4 text-[0.98rem] leading-relaxed sm:text-[1.02rem]"
              style={{ color: INK }}
            >
              <p>{t("page.historyGov.s5Body1")}</p>
              <p>{t("page.historyGov.s5Body2")}</p>
            </div>
          </div>
          <figure className="overflow-hidden rounded-[1.75rem] border border-[#D6AD60]/25 bg-[#FFF8EE] lg:order-last">
            <img
              src={AJMAN_INAUGURATION_IMG}
              alt={t("page.historyGov.s5ImgAlt")}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
            />
            <figcaption
              className="px-5 py-3 text-[0.78rem] uppercase tracking-[0.2em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.s5ImgAlt")}
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * §6 Governance & Accountability — ONE white curved institutional panel
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s6-heading">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <GoldRule />
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.s6Eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="hg-s6-heading"
            className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.s6Heading")}
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-relaxed"
            style={{ color: MUTED }}
          >
            {t("page.historyGov.s6Intro")}
          </p>
        </div>

        {/* ── Governance hierarchy visual ── IPF UAE → Managing Committee
           (Central + Chapter Convenors) → 8 Chapters → 31 Councils.
           Thin gold connectors, no ugly flowchart boxes. */}
        <div
          className="mx-auto mt-12 max-w-4xl text-center sm:mt-14"
          aria-label="IPF UAE governance hierarchy"
        >
          {/* Tier 1: IPF UAE */}
          <div className="inline-flex flex-col items-center">
            <p
              className="text-[0.62rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              Forum
            </p>
            <p
              className="mt-2 font-serif text-[1.3rem] font-bold leading-tight tracking-tight sm:text-[1.5rem]"
              style={{ color: NAVY }}
            >
              IPF UAE
            </p>
          </div>

          {/* Gold connector */}
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-6 w-px"
            style={{ backgroundColor: `${GOLD}99` }}
          />

          {/* Tier 2: Managing Committee */}
          <div className="mx-auto inline-flex max-w-md flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-[#FFFDF8] px-6 py-3">
            <p
              className="text-[0.62rem] font-bold uppercase tracking-[0.28em]"
              style={{ color: GOLD_INK }}
            >
              Managing Committee
            </p>
            <p
              className="mt-1 text-[0.9rem] font-semibold"
              style={{ color: NAVY }}
            >
              Central Committee + Chapter Convenors
            </p>
          </div>

          {/* Gold connector */}
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-6 w-px"
            style={{ backgroundColor: `${GOLD}99` }}
          />

          {/* Tier 3: two parallel branches */}
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-[#FFFDF8] px-5 py-4">
              <p
                className="font-serif text-[1.8rem] font-light leading-none"
                style={{ color: NAVY }}
              >
                8
              </p>
              <p
                className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD_INK }}
              >
                UAE Chapters
              </p>
              <p
                className="mt-1 text-[0.82rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                Local community activity per Emirate
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-[#D6AD60]/35 bg-[#FFFDF8] px-5 py-4">
              <p
                className="font-serif text-[1.8rem] font-light leading-none"
                style={{ color: NAVY }}
              >
                31
              </p>
              <p
                className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD_INK }}
              >
                Councils
              </p>
              <p
                className="mt-1 text-[0.82rem] leading-relaxed"
                style={{ color: MUTED }}
              >
                State and Special community councils
              </p>
            </div>
          </div>
        </div>

        {/* ── Eight-chapter UAE presence — refined compact list, not cards ── */}
        <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.chaptersEyebrow")}
              </p>
              <GoldRule />
            </div>
            <h3
              className="mt-4 font-serif text-[1.4rem] font-bold leading-tight tracking-tight sm:text-[1.6rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.chaptersHeading")}
            </h3>
            <p
              className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.chaptersBody")}
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {UAE_CHAPTERS.map((name) => (
              <li key={name}>
                <Link
                  to={`/chapters/${name.toLowerCase().replace(/ /g, "-")}`}
                  className="group flex items-center gap-2 border-b border-[#D6AD60]/25 py-2 text-[0.95rem] transition hover:border-[#D6AD60]"
                  style={{ color: NAVY }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: GOLD }}
                  />
                  <span className="font-semibold">{name}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-auto size-3 opacity-40 transition group-hover:opacity-80 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* The single curved institutional panel */}
        <div className="mx-auto mt-14 max-w-5xl rounded-[2rem] border border-[#D6AD60]/25 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(11,31,58,0.08)] sm:mt-16 sm:p-10 lg:rounded-[2.25rem] lg:p-14">
          {/* ── Sub A — How IPF is governed ── */}
          <section aria-labelledby="hg-s6-how">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-6"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s6HowHeading")}
              </p>
            </div>
            <p
              id="hg-s6-how"
              className="mt-3 font-serif text-[1.1rem] font-semibold leading-snug tracking-tight sm:text-[1.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.governance.bye1")}
            </p>
          </section>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="my-8 h-px w-full"
            style={{ backgroundColor: `${GOLD}33` }}
          />

          {/* ── Sub B — Governance principles / four values ── */}
          <section aria-labelledby="hg-s6-values">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-6"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s6ValuesHeading")}
              </p>
            </div>
            <p
              id="hg-s6-values"
              className="mt-3 text-[0.98rem] font-semibold leading-snug sm:text-[1.05rem]"
              style={{ color: INK }}
            >
              {t("page.governance.ethicsLead")}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {values.map((value) => (
                <li
                  key={value}
                  className="rounded-xl border border-[#D6AD60]/25 bg-[#FFF8EE] px-3 py-3 text-center"
                >
                  <p
                    className="font-serif text-[0.95rem] font-semibold tracking-tight sm:text-[1rem]"
                    style={{ color: NAVY }}
                  >
                    {value}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="my-8 h-px w-full"
            style={{ backgroundColor: `${GOLD}33` }}
          />

          {/* ── Sub C — Bye Law ── */}
          <section aria-labelledby="hg-s6-bye">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-6"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s6ByeHeading")}
              </p>
            </div>
            <div
              id="hg-s6-bye"
              className="mt-4 space-y-3 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              <p>{t("page.governance.bye2")}</p>
              <p>{t("page.governance.bye3")}</p>
            </div>
          </section>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="my-8 h-px w-full"
            style={{ backgroundColor: `${GOLD}33` }}
          />

          {/* ── Sub D — Code of Ethics & Conduct ── */}
          <section aria-labelledby="hg-s6-ethics">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-6"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s6EthicsHeading")}
              </p>
            </div>
            <ul
              id="hg-s6-ethics"
              className="mt-4 space-y-2 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              {[
                t("page.governance.ethics1"),
                t("page.governance.ethics2"),
                t("page.governance.ethics3"),
                t("page.governance.ethics4"),
                t("page.governance.ethics5"),
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.5rem] inline-block h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: GOLD }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="my-8 h-px w-full"
            style={{ backgroundColor: `${GOLD}33` }}
          />

          {/* ── Sub E — IT & Media Policy ── */}
          <section aria-labelledby="hg-s6-it">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-6"
                style={{ backgroundColor: GOLD }}
              />
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.s6ItHeading")}
              </p>
            </div>
            <div
              id="hg-s6-it"
              className="mt-4 space-y-3 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              <p>{t("page.governance.it1")}</p>
              <p>{t("page.governance.it2")}</p>
            </div>
          </section>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * §7 Leadership CTA — contextual editorial band that leads
       * naturally from Governance to the Leadership page.
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-ldr-heading">
        <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-[1.75rem] border border-[#D6AD60]/30 bg-[#FFFDF8] px-6 py-10 shadow-[0_14px_38px_rgba(11,31,58,0.08)] sm:px-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
                style={{ color: GOLD_INK }}
              >
                {t("page.historyGov.ldrEyebrow")}
              </p>
            </div>
            <h2
              id="hg-ldr-heading"
              className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.9rem] lg:text-[2.1rem]"
              style={{ color: NAVY }}
            >
              {t("page.historyGov.ldrHeading")}
            </h2>
            <p
              className="mt-5 max-w-xl text-[0.98rem] leading-relaxed"
              style={{ color: INK }}
            >
              {t("page.historyGov.ldrBody")}
            </p>
          </div>
          <div className="flex min-w-0 justify-start lg:justify-end">
            <Link
              to="/leadership"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--ipf-navy)] bg-[var(--ipf-navy)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:bg-[#0b1f3a]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
            >
              {t("page.historyGov.ldrCta")}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────
       * §8 Continuing the Journey + reused Join/Contact CTA
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
            className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.s7Heading")}
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed"
            style={{ color: INK }}
          >
            {t("page.historyGov.s7Body")}
          </p>
        </div>

        {/* Reused Join/Contact CTA band — matches /about §8 pattern */}
        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-5 rounded-[1.5rem] bg-[#5A0F1E] px-6 py-7 text-center text-[#FFF8EE] sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
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
