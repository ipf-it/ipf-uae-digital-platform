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
 * LeadershipPage — final premium design pass (6 Oct 2026).
 *
 * HERO: approved Watercolour Statue of Unity Panorama — LOCKED.
 *
 * Post-hero
 *   01 Compact introduction
 *   02 Office of the President — portrait + institutional letter
 *   03 Central Leadership — 4-column premium portrait grid (lg+)
 *      with institutional placeholder for members without a photo
 *   03b Extended Central Committee — compact 2-column executive directory
 *   04 Chapter Leadership — 4+3 convenor layout across the 7 UAE chapters
 *   05 Leadership Principles — polished 4-column (unchanged structure)
 *   06 The Wider Network — closing editorial band
 *
 * Data stays live: useLeadership("global"), useOrgChapters(),
 * per-chapter /api/org/leadership. presidentMessageBody is the approved
 * CMS-compatible fallback until a dedicated CMS field exists.
 *
 * No pyramid. No fake avatars. No private contacts.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

const CHAPTER_SLUGS = [
  { slug: "dubai", label: "Dubai" },
  { slug: "sharjah", label: "Sharjah" },
  { slug: "ajman", label: "Ajman" },
  { slug: "umm-al-quwain", label: "Umm Al Quwain" },
  { slug: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { slug: "abu-dhabi", label: "Abu Dhabi" },
  { slug: "al-ain", label: "Al Ain" },
] as const;

/* Image URLs we must NOT treat as real portraits — the historical seed
   contains at least one illustration (RB.png) which does not belong in
   an executive portrait grid. Match on filename to protect against path
   changes elsewhere in /legacy-assets. */
const ILLUSTRATION_FALLBACK_FILES = new Set(["RB.png"]);

function isRealPortrait(src?: string): boolean {
  if (!src) return false;
  const file = src.split("/").pop() ?? "";
  return !ILLUSTRATION_FALLBACK_FILES.has(file);
}

function isConvenor(title: string): boolean {
  const t = title.trim().toLowerCase();
  return /^(chapter\s+)?convenor\b/.test(t);
}

/* Institutional placeholder — ivory frame, extremely subtle mandala-
   inspired geometry, person's initials in refined serif typography.
   Communicates "official portrait not currently available" rather than
   "broken image". Used in portrait grids ONLY (never in the letter). */
function PortraitPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#FFF8EE]"
      aria-hidden="true"
    >
      {/* Subtle mandala-inspired SVG geometry — very low opacity */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="placeholderRadial" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#D6AD60" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#D6AD60" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#placeholderRadial)" />
        {/* Concentric circles — Ashoka-inspired geometry */}
        <g fill="none" stroke="#D6AD60" strokeOpacity="0.14">
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="50" />
          <circle cx="100" cy="100" r="30" />
        </g>
        {/* 8-petal radial lines */}
        <g stroke="#D6AD60" strokeOpacity="0.12">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x = 100 + Math.cos(angle) * 70;
            const y = 100 + Math.sin(angle) * 70;
            return <line key={i} x1="100" y1="100" x2={x} y2={y} />;
          })}
        </g>
      </svg>
      <p
        className="relative font-serif text-[2rem] font-semibold tracking-tight sm:text-[2.2rem]"
        style={{ color: GOLD_INK }}
      >
        {initials}
      </p>
    </div>
  );
}

/* Standard portrait frame — consistent 4:5 aspect, ivory background,
   restrained gold hairline, premium executive feel. Renders a real
   portrait OR the institutional placeholder, never a cartoon avatar. */
function PortraitFrame({
  src,
  alt,
  name,
}: {
  src?: string;
  alt: string;
  name: string;
}) {
  const real = isRealPortrait(src);
  return (
    <figure className="relative overflow-hidden rounded-[18px] bg-[#FFF8EE] shadow-[0_6px_18px_rgba(11,31,58,0.06)] ring-1 ring-[#D6AD60]/30">
      <div className="aspect-[4/5] w-full">
        {real && src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover object-top"
          />
        ) : (
          <PortraitPlaceholder name={name} />
        )}
      </div>
    </figure>
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

  const president =
    leadership.find((p) => /^president\b/i.test(p.positionTitle)) ?? leadership[0];
  const rest = leadership.filter((p) => p.id !== president?.id);

  /* Central grid = real-portrait members only (preserves API ordering).
     Members with no real portrait go to the Extended Committee directory
     — no fake avatars, no illustrated placeholders among real portraits. */
  const centralWithPhoto = rest.filter((p) => isRealPortrait(p.personImage));
  const extended = rest.filter((p) => !isRealPortrait(p.personImage));

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

      {/* ──────────────── HERO — APPROVED, LOCKED, UNCHANGED ──────────────── */}
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

      {/* ──────────────── 01 · INTRODUCTION (compact) ──────────────── */}
      <section
        aria-labelledby="ldr-intro-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE] py-10 sm:py-12 lg:py-14"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Leadership
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              id="ldr-intro-heading"
              className="mt-4 font-serif text-[1.55rem] font-bold leading-[1.1] tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
              style={{ color: NAVY }}
            >
              Leadership rooted in service and responsibility.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
              Indian People's Forum UAE is guided by a Central Committee and a network of Chapter Convenors across the Emirates — volunteers chosen to coordinate community service, cultural programmes and welfare activity on behalf of the forum.
            </p>
          </div>
        </Container>
      </section>

      {/* ──────────────── 02 · OFFICE OF THE PRESIDENT (upper feature) ────────────────
          Portrait + identity + opening salutation only. Full letter lives
          immediately below in §02b so this upper band stays visually
          premium rather than becoming a long column of body text. */}
      {president ? (
        <section
          aria-labelledby="ldr-president-heading"
          className="relative isolate overflow-hidden bg-[#FFFDF8] py-16 sm:py-20 lg:py-24"
        >
          <Container>
            <div className="mx-auto max-w-[1180px]">
              <div className="mb-10 flex items-center justify-center gap-3 sm:mb-12">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p
                  id="ldr-president-heading"
                  className="text-[0.7rem] font-bold uppercase tracking-[0.3em]"
                  style={{ color: GOLD_INK }}
                >
                  Office of the President
                </p>
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                {/* Portrait */}
                <div className="mx-auto w-full max-w-[380px] lg:mx-0 xl:max-w-[420px]">
                  <PortraitFrame
                    src={president.personImage}
                    alt={`${president.personName}, ${president.positionTitle}`}
                    name={president.personName}
                  />
                </div>

                {/* Identity + salutation only */}
                <div className="min-w-0 text-center lg:text-left">
                  <h2 className="font-serif text-[1.9rem] font-bold leading-[1.08] tracking-tight sm:text-[2.3rem] lg:text-[2.6rem]" style={{ color: NAVY }}>
                    {president.personName}
                  </h2>
                  <p className="mt-3 text-[0.78rem] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD_INK }}>
                    {president.positionTitle} &nbsp;·&nbsp; Indian People's Forum UAE
                  </p>
                  <div
                    aria-hidden="true"
                    className="mx-auto mt-6 h-px w-16 lg:mx-0"
                    style={{ backgroundColor: `${GOLD}99` }}
                  />
                  <div className="mx-auto mt-6 max-w-[560px] space-y-4 text-[1.02rem] leading-[1.7] lg:mx-0" style={{ color: INK }}>
                    {presidentMessageBody.slice(0, 2).map((paragraph) => (
                      <p key={paragraph.slice(0, 60)} className={paragraph === "Dear Friends," ? "font-serif text-[1.15rem] italic" : undefined} style={paragraph === "Dear Friends," ? { color: NAVY } : undefined}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <p className="mt-5 text-[0.78rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD_INK }}>
                    Full address below
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* ──────────────── 02b · PRESIDENT'S MESSAGE (editorial letter) ────────────────
          Full-width warm-ivory panel, antique-gold border, restrained
          mandala corner detailing, narrow reading column (~760px). The
          complete approved message is rendered inline — nothing hidden,
          no accordion, no scrolling textbox. Letter closes with the
          founder-approved signature block beneath the final paragraph. */}
      {president ? (
        <section
          aria-labelledby="ldr-president-letter-heading"
          className="relative isolate overflow-hidden bg-[#FFF8EE] py-16 sm:py-20 lg:py-24"
        >
          <Container>
            <article className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[22px] border border-[#D6AD60]/40 bg-[linear-gradient(180deg,#FFFBF2_0%,#FFFDF8_55%,#FFFBF2_100%)] px-5 py-14 shadow-[0_14px_38px_rgba(11,31,58,0.08)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              {/* Mandala corner ornaments — top-left + bottom-right.
                  Pure SVG, very low opacity, decorative only. */}
              <svg aria-hidden="true" viewBox="0 0 180 180" className="pointer-events-none absolute -left-6 -top-6 h-36 w-36 opacity-[0.09] sm:-left-8 sm:-top-8 sm:h-44 sm:w-44 lg:h-56 lg:w-56">
                <g fill="none" stroke="#D6AD60" strokeWidth="1">
                  <circle cx="90" cy="90" r="78" />
                  <circle cx="90" cy="90" r="60" />
                  <circle cx="90" cy="90" r="42" />
                  <circle cx="90" cy="90" r="24" />
                  {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i * Math.PI) / 12;
                    return (
                      <line
                        key={i}
                        x1={90 + Math.cos(a) * 24}
                        y1={90 + Math.sin(a) * 24}
                        x2={90 + Math.cos(a) * 78}
                        y2={90 + Math.sin(a) * 78}
                      />
                    );
                  })}
                </g>
              </svg>
              <svg aria-hidden="true" viewBox="0 0 180 180" className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 rotate-180 opacity-[0.09] sm:-bottom-8 sm:-right-8 sm:h-44 sm:w-44 lg:h-56 lg:w-56">
                <g fill="none" stroke="#D6AD60" strokeWidth="1">
                  <circle cx="90" cy="90" r="78" />
                  <circle cx="90" cy="90" r="60" />
                  <circle cx="90" cy="90" r="42" />
                  <circle cx="90" cy="90" r="24" />
                  {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i * Math.PI) / 12;
                    return (
                      <line
                        key={i}
                        x1={90 + Math.cos(a) * 24}
                        y1={90 + Math.sin(a) * 24}
                        x2={90 + Math.cos(a) * 78}
                        y2={90 + Math.sin(a) * 78}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Hair-thin tricolour accent, extremely restrained */}
              <div aria-hidden="true" className="absolute left-1/2 top-0 flex -translate-x-1/2 overflow-hidden rounded-b-[2px]">
                <span className="block h-[3px] w-10 bg-[#FF9933]/70" />
                <span className="block h-[3px] w-10 bg-white/80" />
                <span className="block h-[3px] w-10 bg-[#138808]/70" />
              </div>

              <div className="relative mx-auto max-w-[760px]">
                <div className="text-center">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                    President's Message
                  </p>
                  <h2
                    id="ldr-president-letter-heading"
                    className="mt-4 font-serif text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.2rem]"
                    style={{ color: NAVY }}
                  >
                    A letter to the Indian community in the UAE
                  </h2>
                  <div aria-hidden="true" className="mx-auto mt-5 h-px w-20" style={{ backgroundColor: `${GOLD}99` }} />
                </div>

                {/* Full approved message. Paragraphs 0-1 are the salutation
                    (also shown in the upper feature); paragraph 2 is the
                    first substantive paragraph and receives the drop-cap. */}
                <div className="mt-10 space-y-6 text-[1.02rem] leading-[1.85] sm:text-[1.05rem] sm:leading-[1.9]" style={{ color: INK }}>
                  {presidentMessageBody.map((paragraph, i) => {
                    const isGreeting = paragraph === "Dear Friends,";
                    const isFirstBody = i === 2;
                    if (isGreeting) {
                      return (
                        <p
                          key={paragraph}
                          className="font-serif text-[1.2rem] italic sm:text-[1.3rem]"
                          style={{ color: NAVY }}
                        >
                          {paragraph}
                        </p>
                      );
                    }
                    if (isFirstBody) {
                      return (
                        <p key={paragraph.slice(0, 60)}>
                          <span
                            className="float-left mr-3 mt-1 font-serif text-[3.2rem] font-bold leading-[0.85] sm:text-[3.8rem]"
                            style={{ color: GOLD_INK }}
                            aria-hidden="true"
                          >
                            {paragraph.charAt(0)}
                          </span>
                          {paragraph.slice(1)}
                        </p>
                      );
                    }
                    return <p key={paragraph.slice(0, 60)}>{paragraph}</p>;
                  })}
                </div>

                {/* Letter closing signature block */}
                <div aria-hidden="true" className="mt-12 h-px w-24" style={{ backgroundColor: `${GOLD}99` }} />
                <div className="mt-6">
                  <p className="font-serif text-[1.35rem] font-bold leading-tight tracking-tight sm:text-[1.5rem]" style={{ color: NAVY }}>
                    {president.personName}
                  </p>
                  <p className="mt-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD_INK }}>
                    President
                  </p>
                  <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD_INK }}>
                    Indian People's Forum UAE
                  </p>
                </div>
              </div>
            </article>
          </Container>
        </section>
      ) : null}

      {/* ──────────────── 03 · CENTRAL LEADERSHIP ──────────────── */}
      {centralWithPhoto.length > 0 ? (
        <Section tone="ivory" className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                  Central Leadership
                </p>
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              </div>
              <h2 className="mt-5 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]" style={{ color: NAVY }}>
                The Central Committee of IPF UAE
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                The Central Committee leads the forum alongside Chapter Convenors from each Emirate.
              </p>
            </div>

            <ul
              role="list"
              className="mx-auto mt-12 grid max-w-[1180px] grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4"
            >
              {centralWithPhoto.map((member) => (
                <li key={member.id} className="min-w-0">
                  <PortraitFrame
                    src={member.personImage}
                    alt={`${member.personName}, ${member.positionTitle}`}
                    name={member.personName}
                  />
                  <div className="mt-4">
                    <p
                      className="font-serif text-[1rem] font-bold leading-tight tracking-tight sm:text-[1.05rem]"
                      style={{ color: NAVY }}
                    >
                      {member.personName}
                    </p>
                    <p
                      className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: GOLD_INK }}
                    >
                      {member.positionTitle}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* ──────────────── 03b · EXTENDED CENTRAL COMMITTEE ────────────────
          One premium contained institutional directory. The warm India
          + UAE heritage watercolour previously used behind the About
          page "Discover More / Explore IPF further." section is reused
          here as a subtle backdrop. Strong ivory wash on top of it so
          names and designations stay extremely readable. 3-column desktop,
          2-column tablet, 1-column mobile. No cards, no fake photos. */}
      {extended.length > 0 ? (
        <section
          aria-labelledby="ldr-extended-heading"
          className="relative isolate overflow-hidden bg-[#FFF8EE] py-16 sm:py-20 lg:py-24"
        >
          <Container>
            <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[22px] border border-[#D6AD60]/35 shadow-[0_14px_38px_rgba(11,31,58,0.08)]">
              {/* Reused heritage artwork — about-closing-bg.
                  Positioned so its quiet central ivory region sits behind
                  the directory. Decorative only, aria-hidden. */}
              <picture aria-hidden="true">
                <source srcSet="/images/about/about-closing-bg.webp" type="image/webp" />
                <img
                  src="/images/about/about-closing-bg.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                />
              </picture>
              {/* Ivory wash — keeps directory readability without hiding
                  the artwork character. Slightly stronger in the centre
                  via radial-gradient so text contrast peaks where the
                  names sit. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,248,238,0.95) 0%, rgba(255,248,238,0.88) 55%, rgba(255,248,238,0.78) 100%)",
                }}
              />

              <div className="relative px-5 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
                <div className="mx-auto max-w-3xl text-center">
                  <div className="inline-flex items-center gap-3">
                    <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                      Extended Central Committee
                    </p>
                    <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                  </div>
                  <h2
                    id="ldr-extended-heading"
                    className="mt-4 font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
                    style={{ color: NAVY }}
                  >
                    The wider team behind IPF UAE
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                    Senior volunteers who sit on the Central Committee alongside the leadership featured above.
                  </p>
                </div>

                <ul
                  role="list"
                  className="mx-auto mt-10 grid max-w-[1050px] grid-cols-1 gap-x-10 gap-y-0 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {extended.map((member) => (
                    <li
                      key={member.id}
                      className="border-b border-[#D6AD60]/30 py-5 last:border-b-0 sm:py-6"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-[6px] w-[6px] shrink-0 rotate-45"
                          style={{ backgroundColor: GOLD }}
                        />
                        <div className="min-w-0">
                          <p
                            className="font-serif text-[1.05rem] font-bold leading-tight tracking-tight"
                            style={{ color: NAVY }}
                          >
                            {member.personName}
                          </p>
                          <p
                            className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: GOLD_INK }}
                          >
                            {member.positionTitle}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* ──────────────── 04 · CHAPTER LEADERSHIP (4 + 3) ──────────────── */}
      <Section tone="ivory" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Chapter Leadership
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2 className="mt-5 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]" style={{ color: NAVY }}>
              Convenors across the Emirates
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
              Each UAE chapter is led by a Convenor who coordinates local community activity on behalf of IPF UAE.
            </p>
          </div>

          {/* First row — 4 chapters */}
          <ul role="list" className="mx-auto mt-12 grid max-w-[1180px] grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {chapterConvenors.slice(0, 4).map(({ slug, label, convenor }) => {
              const chapterName = chapterNameById.get(slug) ?? label;
              return (
                <ChapterConvenorCard
                  key={slug}
                  slug={slug}
                  chapterName={chapterName}
                  convenor={convenor}
                />
              );
            })}
          </ul>
          {/* Second row — remaining 3 chapters, centred */}
          {chapterConvenors.length > 4 ? (
            <ul role="list" className="mx-auto mt-10 grid max-w-[885px] grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-6">
              {chapterConvenors.slice(4).map(({ slug, label, convenor }) => {
                const chapterName = chapterNameById.get(slug) ?? label;
                return (
                  <ChapterConvenorCard
                    key={slug}
                    slug={slug}
                    chapterName={chapterName}
                    convenor={convenor}
                  />
                );
              })}
            </ul>
          ) : null}
        </Container>
      </Section>

      {/* ──────────────── 05 · LEADERSHIP PRINCIPLES ──────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Leadership Principles
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2 className="mt-5 font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]" style={{ color: NAVY }}>
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

      {/* ──────────────── 06 · THE WIDER NETWORK ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-18">
        <Container>
          <div className="mx-auto grid max-w-[1180px] items-center gap-8 border-t border-b border-[#D6AD60]/30 py-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                  The Wider Network
                </p>
              </div>
              <h2 className="mt-4 font-serif text-[1.45rem] font-bold leading-tight tracking-tight sm:text-[1.7rem] lg:text-[1.9rem]" style={{ color: NAVY }}>
                Explore the chapters and councils that bring IPF UAE to life.
              </h2>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                Beyond Central Leadership, IPF UAE operates through seven chapters across the Emirates and nineteen councils — fifteen State Councils and four Special Councils — that organise community initiatives.
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

/* Chapter convenor tile — portrait + chapter label + convenor name OR
   institutional "to be announced" state when the chapter has no roster
   data on live production. Never fabricates a name. */
function ChapterConvenorCard({
  slug,
  chapterName,
  convenor,
}: {
  slug: string;
  chapterName: string;
  convenor: LeadershipEntry | null;
}) {
  return (
    <li className="min-w-0">
      <Link to={`/chapters/${slug}`} className="group block">
        <PortraitFrame
          src={convenor?.personImage}
          alt={
            convenor
              ? `${convenor.personName}, Convenor — IPF ${chapterName}`
              : `IPF ${chapterName} — Convenor to be announced`
          }
          name={convenor?.personName ?? chapterName}
        />
        <div className="mt-4">
          <p
            className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
            style={{ color: GOLD_INK }}
          >
            {chapterName}
          </p>
          <p
            className="mt-2 font-serif text-[1rem] font-bold leading-tight tracking-tight"
            style={{ color: NAVY }}
          >
            {convenor?.personName ?? "Convenor to be announced"}
          </p>
          <p
            className="mt-1 text-[0.78rem] font-medium"
            style={{ color: MUTED }}
          >
            {convenor ? "Convenor" : "Chapter leadership"}
          </p>
        </div>
      </Link>
    </li>
  );
}
