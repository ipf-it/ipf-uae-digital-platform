import { Link } from "react-router-dom";
import { useOrgChapters, useOrgCouncils } from "../hooks/useOrgDirectory";
import { chapterPath, councilPath } from "../data/orgNav";
import { Container } from "./ui/Container";

/* ───────────────────────────────────────────────────────────────────────
 * HomeNetwork — "Our Network: Chapters / State Councils / Special Councils"
 *
 * Composition at ≥md
 *   Three self-contained cards side by side in a plain 3-column grid,
 *   in normal document flow (no fixed height, no absolute positioning).
 *   Each card has a contained photo (or, for State Councils, a plain
 *   burgundy header with the lotus ornament — no per-state photo asset
 *   exists) on top, then heading/intro/content/CTA below. This replaced
 *   an earlier two-panel fixed-height edge-bleed composition: once a
 *   third block's worth of real content (15 state councils + 4 special
 *   councils) was added, the fixed-height band overflowed and the CTA
 *   buttons rendered on top of the Events section below it. A plain
 *   grid in normal flow can't overlap anything below it, by
 *   construction, regardless of how much real data any block holds.
 *
 * Composition at <md
 *   Same three blocks, stacked, with an ornament rule between each.
 *
 * Data
 *   Chapters routes from useOrgChapters() → GET /api/org/chapters.
 *   Councils routes from useOrgCouncils() → GET /api/org/councils, split
 *   into State Councils (the 15 live state councils, compact text list)
 *   and Special Councils (Business, Women's, Cultural, Yuva — the 4 real
 *   special councils; Yuva links to the existing /yuva page since Yuva
 *   IS the youth wing of IPF). "Professionals" and "Media" were never
 *   real council records — they were placeholder medallions with no
 *   destination at all — and have been removed; Business Council already
 *   covers the professionals/business networking remit.
 *
 * Motion
 *   NONE. No autoplay, no scroll reveal, no parallax, no decorative
 *   keyframes. The only interactive motion is a quiet medallion hover
 *   scale on real <Link> elements, auto-disabled under
 *   prefers-reduced-motion.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "#5A0F1E";
const INK = "#1c2430";
const MUTED = "#55606d";

/* Chapter id → medallion. Each live chapter has an approved asset here.
   The authoritative 2026 count is seven (see src/data/orgCounts.ts);
   any slug returned by /api/org/chapters without a matching medallion
   simply won't render. The map intentionally retains the full historic
   set so changes to the chapter directory don't require code edits. */
const CHAPTER_ICON: Record<string, string> = {
  dubai: "/images/home/network/chapter-dubai.png",
  "abu-dhabi": "/images/home/network/chapter-abu-dhabi.png",
  "al-ain": "/images/home/network/chapter-al-ain.png",
  sharjah: "/images/home/network/chapter-sharjah.png",
  ajman: "/images/home/network/chapter-ajman.png",
  "umm-al-quwain": "/images/home/network/chapter-umm-al-quwain.png",
  "ras-al-khaimah": "/images/home/network/chapter-ras-al-khaimah.png",
  fujairah: "/images/home/network/chapter-fujairah.png",
};

/* Special council slot definitions — only real council records, each
 * with a genuine destination. */
type CouncilSlot = {
  key: string;
  label: string;
  icon: string;
  to: string;
};

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

/** Static lotus ornament — eight-petal, pure SVG, no animation. */
function CentreOrnament({ size = 32 }: { size?: number }) {
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

/** Burgundy pill with heritage-gold hairline border. */
function PillLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-[#D6AD60]/70 bg-[#5A0F1E] px-5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#FFF8EE] transition hover:bg-[#3A0913] hover:border-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <span>{children}</span>
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Icon medallion                                                      */
/* ------------------------------------------------------------------ */

function MedallionBlock({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <>
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={120}
        height={120}
        /* The approved medallions already contain their circular treatment —
           do NOT add another ring, bg, border or crop. */
        className="h-10 w-10 object-contain transition-transform group-hover:scale-[1.05] sm:h-11 sm:w-11 lg:h-[52px] lg:w-[52px]"
      />
      {/* min-h reserves two lines of text so wrapped labels like
         "Umm Al Quwain" / "Ras Al Khaimah" don't change the medallion
         height — every chapter item ends up with the exact same
         vertical footprint and the grid row geometry stays clean. */}
      <span className="flex min-h-[1.75rem] items-start justify-center whitespace-pre-line text-center text-[0.68rem] font-semibold leading-tight text-[#1c2430] sm:min-h-[1.9rem] sm:text-[0.72rem]">
        {label}
      </span>
    </>
  );
}

function ClickableMedallion({
  src,
  label,
  to,
}: {
  src: string;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 flex-col items-center gap-1 rounded-xl p-1 transition hover:bg-[#D6AD60]/10 focus-visible:bg-[#D6AD60]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <MedallionBlock icon={src} label={label} />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function HomeNetwork() {
  const { chapters } = useOrgChapters();
  const { councils } = useOrgCouncils();

  /* Chapter order locked to the approved reference — Fujairah omitted
     per IPF 2026 structure (preserved in CMS with active=false). */
  const chapterOrder = [
    "dubai",
    "abu-dhabi",
    "al-ain",
    "sharjah",
    "ajman",
    "umm-al-quwain",
    "ras-al-khaimah",
  ];
  const orderedChapters = chapterOrder
    .map((id) => chapters.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  /* Special Councils — only the 4 real ones. Business Council also
     covers professional/networking remit (no separate "Professionals"
     council exists), and Yuva is the youth wing, linked to /yuva. */
  const womens   = councils.find((c) => c.id === "womens");
  const business = councils.find((c) => c.id === "business");
  const cultural = councils.find((c) => c.id === "cultural");

  const specialCouncilSlots: CouncilSlot[] = [
    womens && { key: "womens", label: "Women's\nCouncil", icon: "/images/home/network/council-womens.png", to: councilPath(womens.id) },
    { key: "youth", label: "Yuva\nCouncil", icon: "/images/home/network/council-youth.png", to: "/yuva" },
    business && { key: "business", label: "Business\nCouncil", icon: "/images/home/network/council-business.png", to: councilPath(business.id) },
    cultural && { key: "cultural", label: "Cultural\nCouncil", icon: "/images/home/network/council-cultural.png", to: councilPath(cultural.id) },
  ].filter((slot): slot is CouncilSlot => Boolean(slot));

  /* State Councils — the 15 live state councils, shown as a compact text
     list rather than medallions (no per-state icon assets exist, and 15
     items at medallion size wouldn't fit this panel). */
  const stateCouncils = councils
    .filter((c) => c.kind === "state")
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section
      aria-labelledby="ipf-network-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE] pb-6 lg:pb-8"
    >
      {/* Introductory header — constrained width inside the Container. */}
      <Container>
        <div className="pt-8 text-center sm:pt-9 lg:pt-10">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              id="ipf-network-eyebrow"
              className="text-[0.68rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              Our Network
            </p>
            <GoldRule />
          </div>
          <h2
            className="mt-2 font-serif text-[1.5rem] font-bold leading-[1.1] tracking-tight sm:text-[1.85rem] lg:text-[2.1rem]"
            style={{ color: NAVY }}
          >
            People. Communities. A Stronger Tomorrow.
          </h2>
          <p
            className="mx-auto mt-1.5 max-w-2xl text-[0.85rem] leading-snug sm:text-[0.9rem]"
            style={{ color: MUTED }}
          >
            Through our Chapters and Councils, IPF UAE connects people, ideas
            and opportunities across the Emirates and beyond.
          </p>
        </div>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════
         Desktop & tablet composition (≥md) — THREE real blocks side by
         side: Chapters / State Councils / Special Councils.

         Previously this was a fixed-height absolute-positioned band with
         exactly two edge-bleeding photos — adding a third block's worth
         of content (15 state councils + 4 special councils, instead of
         6 placeholder medallions) inside that fixed height overflowed
         it, which is why the CTA buttons rendered on top of the Events
         section below. Switched to a plain 3-column grid in normal
         document flow: each block is a self-contained card with a
         contained (not edge-bleeding) photo, so the section's height is
         whatever its content needs and it can never overlap anything
         below it again. No new photo assets — State Councils has no
         per-state icon art, so that block simply has no photo, same
         card chrome otherwise. */}
      <div className="hidden md:block">
        <Container className="mt-6 lg:mt-8">
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {/* ────── CHAPTERS block ────── */}
            <div className="flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FFFDF8]">
              <picture aria-hidden="true">
                <source srcSet="/images/home/network/chapters-skyline.webp" type="image/webp" />
                <img
                  src="/images/home/network/chapters-skyline.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full object-cover lg:h-36"
                />
              </picture>
              <div className="flex flex-1 flex-col px-4 py-4 lg:px-5 lg:py-5">
                <GoldRule />
                <h3 className="mt-1.5 font-serif text-[1.25rem] font-bold leading-[0.95] tracking-tight lg:text-[1.4rem]">
                  <span className="block" style={{ color: GOLD_INK }}>OUR</span>
                  <span className="block" style={{ color: NAVY }}>CHAPTERS</span>
                </h3>
                <GoldRule className="mt-1.5" />
                <p className="mt-2 text-[0.75rem] leading-snug" style={{ color: INK }}>
                  Our chapters bring IPF closer to people across the Emirates,
                  fostering local engagement, community initiatives and
                  meaningful partnerships.
                </p>

                {orderedChapters.length > 0 ? (
                  <ul role="list" className="mt-3 grid grid-cols-4 gap-x-1.5 gap-y-2.5">
                    {orderedChapters.map((chapter) => {
                      const icon = CHAPTER_ICON[chapter.id];
                      if (!icon) return null;
                      return (
                        <li key={chapter.id} className="min-w-0">
                          <ClickableMedallion src={icon} label={chapter.name} to={chapterPath(chapter.id)} />
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <p className="mt-auto pt-4">
                  <PillLink to="/chapters">Explore Chapters</PillLink>
                </p>
              </div>
            </div>

            {/* ────── STATE COUNCILS block ────── */}
            <div className="flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FFFDF8]">
              <div className="flex h-32 w-full items-center justify-center bg-[#5A0F1E] lg:h-36">
                <CentreOrnament size={36} />
              </div>
              <div className="flex flex-1 flex-col px-4 py-4 lg:px-5 lg:py-5">
                <GoldRule />
                <h3 className="mt-1.5 font-serif text-[1.25rem] font-bold leading-[0.95] tracking-tight lg:text-[1.4rem]">
                  <span className="block" style={{ color: GOLD_INK }}>STATE</span>
                  <span className="block" style={{ color: BURGUNDY }}>COUNCILS</span>
                </h3>
                <GoldRule className="mt-1.5" />
                <p className="mt-2 text-[0.75rem] leading-snug" style={{ color: INK }}>
                  Fifteen state councils connecting our community back to home
                  states across India.
                </p>

                <ul role="list" className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1">
                  {stateCouncils.map((council) => (
                    <li key={council.id} className="min-w-0">
                      <Link
                        to={councilPath(council.id)}
                        className="block truncate rounded px-1 py-0.5 text-[0.72rem] leading-tight text-[#1c2430] transition hover:bg-[#D6AD60]/10 hover:text-[#5A0F1E] focus-visible:bg-[#D6AD60]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
                      >
                        {council.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-4">
                  <PillLink to="/councils">Explore Councils</PillLink>
                </p>
              </div>
            </div>

            {/* ────── SPECIAL COUNCILS block ────── */}
            <div className="flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FFFDF8]">
              <picture aria-hidden="true">
                <source srcSet="/images/home/network/councils-community.webp" type="image/webp" />
                <img
                  src="/images/home/network/councils-community.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full object-cover lg:h-36"
                />
              </picture>
              <div className="flex flex-1 flex-col px-4 py-4 lg:px-5 lg:py-5">
                <GoldRule />
                <h3 className="mt-1.5 font-serif text-[1.25rem] font-bold leading-[0.95] tracking-tight lg:text-[1.4rem]">
                  <span className="block" style={{ color: GOLD_INK }}>SPECIAL</span>
                  <span className="block" style={{ color: BURGUNDY }}>COUNCILS</span>
                </h3>
                <GoldRule className="mt-1.5" />
                <p className="mt-2 text-[0.75rem] leading-snug" style={{ color: INK }}>
                  Focused councils uniting expertise across key community areas.
                </p>

                <ul role="list" className="mt-3 grid grid-cols-4 gap-x-1.5 gap-y-2.5">
                  {specialCouncilSlots.map((slot) => (
                    <li key={slot.key} className="min-w-0">
                      <ClickableMedallion src={slot.icon} label={slot.label} to={slot.to} />
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-4">
                  <PillLink to="/councils">Explore Councils</PillLink>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         Mobile composition (<md) — stacked
         ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <Container className="relative pb-10 pt-6">
          {/* Chapters block */}
          <div className="relative">
            <picture aria-hidden="true">
              <source
                srcSet="/images/home/network/chapters-skyline.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/chapters-skyline.png"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-40 w-full rounded-tl-3xl rounded-br-[5rem] object-cover sm:h-48"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 70%, 70% 90%, 30% 95%, 0 100%)",
                }}
              />
            </picture>
            <div className="relative mt-4">
              <GoldRule />
              <h3 className="mt-2 font-serif text-[2rem] font-bold leading-[0.95] tracking-tight">
                <span className="block" style={{ color: GOLD_INK }}>
                  OUR
                </span>
                <span className="block" style={{ color: NAVY }}>
                  CHAPTERS
                </span>
              </h3>
              <GoldRule className="mt-2" />
              <p
                className="mt-3 text-[0.9rem] leading-relaxed"
                style={{ color: INK }}
              >
                Our chapters bring IPF closer to people across the Emirates,
                fostering local engagement, community initiatives and
                meaningful partnerships.
              </p>
              {orderedChapters.length > 0 ? (
                /* Mobile/tablet: 4 columns of 2 cols each. Row 1-3 fill
                   normally; the 7th (orphan) item spans the full 4-col
                   width and justifies to the row centre, which puts
                   its medallion exactly in the middle of the panel. */
                <ul
                  role="list"
                  className="mt-5 grid grid-cols-4 gap-x-2 gap-y-3"
                >
                  {orderedChapters.map((chapter, index) => {
                    const icon = CHAPTER_ICON[chapter.id];
                    if (!icon) return null;
                    const isOrphan = index === orderedChapters.length - 1 && orderedChapters.length % 2 === 1;
                    return (
                      <li
                        key={chapter.id}
                        className={
                          isOrphan
                            ? "col-span-4 flex min-w-0 justify-center"
                            : "col-span-2 min-w-0"
                        }
                      >
                        <ClickableMedallion
                          src={icon}
                          label={chapter.name}
                          to={chapterPath(chapter.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="mt-5">
                <PillLink to="/chapters">Explore Chapters</PillLink>
              </p>
            </div>
          </div>

          {/* Mobile ornament divider */}
          <div
            aria-hidden="true"
            className="my-8 flex items-center justify-center gap-3"
          >
            <GoldRule />
            <CentreOrnament size={26} />
            <GoldRule />
          </div>

          {/* State Councils block */}
          <div className="relative">
            <div className="flex h-24 w-full items-center justify-center rounded-tr-3xl rounded-bl-[5rem] bg-[#5A0F1E]">
              <CentreOrnament size={30} />
            </div>
            <div className="relative mt-4">
              <GoldRule />
              <h3 className="mt-2 font-serif text-[2rem] font-bold leading-[0.95] tracking-tight">
                <span className="block" style={{ color: GOLD_INK }}>
                  STATE
                </span>
                <span className="block" style={{ color: BURGUNDY }}>
                  COUNCILS
                </span>
              </h3>
              <GoldRule className="mt-2" />
              <p
                className="mt-3 text-[0.9rem] leading-relaxed"
                style={{ color: INK }}
              >
                Fifteen state councils connecting our community back to home
                states across India.
              </p>

              <ul role="list" className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1">
                {stateCouncils.map((council) => (
                  <li key={council.id} className="min-w-0">
                    <Link
                      to={councilPath(council.id)}
                      className="block truncate rounded px-1 py-1 text-[0.82rem] leading-tight text-[#1c2430] transition hover:bg-[#D6AD60]/10 hover:text-[#5A0F1E] focus-visible:bg-[#D6AD60]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
                    >
                      {council.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-5">
                <PillLink to="/councils">Explore Councils</PillLink>
              </p>
            </div>
          </div>

          {/* Mobile ornament divider */}
          <div
            aria-hidden="true"
            className="my-8 flex items-center justify-center gap-3"
          >
            <GoldRule />
            <CentreOrnament size={26} />
            <GoldRule />
          </div>

          {/* Special Councils block */}
          <div className="relative">
            <picture aria-hidden="true">
              <source
                srcSet="/images/home/network/councils-community.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/councils-community.png"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-40 w-full rounded-tr-3xl rounded-bl-[5rem] object-cover sm:h-48"
                style={{
                  clipPath:
                    "polygon(0 30%, 30% 10%, 70% 5%, 100% 0, 100% 100%, 0 100%)",
                }}
              />
            </picture>
            <div className="relative mt-4">
              <GoldRule />
              <h3 className="mt-2 font-serif text-[2rem] font-bold leading-[0.95] tracking-tight">
                <span className="block" style={{ color: GOLD_INK }}>
                  SPECIAL
                </span>
                <span className="block" style={{ color: BURGUNDY }}>
                  COUNCILS
                </span>
              </h3>
              <GoldRule className="mt-2" />
              <p
                className="mt-3 text-[0.9rem] leading-relaxed"
                style={{ color: INK }}
              >
                Focused councils uniting expertise across key community areas.
              </p>

              <ul
                role="list"
                className="mt-4 grid grid-cols-4 gap-x-2 gap-y-3"
              >
                {specialCouncilSlots.map((slot) => (
                  <li key={slot.key} className="min-w-0">
                    <ClickableMedallion
                      src={slot.icon}
                      label={slot.label}
                      to={slot.to}
                    />
                  </li>
                ))}
              </ul>

              <p className="mt-5">
                <PillLink to="/councils">Explore Councils</PillLink>
              </p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
