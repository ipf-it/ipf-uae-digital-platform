import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { chapterPath } from "../data/orgNav";
import { chapterTheme } from "../data/orgThemes";

/* ───────────────────────────────────────────────────────────────────────
 * ChapterCard — premium directory card for /chapters.
 *
 * Reuses the EXACT artwork and theme already established on each
 * individual chapter hero:
 *   • artwork:  /theme/place-art/{slug}.webp (same asset rendered by
 *               <PlaceThemeArt> inside <ChapterJourneyHero>, no copies)
 *   • colours:  chapterTheme(slug) → { primary, secondary, accent }
 *               (same source feeding the chapter hero's CSS vars)
 * so clicking into the chapter page preserves full visual continuity.
 *
 * Composition:
 *   TOP TEXT ZONE — eyebrow "CHAPTER" + name + short description sit on
 *   a dark primary background that keeps high contrast.
 *   LOWER ART ZONE — chapter artwork rendered with object-contain and
 *   bottom-anchored so landmark TOPS (Burj Khalifa, mosque minarets,
 *   mountain peaks, towers, palms) are never clipped.
 *   FOOTER — "Explore chapter →" with the lucide ArrowRight icon.
 *
 * Entire card is a <Link>; focus-visible ring; respects reduced-motion
 * (CSS transitions are small and the component itself has no JS motion).
 * ─────────────────────────────────────────────────────────────────── */

type ChapterCardProps = {
  slug: string;
  name: string;
  description: string;
};

export function ChapterCard({ slug, name, description }: ChapterCardProps) {
  const theme = chapterTheme(slug);
  return (
    <Link
      to={chapterPath(slug)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] shadow-[0_10px_30px_rgba(11,31,58,0.14)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(11,31,58,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
      aria-label={`${name} chapter`}
      style={{
        /* Chapter-specific background: subtle vertical gradient from
           the chapter's primary tone to a slightly deeper variant for
           depth. accent used only as a very faint top wash. */
        background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary} 55%, ${theme.primary}f2 100%)`,
      }}
    >
      {/* Text zone — top */}
      <div className="relative z-10 px-6 pb-3 pt-6 sm:px-7 sm:pb-4 sm:pt-7">
        <p
          className="text-[0.65rem] font-bold uppercase tracking-[0.26em]"
          style={{ color: theme.secondary }}
        >
          Chapter
        </p>
        <h3 className="mt-2 font-serif text-[1.4rem] font-bold leading-tight tracking-tight text-white sm:text-[1.55rem]">
          {name}
        </h3>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-white/80">
          {description}
        </p>
      </div>

      {/* Art zone — middle/lower, flexes to fill remaining card height.
         object-contain + object-bottom guarantees landmark tops never
         clip. A very subtle accent-tinted wash at the top edge of the
         art zone helps the artwork sit visually with the text zone. */}
      <div className="relative mt-auto flex min-h-[180px] flex-1 items-end justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-12"
          style={{
            background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}00 100%)`,
          }}
        />
        <img
          src={`/theme/place-art/${slug}.webp`}
          alt={`${name} landmarks and heritage composition`}
          loading="lazy"
          decoding="async"
          className="relative block h-auto max-h-[220px] w-full max-w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Footer — explore CTA */}
      <div
        className="relative z-10 flex items-center justify-between gap-3 border-t px-6 py-4 sm:px-7"
        style={{ borderColor: `${theme.secondary}40` }}
      >
        <span
          className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white"
        >
          Explore chapter
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: theme.secondary }}
        />
      </div>
    </Link>
  );
}
