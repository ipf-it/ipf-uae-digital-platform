import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleProvider";
import { Container } from "../ui/Container";

/* ───────────────────────────────────────────────────────────────────────
 * IllustratedHero — the SHARED child-page hero for /history, /leadership,
 * /yuva and /support (5 Oct 2026).
 *
 * Replaces the previous burgundy PageHero on the three About-family
 * child pages that use it, and replaces the inline navy-ground hero on
 * /history. Every child page now shares ONE visual family: light
 * ivory ground, approved watercolour artwork as the hero background,
 * dark navy editorial typography on the left negative-space area.
 *
 * NON-NEGOTIABLE RULES applied here
 *   • The approved artwork renders in its ORIGINAL colours.
 *   • NO CSS filter, NO opacity reduction, NO full-image overlay,
 *     NO colour wash, NO burgundy/navy/orange tint, NO global gradient.
 *   • The <img> is at `opacity-100` with no filter, no mix-blend-mode.
 *   • Only `object-cover` + `object-position` are used — the pixels
 *     themselves are not altered.
 *   • Text sits over the artwork's LEFT negative-space area, which the
 *     approved watercolour banners deliberately keep as ivory + a
 *     tricolour swash. Dark navy typography reads cleanly against this.
 *   • NO tricolour underline below the H1 — a thin gold rule next to
 *     the eyebrow is the only hero accent, matching /about's editorial
 *     language.
 *
 * Mobile strategy
 *   The desktop background crop would hide the illustration's focal
 *   subjects on narrow screens, so on <md viewports the hero stacks:
 *   text block first, then the artwork rendered inline as a figure at
 *   its full composition. The illustration remains recognisable, text
 *   is never sitting over detailed imagery, and the colour palette
 *   never changes.
 * ─────────────────────────────────────────────────────────────────── */

type Crumb = {
  label: string;
  to?: string;
};

type IllustratedHeroProps = {
  eyebrow: string;
  /** Accepts a plain string (default across the About family) or
   *  ReactNode (e.g. the Yuva hero's two-line "Young Indians. / One
   *  Community." using an inline <br />). Non-breaking widening. */
  title: ReactNode;
  description: string;
  crumbs?: Crumb[];
  /** Approved illustrated artwork — PNG required, WebP optional for perf. */
  artworkPng: string;
  artworkWebp?: string;
  /** Accessible description of the artwork for the inline mobile figure. */
  artworkAlt: string;
  /** Desktop/tablet `object-position` for the background crop. The default
   *  biases the focal cluster to the right of the hero while keeping the
   *  left ivory negative space behind the text column. */
  artworkPosition?: string;
  /** Max-width Tailwind class for the text column. Default is wide enough
   *  that long descriptions (e.g. Support's "coordinated by chapter
   *  volunteers and professional members.") do not orphan the final
   *  word onto its own line at desktop. A page may pass a narrower value
   *  (e.g. History) when its artwork's focal subjects would otherwise
   *  overlap the H1/description. */
  textMaxWidth?: string;
  /** Optional override for the hero content block's min-height classes.
   *  Default is the standard family height. /history passes a taller
   *  value so the panoramic Watercolour Heritage image is upscaled by
   *  `object-cover`, which gives `object-position` meaningful horizontal
   *  room to crop the dense monument cluster away from the text column
   *  at every desktop width. */
  heightClass?: string;
  /** Optional CTA block rendered inside the hero's left text column
   *  directly beneath the description. Non-breaking: omit for the same
   *  text-only hero every other About-family page uses today. */
  cta?: ReactNode;
};

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED_NAVY = "#3f4a5e";

function GoldRule() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-px w-10"
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

export function IllustratedHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  artworkPng,
  artworkWebp,
  artworkAlt,
  artworkPosition = "object-[72%_center]",
  textMaxWidth = "max-w-[600px]",
  heightClass = "min-h-[380px] py-10 md:min-h-[460px] md:py-14 lg:min-h-[500px] lg:py-16",
  cta,
}: IllustratedHeroProps) {
  const { t } = useLocale();

  return (
    <section
      aria-labelledby="illustrated-hero-heading"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      {/* Desktop/tablet (md+) — approved artwork as the hero background,
          positioned so its primary focal cluster sits on the right while
          the left ivory + tricolour negative space is behind the text. */}
      <picture aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        {artworkWebp ? <source srcSet={artworkWebp} type="image/webp" /> : null}
        <img
          src={artworkPng}
          alt=""
          loading="eager"
          fetchPriority="high"
          className={`block h-full w-full object-cover ${artworkPosition}`}
        />
      </picture>

      <Container className="relative">
        <div className={`flex flex-col justify-center ${heightClass}`}>
          <div className={textMaxWidth}>
            {crumbs.length > 0 ? (
              <nav
                aria-label="Breadcrumb"
                className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: MUTED_NAVY }}
              >
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <li>
                    <Link
                      to="/"
                      className="transition hover:text-[var(--ipf-green)]"
                    >
                      {t("nav.home")}
                    </Link>
                  </li>
                  {crumbs.map((crumb) => (
                    <li key={crumb.label} className="flex items-center gap-2">
                      <ChevronRight className="size-3 opacity-50" aria-hidden="true" />
                      {crumb.to ? (
                        <Link
                          to={crumb.to}
                          className="transition hover:text-[var(--ipf-green)]"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span style={{ color: NAVY }}>{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="flex items-center gap-3">
              <GoldRule />
              <p
                className="text-[0.72rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD_INK }}
              >
                {eyebrow}
              </p>
            </div>

            <h1
              id="illustrated-hero-heading"
              className="mt-4 font-serif text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-[2.5rem] lg:text-[2.9rem]"
              style={{ color: NAVY }}
            >
              {title}
            </h1>

            <p
              className="mt-5 text-[0.98rem] leading-relaxed sm:text-[1.02rem]"
              style={{ color: INK }}
            >
              {description}
            </p>
            {cta ? <div className="mt-7 flex flex-wrap gap-3">{cta}</div> : null}
          </div>
        </div>
      </Container>

      {/* Mobile (<md) — artwork rendered as an inline figure below the
          text block so the full composition remains recognisable without
          the desktop background crop. Original colours preserved; no
          filter, no overlay. */}
      <figure className="mb-6 mt-2 overflow-hidden md:hidden">
        <picture className="block">
          {artworkWebp ? <source srcSet={artworkWebp} type="image/webp" /> : null}
          <img
            src={artworkPng}
            alt={artworkAlt}
            loading="eager"
            decoding="async"
            className="block w-full"
          />
        </picture>
      </figure>
    </section>
  );
}
