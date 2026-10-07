import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ChapterCard } from "../components/ChapterCard";
import { ChapterMap } from "../components/ChapterMap";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { chapterPath } from "../data/orgNav";
import {
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
 *     3 Special = 18 Councils structure, with CTAs to /councils
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
};

/* Eight currently-routed chapter experiences in editorial order:
     Row 1 (desktop xl 4-col): Dubai · Abu Dhabi · Sharjah · Ajman
     Row 2 (desktop xl 4-col): Umm Al Quwain · Ras Al Khaimah · Fujairah · Al Ain
   Each card reuses the chapter's own hero artwork at /theme/place-art/{slug}.webp
   plus its chapter theme via chapterTheme() — identical visual identity
   to the destination /chapters/{slug} page.
   NOTE: The authoritative 2026 count is 7 chapters, but 8 chapter routes
   (including Al Ain) are currently live in production. Flagged for
   Rockstar reconciliation; this visual task preserves all 8 routed
   experiences until that reconciliation lands. */
const CHAPTER_ORDER: ChapterDef[] = [
  { slug: "dubai",          name: "Dubai",          descriptor: "Metropolitan community · Skyline & creek heritage" },
  { slug: "abu-dhabi",      name: "Abu Dhabi",      descriptor: "Capital of tolerance · Grand Mosque & Liwa" },
  { slug: "sharjah",        name: "Sharjah",        descriptor: "Heart of culture · Museums & heritage districts" },
  { slug: "ajman",          name: "Ajman",          descriptor: "Community by the coast · Fort & dhow" },
  { slug: "umm-al-quwain",  name: "Umm Al Quwain",  descriptor: "Pearls & mangroves · Lagoon & islands" },
  { slug: "ras-al-khaimah", name: "Ras Al Khaimah", descriptor: "From mountain to sea · Jebel Jais" },
  { slug: "fujairah",       name: "Fujairah",       descriptor: "The eastern coast · Hajar mountains & sea" },
  { slug: "al-ain",         name: "Al Ain",         descriptor: "The garden city · Oasis & Jebel Hafeet" },
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

  const liveNameBySlug = new Map(chapters.map((c) => [c.id, c.name]));

  return (
    <>
      <DocumentTitle title={t("nav.chapters")} />

      {/* ──────────────── HERO ──────────────── */}
      <section
        aria-labelledby="chapters-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        {/* FULL-WIDTH panoramic banner using the dedicated Chapters
            artwork at /images/chapters/chapters-hero.{webp,png} —
            Watercolour Heritage Skyline Panorama (2048×768, ratio
            ~2.67:1). Previous implementation reused the Contact
            page's narrower 2:1 artwork; swapped to this dedicated
            Chapters artwork so landmark tops (Burj Khalifa, UAE flag,
            India Gate, mosque minarets) stay better framed at wide
            viewports.
            object-fit:cover + object-position:center top preserves
            monument tops; only the bottom tricolour watercolour wave
            crops at wider containers. Hero height clamp bumped from
            (320,32vw,440) to (340,34vw,520) to better track the new
            2.67:1 aspect so cropping stays minimal. Ivory→transparent
            gradient wash on the left (0.92→0 across 0..70%) restores
            text contrast WITHOUT applying any tint to the artwork. */}
        <div className="relative w-full" style={{ height: "clamp(340px, 34vw, 520px)" }}>
          <picture>
            <source srcSet="/images/chapters/chapters-hero.webp" type="image/webp" />
            <img
              src="/images/chapters/chapters-hero.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              width={2048}
              height={768}
              className="absolute inset-0 block h-full w-full object-cover"
              style={{ objectPosition: "center top", filter: "none", opacity: 1 }}
            />
          </picture>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,248,238,0.92) 0%, rgba(255,248,238,0.78) 30%, rgba(255,248,238,0.35) 52%, rgba(255,248,238,0) 70%)",
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
                  Connecting Indians across the UAE through community service, culture, welfare and engagement.
                </p>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* ──────────────── INTRODUCTION (compact) ────────────────
          Number-free copy per corrective brief — the authoritative
          CHAPTER_COUNT = 7 vs 8 live routed chapter experiences is a
          Rockstar reconciliation item, and this landing page must not
          contradict either number while that reconciliation is pending. */}
      <section className="bg-[#FFF8EE] pt-10 sm:pt-12 lg:pt-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
              Our Presence
            </p>
            <h2
              className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
              style={{ color: NAVY }}
            >
              Chapters across the UAE
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[0.92rem] leading-relaxed" style={{ color: INK }}>
              Explore IPF's local chapter communities and the people, culture and service that bring them together.
            </p>
          </div>
        </Container>
      </section>

      {/* ──────────────── 8 PREMIUM CHAPTER CARDS ────────────────
          Grid: 1 col mobile → 2 cols sm → 2 cols lg → 4 cols xl (4×2
          at ≥1280 px). Each card reuses the chapter's own hero artwork
          and theme values via <ChapterCard>. */}
      <section className="bg-[#FFF8EE] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
        <Container>
          <ul
            role="list"
            className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-7 xl:grid-cols-4 xl:gap-7"
          >
            {CHAPTER_ORDER.map((def) => {
              const name = liveNameBySlug.get(def.slug) ?? def.name;
              return (
                <li key={def.slug} className="min-w-0">
                  <ChapterCard
                    slug={def.slug}
                    name={name}
                    description={def.descriptor}
                  />
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
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ipf-burgundy)] px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--ipf-burgundy-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                  >
                    Explore State Councils
                    <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/councils#special-councils"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ipf-burgundy)]/80 bg-transparent px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--ipf-burgundy)] transition hover:bg-[var(--ipf-burgundy)]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
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
                  Yuva has its own /yuva experience and is not counted inside the Special Councils above.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
