import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { presidentMessageBody } from "../data/platformContent";
import { api } from "../lib/api";
import {
  useLeadership,
  useOrgChapters,
  type LeadershipEntry,
} from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * LeadershipPage — premium institutional presentation of IPF UAE's
 * elected leadership (post-redesign, 6 Oct 2026).
 *
 * HERO: approved Watercolour Statue of Unity Panorama — unchanged.
 *
 * BELOW HERO (new, replaces the previous CommitteeHierarchy pyramid):
 *   §01 Leadership introduction — restrained editorial band
 *   §02 President feature       — large portrait + name + designation +
 *                                 approved President's message
 *   §03 Central Leadership       — flat 3-column premium grid of central
 *                                 team members with portraits; separate
 *                                 clean typographic list for members
 *                                 without portraits (NO fake avatars)
 *   §04 Chapter Leadership      — Convenors across the 7 UAE chapters,
 *                                 compact premium cards; absence of a
 *                                 convenor record is flagged (not faked)
 *   §05 Leadership Principles   — Integrity · Transparency ·
 *                                 Professionalism · Accountability
 *   §06 Closing editorial band  — pointer to /chapters and /councils
 *
 * Data source
 *   `useLeadership("global")`  → /api/org/leadership?scopeType=global
 *   `useOrgChapters()`         → /api/org/chapters
 *   per-chapter leadership     → /api/org/leadership?scopeType=chapter
 *                                &scopeId=... (fetched inline below)
 *   President message body     → src/data/platformContent.ts →
 *                                presidentMessageBody (approved)
 *
 * NO PYRAMID. NO fake data. NO private contacts exposed (the API already
 * masks phones/emails when show_contact=false).
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

/* The 7 authoritative UAE chapters from the 2026 structure.
   Order follows the approved brief (Dubai first, then UAE east↔west).
   Mapped to the chapter ids served by /api/org/chapters. */
const CHAPTER_SLUGS = [
  { slug: "dubai", label: "Dubai" },
  { slug: "sharjah", label: "Sharjah" },
  { slug: "ajman", label: "Ajman" },
  { slug: "umm-al-quwain", label: "Umm Al Quwain" },
  { slug: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { slug: "abu-dhabi", label: "Abu Dhabi" },
  { slug: "al-ain", label: "Al Ain" },
] as const;

function isConvenor(title: string): boolean {
  const t = title.trim().toLowerCase();
  // Match "Convenor" / "Chapter Convenor" but NOT "Co-Convenor".
  return /^(chapter\s+)?convenor\b/.test(t);
}

function Initials({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[#FFF8EE] font-serif text-[2rem] font-semibold tracking-tight ${className}`}
      style={{ color: GOLD_INK }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

type ChapterConvenorRow = {
  slug: string;
  label: string;
  convenor: LeadershipEntry | null;
};

function useChapterConvenors(): { rows: ChapterConvenorRow[]; ready: boolean } {
  const { locale } = useLocale();
  const [rows, setRows] = useState<ChapterConvenorRow[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    setReady(false);
    (async () => {
      const results = await Promise.all(
        CHAPTER_SLUGS.map(async ({ slug, label }) => {
          try {
            const d = await api<{ leadership: LeadershipEntry[] }>(
              `/api/org/leadership?scopeType=chapter&scopeId=${slug}&locale=${locale}`,
            );
            const convenor = d.leadership.find((e) => isConvenor(e.positionTitle)) ?? null;
            return { slug, label, convenor };
          } catch {
            return { slug, label, convenor: null };
          }
        }),
      );
      if (active) {
        setRows(results);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [locale]);
  return { rows, ready };
}

export default function LeadershipPage() {
  const { t } = useLocale();
  const { leadership } = useLeadership("global");
  const { chapters } = useOrgChapters();
  const { rows: chapterConvenors } = useChapterConvenors();

  // President = the top-ranked global record whose positionTitle starts
  // with "President". Falls back to the first global entry if the data
  // ever changes shape — avoids crashing the page on an empty API.
  const president = leadership.find((p) => /^president\b/i.test(p.positionTitle)) ?? leadership[0];
  const rest = leadership.filter((p) => p.id !== president?.id);
  const centralWithPhoto = rest.filter((p) => p.personImage);
  const centralWithoutPhoto = rest.filter((p) => !p.personImage);

  // Known chapter names from the directory service, keyed for the
  // "Chapter Leadership" tile labels (fallback to the hardcoded label
  // if the chapter record isn't in the directory yet).
  const chapterNameById = new Map(chapters.map((c) => [c.id, c.name]));

  const principles = [
    { label: "Integrity", body: "Honest conduct in every community engagement." },
    { label: "Transparency", body: "Open communication within organisational practice." },
    { label: "Professionalism", body: "Measured, dignified service across the Emirates." },
    { label: "Accountability", body: "Shared responsibility to the Indian community in the UAE." },
  ];

  return (
    <>
      <DocumentTitle title={t("page.leadership.title")} />

      {/* ──────────────── HERO — APPROVED, UNCHANGED ──────────────── */}
      <IllustratedHero
        eyebrow={t("page.leadership.eyebrow")}
        title={t("page.leadership.title")}
        description={t("page.leadership.desc", { name: "Shri Jitendra Vaidya" })}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("page.leadership.title") }]}
        artworkPng="/images/leadership/leadership-hero-statue-of-unity.png"
        artworkWebp="/images/leadership/leadership-hero-statue-of-unity.webp"
        artworkAlt="Watercolour illustration featuring the Statue of Unity and the Indian national flag"
        artworkPosition="object-[72%_center] md:object-[70%_center] lg:object-[65%_center] xl:object-[62%_30%] 2xl:object-[60%_30%]"
        textMaxWidth="max-w-[440px]"
      />

      {/* ──────────────── 01 · INTRODUCTION ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-18 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                Leadership
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2 className="mt-5 font-serif text-[1.85rem] font-bold leading-[1.1] tracking-tight sm:text-[2.2rem] lg:text-[2.5rem]" style={{ color: NAVY }}>
              Leadership rooted in service and responsibility.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed sm:text-[1.02rem]" style={{ color: INK }}>
              Indian People's Forum UAE is guided by a Central Committee and a network of Chapter Convenors across the Emirates — volunteers chosen to coordinate community service, cultural programmes and welfare activity on behalf of the forum.
            </p>
          </div>
        </Container>
      </Section>

      {/* ──────────────── 02 · PRESIDENT FEATURE ──────────────── */}
      {president ? (
        <section
          aria-labelledby="ldr-president-heading"
          className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
        >
          <Container>
            <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-16">
              {/* Portrait */}
              <figure className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[0.75rem] bg-[#FFF8EE] shadow-[0_18px_44px_rgba(11,31,58,0.14)] ring-1 ring-[#D6AD60]/30 lg:mx-0">
                {president.personImage ? (
                  <img
                    src={president.personImage}
                    alt={`${president.personName}, ${president.positionTitle}`}
                    loading="eager"
                    decoding="async"
                    className="block aspect-[4/5] w-full object-cover object-top"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full">
                    <Initials name={president.personName} />
                  </div>
                )}
              </figure>

              {/* Editorial copy */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                    Office of the President
                  </p>
                </div>
                <h2
                  id="ldr-president-heading"
                  className="mt-4 font-serif text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-[2.4rem] lg:text-[2.75rem]"
                  style={{ color: NAVY }}
                >
                  {president.personName}
                </h2>
                <p className="mt-3 text-[0.95rem] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD_INK }}>
                  {president.positionTitle}
                </p>
                <div className="mt-7 space-y-4 border-l-2 pl-6 text-[0.98rem] leading-relaxed sm:text-[1.02rem]" style={{ color: INK, borderColor: `${GOLD}99` }}>
                  {presidentMessageBody.slice(0, 2).map((paragraph) => (
                    <p key={paragraph.slice(0, 60)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Remainder of the approved President's message — restrained
               continuation below the two-column feature */}
            {presidentMessageBody.length > 2 ? (
              <article className="mx-auto mt-14 max-w-3xl space-y-5 text-[0.98rem] leading-relaxed sm:text-[1.02rem]" style={{ color: INK }}>
                {presidentMessageBody.slice(2).map((paragraph) => (
                  <p key={paragraph.slice(0, 60)}>{paragraph}</p>
                ))}
              </article>
            ) : null}
          </Container>
        </section>
      ) : null}

      {/* ──────────────── 03 · CENTRAL LEADERSHIP ──────────────── */}
      {rest.length > 0 ? (
        <Section tone="ivory" className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                  Central Leadership
                </p>
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              </div>
              <h2 className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.2rem]" style={{ color: NAVY }}>
                The Central Committee of IPF UAE
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                The Central Committee leads the forum alongside Chapter Convenors from each Emirate.
              </p>
            </div>

            {/* Members WITH portraits — premium 3-column grid */}
            {centralWithPhoto.length > 0 ? (
              <ul role="list" className="mx-auto mt-12 grid max-w-[1180px] grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 sm:mt-14 lg:grid-cols-3">
                {centralWithPhoto.map((member) => (
                  <li key={member.id} className="group">
                    <figure className="overflow-hidden rounded-[0.5rem] bg-white shadow-[0_10px_28px_rgba(11,31,58,0.08)] ring-1 ring-[#D6AD60]/25">
                      <img
                        src={member.personImage}
                        alt={`${member.personName}, ${member.positionTitle}`}
                        loading="lazy"
                        decoding="async"
                        className="block aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-[1.015]"
                      />
                    </figure>
                    <div className="mt-5">
                      <h3 className="font-serif text-[1.15rem] font-bold leading-tight tracking-tight sm:text-[1.25rem]" style={{ color: NAVY }}>
                        {member.personName}
                      </h3>
                      <p className="mt-1.5 text-[0.85rem] font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD_INK }}>
                        {member.positionTitle}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Members WITHOUT portraits — refined typographic list, NO
               fake avatars. One row per person, name LEFT, designation
               RIGHT, hairline divider between rows. */}
            {centralWithoutPhoto.length > 0 ? (
              <div className="mx-auto mt-16 max-w-[1180px] sm:mt-20">
                <div className="mb-6 flex items-baseline gap-4">
                  <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                    Extended Central Committee
                  </p>
                </div>
                <ul role="list" className="divide-y divide-[#D6AD60]/25 border-y border-[#D6AD60]/25">
                  {centralWithoutPhoto.map((member) => (
                    <li key={member.id} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[1.1fr_1fr] sm:items-baseline sm:gap-6 sm:py-5">
                      <p className="font-serif text-[1.05rem] font-semibold leading-tight tracking-tight sm:text-[1.1rem]" style={{ color: NAVY }}>
                        {member.personName}
                      </p>
                      <p className="text-[0.88rem] font-medium leading-tight sm:text-[0.92rem]" style={{ color: MUTED }}>
                        {member.positionTitle}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {/* ──────────────── 04 · CHAPTER LEADERSHIP (CONVENORS) ──────────────── */}
      <Section tone="white" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                Chapter Leadership
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2 className="mt-5 font-serif text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.2rem]" style={{ color: NAVY }}>
              Convenors across the Emirates
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
              Each UAE chapter is led by a Convenor who coordinates local community activity on behalf of IPF UAE.
            </p>
          </div>

          <ul role="list" className="mx-auto mt-12 grid max-w-[1180px] grid-cols-1 gap-x-6 gap-y-10 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {chapterConvenors.map(({ slug, label, convenor }) => {
              const chapterName = chapterNameById.get(slug) ?? label;
              return (
                <li key={slug}>
                  <Link
                    to={`/chapters/${slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-[0.5rem] bg-[#FFFDF8] shadow-[0_8px_22px_rgba(11,31,58,0.06)] ring-1 ring-[#D6AD60]/25 transition hover:shadow-[0_14px_32px_rgba(11,31,58,0.12)]">
                      {convenor?.personImage ? (
                        <img
                          src={convenor.personImage}
                          alt={`${convenor.personName}, Convenor — IPF ${chapterName}`}
                          loading="lazy"
                          decoding="async"
                          className="block aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-[1.015]"
                        />
                      ) : (
                        <div className="aspect-[4/5] w-full">
                          <Initials name={convenor?.personName ?? chapterName} />
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                        {chapterName}
                      </p>
                      <p className="mt-2 font-serif text-[1.05rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                        {convenor?.personName ?? "Convenor to be announced"}
                      </p>
                      <p className="mt-1 text-[0.82rem] font-medium" style={{ color: MUTED }}>
                        {convenor ? "Convenor" : "Chapter leadership"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* ──────────────── 05 · LEADERSHIP PRINCIPLES ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                Leadership Principles
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2 className="mt-5 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.9rem] lg:text-[2.1rem]" style={{ color: NAVY }}>
              Four values that guide every engagement
            </h2>
          </div>

          <ul role="list" className="mx-auto mt-10 grid max-w-[1180px] grid-cols-2 gap-5 sm:mt-12 lg:grid-cols-4">
            {principles.map((p, i) => (
              <li key={p.label} className="border-t pt-5" style={{ borderColor: `${GOLD}99` }}>
                <p className="font-serif text-[0.72rem] font-bold tabular-nums" style={{ color: GOLD_INK }}>
                  0{i + 1}
                </p>
                <p className="mt-3 font-serif text-[1.1rem] font-bold leading-tight tracking-tight sm:text-[1.2rem]" style={{ color: NAVY }}>
                  {p.label}
                </p>
                <p className="mt-2 text-[0.88rem] leading-relaxed" style={{ color: MUTED }}>
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ──────────────── 06 · CLOSING EDITORIAL BAND ──────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-18">
        <Container>
          <div className="mx-auto grid max-w-[1180px] items-center gap-8 rounded-[1.5rem] border border-[#D6AD60]/30 bg-[#FFFDF8] px-6 py-10 shadow-[0_14px_38px_rgba(11,31,58,0.06)] sm:px-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                  The Wider Network
                </p>
              </div>
              <h2 className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]" style={{ color: NAVY }}>
                Explore the chapters and councils that bring IPF UAE to life.
              </h2>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                Beyond Central Leadership, IPF UAE operates through seven chapters across the Emirates and nineteen state and special councils that organise community initiatives.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-end">
              <Link
                to="/chapters"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ipf-navy)] px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:bg-[#0b1f3a]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
              >
                Explore chapters
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/councils"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ipf-navy)]/80 bg-transparent px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] transition hover:bg-[var(--ipf-navy)]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
                style={{ color: NAVY }}
              >
                Explore councils
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
