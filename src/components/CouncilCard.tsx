import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { councilPath } from "../data/orgNav";
import { councilTheme } from "../data/orgThemes";

/* ───────────────────────────────────────────────────────────────────────
 * CouncilCard — premium directory card for /councils.
 *
 * Mirrors ChapterCard: reuses the EXACT artwork and theme already shipped
 * for each individual council detail page so clicking into the council
 * preserves full visual continuity.
 *
 *   • artwork:  /theme/place-art/{slug}.webp (same asset rendered by
 *               <PlaceThemeArt> inside <CouncilJourneyHero>, no copies)
 *   • colours:  councilTheme(slug, region) → { primary, secondary, accent }
 *               (same source feeding the council hero's CSS vars)
 *
 * Composition
 *   TOP TEXT ZONE   — eyebrow (STATE COUNCIL / SPECIAL COUNCIL) + name +
 *                     optional short descriptor, white on dark primary bg
 *   LOWER ART ZONE  — council artwork, object-contain + object-bottom so
 *                     landmark tops are never clipped
 *   FOOTER          — "Explore council →" with gold arrow
 *
 * Entire card is a <Link>; focus-visible ring; respects reduced-motion.
 * ─────────────────────────────────────────────────────────────────── */

type CouncilCardProps = {
  slug: string;
  name: string;
  kind: "state" | "special";
  region?: string;
  descriptor?: string;
};

export function CouncilCard({ slug, name, kind, region = "", descriptor }: CouncilCardProps) {
  const theme = councilTheme(slug, region);
  return (
    <Link
      to={councilPath(slug)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] shadow-[0_8px_22px_rgba(11,31,58,0.12)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(11,31,58,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
      aria-label={`${name} ${kind === "state" ? "State Council" : "Special Council"}`}
      style={{
        background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary} 55%, ${theme.primary}f2 100%)`,
      }}
    >
      {/* Text zone */}
      <div className="relative z-10 px-5 pb-2.5 pt-5 sm:px-6 sm:pb-3 sm:pt-6">
        <p
          className="text-[0.6rem] font-bold uppercase tracking-[0.24em]"
          style={{ color: theme.secondary }}
        >
          {kind === "state" ? "State Council" : "Special Council"}
        </p>
        <h3 className="mt-1.5 font-serif text-[1.15rem] font-bold leading-tight tracking-tight text-white sm:text-[1.25rem]">
          {name}
        </h3>
        {descriptor ? (
          <p className="mt-1.5 text-[0.78rem] leading-relaxed text-white/80">
            {descriptor}
          </p>
        ) : null}
      </div>

      {/* Art zone */}
      <div className="relative mt-auto flex min-h-[150px] flex-1 items-end justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-10"
          style={{ background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}00 100%)` }}
        />
        <img
          src={`/theme/place-art/${slug}.webp`}
          alt={`${name} ${kind === "state" ? "State Council" : "Special Council"} composition`}
          loading="lazy"
          decoding="async"
          className="relative block h-auto max-h-[180px] w-full max-w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            /* If a council doesn't yet have a /theme/place-art derivative,
               hide the broken <img> silently rather than show the alt text
               — the card still reads cleanly from its text zone alone. */
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-6"
        style={{ borderColor: `${theme.secondary}40` }}
      >
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white">
          Explore council
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
