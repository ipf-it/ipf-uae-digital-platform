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
const COVID_WELFARE_IMG = "/legacy-assets/images/community-support.png";
const COVID_CHECKPOINT_IMG = "/legacy-assets/images/covid-check-point-sharjah.jpg";
const AJMAN_INAUGURATION_IMG = "/legacy-assets/images/slider1.jpg";

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

function Lotus({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className="block"
    >
      <g fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
        <path d="M24 6 C 20 12, 20 18, 24 24 C 28 18, 28 12, 24 6 Z" />
        <path d="M24 42 C 20 36, 20 30, 24 24 C 28 30, 28 36, 24 42 Z" />
        <path d="M6 24 C 12 20, 18 20, 24 24 C 18 28, 12 28, 6 24 Z" />
        <path d="M42 24 C 36 20, 30 20, 24 24 C 30 28, 36 28, 42 24 Z" />
        <path d="M12 12 C 16 15, 20 19, 24 24 C 19 20, 15 16, 12 12 Z" />
        <path d="M36 12 C 32 15, 28 19, 24 24 C 29 20, 33 16, 36 12 Z" />
        <path d="M12 36 C 16 33, 20 29, 24 24 C 19 28, 15 32, 12 36 Z" />
        <path d="M36 36 C 32 33, 28 29, 24 24 C 29 28, 33 32, 36 36 Z" />
      </g>
      <circle cx="24" cy="24" r="3" fill={GOLD} />
    </svg>
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
        artworkPosition="object-[72%_center]"
      />

      {/* ──────────────────────────────────────────────────────────────
       * §2 How It Began — typography-led (no 2014 photo exists)
       * ────────────────────────────────────────────────────────────── */}
      <Section tone="ivory" ariaLabelledBy="hg-s2-heading">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <GoldRule />
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.historyGov.s2Eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="hg-s2-heading"
            className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
            style={{ color: NAVY }}
          >
            {t("page.historyGov.s2Heading")}
          </h2>
        </div>

        <div
          className="mx-auto mt-10 max-w-2xl space-y-5 text-[0.98rem] leading-relaxed sm:text-[1.02rem]"
          style={{ color: INK }}
        >
          <p>{t("page.historyGov.s2Body1")}</p>
          <p>{t("page.historyGov.s2Body2")}</p>
        </div>

        <div className="mt-10 flex justify-center">
          <Lotus size={36} />
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

        {/* The single curved institutional panel */}
        <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#D6AD60]/25 bg-[#FFFDF8] p-6 shadow-[0_12px_32px_rgba(11,31,58,0.08)] sm:mt-12 sm:p-10 lg:rounded-[2.25rem] lg:p-14">
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
       * §7 Continuing the Journey + reused Join/Contact CTA
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
