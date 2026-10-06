import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ChapterMap } from "../components/ChapterMap";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { chapterPath } from "../data/orgNav";
import {
  CHAPTER_COUNT,
  STATE_COUNCIL_COUNT,
  SPECIAL_COUNCIL_COUNT,
  TOTAL_COUNCIL_COUNT,
} from "../data/orgCounts";
import { useOrgChapters } from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * ChaptersPage — premium institutional redesign (6 Oct 2026).
 *
 * Replaces the previous oversized illustrated hero (which baked
 * "CHAPTERS / SEVEN CHAPTERS. ONE COMMUNITY." text and all seven
 * mini-chapter cards into the artwork) with a restrained editorial
 * composition in the same visual family as Contact + News + Leadership:
 *
 *   HERO — compact banner (clamp 300..380px) reusing the approved
 *     Watercolour UAE Waterfront Skyline panorama (same asset already
 *     used by /contact — no multi-megabyte asset duplication). HTML
 *     text overlay (CHAPTERS eyebrow + "Across the Emirates. One
 *     Community." + supporting copy) sits on the LEFT ivory negative
 *     space inside a soft ivory→transparent wash so the watercolour
 *     stays visible on the right.
 *
 *   INTRODUCTION — small editorial band (OUR PRESENCE eyebrow +
 *     "Seven chapters. One connected network." + supporting copy).
 *
 *   CHAPTER CARDS — seven premium cards in a 3-column grid at lg+
 *     (3 cards in row 1, 3 in row 2, final card centred in row 3 on
 *     the lg layout; 4 cards fill row 2 cleanly at xl+). Each card
 *     reuses the chapter's existing medallion from
 *     /images/home/network/chapter-{slug}.png — the same artwork that
 *     identifies the chapter elsewhere on the site, so clicking into
 *     the chapter page preserves visual continuity.
 *
 *   MAP — ChapterMap below the cards, redesigned to the premium
 *     ivory/parchment system (see src/components/ChapterMap.tsx).
 *
 *   COUNCILS BRIDGE — editorial transition explaining the 15 State +
 *     4 Special = 19 Councils structure, with CTAs to /councils
 *     anchors.
 *
 * Data discipline
 *   The seven authoritative UAE chapters (per orgCounts.CHAPTER_COUNT
 *   = 7 and the founder brief) are defined inline as CHAPTER_ORDER so
 *   the public page renders exactly seven cards in the editorial order
 *   requested. The useOrgChapters() hook is still consulted at runtime
 *   so each card's display name defers to the live DB value where
 *   available; our local order + descriptor stay as the fallback. Al
 *   Ain is deliberately excluded — it is NOT a current UAE chapter per
 *   the 2026 structure.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

type ChapterDef = {
  slug: string;
  name: string;
  descriptor: string;
  art: string;
};

/* Seven authoritative UAE chapters in editorial order (Dubai → Abu
   Dhabi → Sharjah → Ajman → Ras Al Khaimah → Fujairah → Umm Al Quwain).
   Each card reuses the existing medallion artwork from the home
   Network band — same visual identity across the site. */
const CHAPTER_ORDER: ChapterDef[] = [
  {
    slug: "dubai",
    name: "Dubai",
    descriptor: "Culture · Welfare · Service",
    art: "/images/home/network/chapter-dubai.png",
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    descriptor: "Embassy coordination · Capital community",
    art: "/images/home/network/chapter-abu-dhabi.png",
  },
  {
    slug: "sharjah",
    name: "Sharjah",
    descriptor: "Programmes · Counselling · Cultural events",
    art: "/images/home/network/chapter-sharjah.png",
  },
  {
    slug: "ajman",
    name: "Ajman",
    descriptor: "Home of the registered office",
    art: "/images/home/network/chapter-ajman.png",
  },
  {
    slug: "ras-al-khaimah",
    name: "Ras Al Khaimah",
    descriptor: "Northern chapter · Cultural & welfare activity",
    art: "/images/home/network/chapter-ras-al-khaimah.png",
  },
  {
    slug: "fujairah",
    name: "Fujairah",
    descriptor: "East-coast community programmes",
    art: "/images/home/network/chapter-fujairah.png",
  },
  {
    slug: "umm-al-quwain",
    name: "Umm Al Quwain",
    descriptor: "Northern emirate · Local engagement",
    art: "/images/home/network/chapter-umm-al-quwain.png",
  },
];

export default function ChaptersPage() {
  const { t } = useLocale();
  const { chapters } = useOrgChapters();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && chapters.some((chapter) => chapter.id === id))
      navigate(chapterPath(id), { replace: true });
  }, [location.hash, navigate, chapters]);

  /* Prefer the live DB name when available, otherwise fall back to the
     editorial name baked into CHAPTER_ORDER. */
  const liveNameBySlug = new Map(chapters.map((c) => [c.id, c.name]));

  return (
    <>
      <DocumentTitle title={t("nav.chapters")} />

      {/* ──────────────── HERO ──────────────── */}
      <section
        aria-labelledby="chapters-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <div className="relative w-full" style={{ height: "clamp(300px, 32vw, 380px)" }}>
          <picture>
            <source srcSet="/images/contact/contact-hero.webp" type="image/webp" />
            <img
              src="/images/contact/contact-hero.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              width={1774}
              height={887}
              className="absolute inset-0 block h-full w-full object-cover"
              style={{ objectPosition: "right center" }}
            />
          </picture>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,248,238,0.94) 0%, rgba(255,248,238,0.8) 32%, rgba(255,248,238,0.38) 55%, rgba(255,248,238,0) 72%)",
            }}
          />

          <div className="absolute inset-0 flex items-center">
            <Container>
              <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[580px]">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-8" style={{ backgroundColor: `${GOLD}aa` }} />
                  <p
                    className="text-[0.7rem] font-bold uppercase tracking-[0.3em] sm:text-[0.75rem]"
                    style={{ color: GOLD_INK }}
                  >
                    Chapters
                  </p>
                </div>
                <h1
                  id="chapters-page-heading"
                  className="mt-3 font-serif text-[1.7rem] font-bold leading-[1.08] tracking-tight sm:text-[2.05rem] md:text-[2.3rem] lg:text-[2.5rem]"
                  style={{ color: NAVY }}
                >
                  Across the Emirates.
                  <br />
                  One Community.
                </h1>
                <div aria-hidden="true" className="mt-4 h-px w-14" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="mt-4 max-w-[480px] text-[0.95rem] leading-relaxed sm:text-[1rem]" style={{ color: INK }}>
                  {CHAPTER_COUNT === 7 ? "Seven" : CHAPTER_COUNT} chapters connecting Indians across the UAE through community service, culture, welfare and engagement.
                </p>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* ──────────────── INTRODUCTION ──────────────── */}
      <section className="bg-[#FFF8EE] pt-12 sm:pt-14 lg:pt-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Our Presence
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              className="mt-4 font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
              style={{ color: NAVY }}
            >
              Seven chapters. One connected network.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
              Our UAE Chapters bring the community closer at the local level through cultural programmes, welfare initiatives, volunteer activities and meaningful engagement.
            </p>
          </div>
        </Container>
      </section>

      {/* ──────────────── 7 PREMIUM CHAPTER CARDS ──────────────── */}
      <section className="bg-[#FFF8EE] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
        <Container>
          <ul
            role="list"
            className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 xl:gap-8"
          >
            {CHAPTER_ORDER.map((def, i) => {
              const name = liveNameBySlug.get(def.slug) ?? def.name;
              return (
                <li
                  key={def.slug}
                  className={
                    /* Centre the orphan 7th card on the lg grid so Row 3
                       doesn't look accidental. On xl+ the grid stays 3-col
                       and the 7th wraps naturally. */
                    i === 6 ? "lg:col-start-2 xl:col-start-auto" : ""
                  }
                >
                  <Link
                    to={chapterPath(def.slug)}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#D6AD60]/35 bg-[#FFFBF2] shadow-[0_8px_22px_rgba(11,31,58,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6AD60]/70 hover:shadow-[0_14px_32px_rgba(11,31,58,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                  >
                    {/* Artwork — chapter-specific medallion */}
                    <div className="relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden bg-[#FFF8EE]">
                      <img
                        src={def.art}
                        alt={`${name} chapter illustration`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-auto max-w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03] sm:p-7"
                      />
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
                      <p
                        className="text-[0.68rem] font-bold tabular-nums tracking-[0.24em]"
                        style={{ color: GOLD_INK }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p
                        className="mt-2 font-serif text-[1.2rem] font-bold leading-tight tracking-tight sm:text-[1.3rem]"
                        style={{ color: NAVY }}
                      >
                        {name} Chapter
                      </p>
                      <p className="mt-2 text-[0.82rem] leading-relaxed" style={{ color: MUTED }}>
                        {def.descriptor}
                      </p>
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.18em]"
                        style={{ color: NAVY }}
                      >
                        Explore chapter
                        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ──────────────── UAE MAP (secondary) ──────────────── */}
      <section className="bg-[#FFFBF2] py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Across the Emirates
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              Find IPF UAE near you.
            </h2>
          </div>
          <div className="mx-auto mt-10 max-w-[1120px]">
            <ChapterMap />
          </div>
        </Container>
      </section>

      {/* ──────────────── COUNCILS BRIDGE ──────────────── */}
      <section className="bg-[#FFF8EE] pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-28">
        <Container>
          <div className="mx-auto max-w-[1120px]">
            <div
              aria-hidden="true"
              className="h-px w-full"
              style={{ backgroundColor: `${GOLD}55` }}
            />
            <div className="grid gap-10 pt-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 sm:pt-14">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-8" style={{ backgroundColor: `${GOLD}aa` }} />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                    One Network. Many Ways to Serve.
                  </p>
                </div>
                <h2
                  className="mt-3 font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
                  style={{ color: NAVY }}
                >
                  Explore IPF UAE's Councils
                </h2>
                <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                  Chapters organise IPF UAE geographically across the Emirates, while Councils connect communities through state representation and specialised areas of engagement. {STATE_COUNCIL_COUNT} State Councils and {SPECIAL_COUNCIL_COUNT} Special Councils make up our {TOTAL_COUNCIL_COUNT} Councils in total.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    to="/councils#state-councils"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ipf-navy)] px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:bg-[#0b1f3a]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                  >
                    Explore State Councils
                    <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/councils#special-councils"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ipf-navy)]/80 bg-transparent px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] transition hover:bg-[var(--ipf-navy)]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                    style={{ color: NAVY }}
                  >
                    Explore Special Councils
                    <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Councils numeric panel */}
              <div className="relative overflow-hidden rounded-[20px] border border-[#D6AD60]/35 bg-[#FFFBF2] px-8 py-9 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:px-10 sm:py-10">
                <ul role="list" className="divide-y divide-[#D6AD60]/30">
                  <li className="flex items-baseline justify-between gap-6 pb-5">
                    <p className="font-serif text-[0.95rem] font-semibold" style={{ color: NAVY }}>
                      State Councils
                    </p>
                    <p className="font-serif text-[2rem] font-bold leading-none tabular-nums sm:text-[2.4rem]" style={{ color: NAVY }}>
                      {STATE_COUNCIL_COUNT}
                    </p>
                  </li>
                  <li className="flex items-baseline justify-between gap-6 py-5">
                    <p className="font-serif text-[0.95rem] font-semibold" style={{ color: NAVY }}>
                      Special Councils
                    </p>
                    <p className="font-serif text-[2rem] font-bold leading-none tabular-nums sm:text-[2.4rem]" style={{ color: NAVY }}>
                      {SPECIAL_COUNCIL_COUNT}
                    </p>
                  </li>
                  <li className="flex items-baseline justify-between gap-6 pt-5">
                    <p className="font-serif text-[0.95rem] font-semibold" style={{ color: GOLD_INK }}>
                      Total
                    </p>
                    <p className="font-serif text-[2rem] font-bold leading-none tabular-nums sm:text-[2.4rem]" style={{ color: GOLD_INK }}>
                      {TOTAL_COUNCIL_COUNT}
                    </p>
                  </li>
                </ul>
                <p className="mt-6 text-[0.78rem] leading-relaxed" style={{ color: MUTED }}>
                  Yuva is a Special Council — included inside the {SPECIAL_COUNCIL_COUNT} above, not a separate category.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
