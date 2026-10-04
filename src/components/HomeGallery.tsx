import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../cms/ContentProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { Container } from "./ui/Container";

const BG_WEBP = "/images/home/gallery-background.webp";
const BG_PNG = "/images/home/gallery-background.png";
const AUTOPLAY_MS = 9000;

/**
 * Homepage Gallery — premium editorial mosaic that crossfades between
 * triples of community photographs. Deliberately a different visual
 * rhythm from Events (which uses a horizontal scroll-snap carousel) so
 * the two sections do not read as a repeat.
 *
 * Data
 *   Reuses the existing content.galleryImages array from the CMS
 *   (ContentProvider → /api/cms/content). No new field, no duplicate
 *   data model. Admins already edit this list.
 *
 * Motion
 *   One group of three images is visible at a time; after AUTOPLAY_MS
 *   (9 s — deliberately slower than Events' 7 s so the two carousels
 *   never pulse together) the component crossfades to the next group
 *   using opacity, 1000 ms, ease-out. prefers-reduced-motion disables
 *   the autoplay entirely and shows just the first group as a static
 *   mosaic; manual navigation stays available via the arrow buttons.
 *
 * Pause
 *   Hover, focus-within, touch interaction and document.hidden all
 *   pause the autoplay; manual navigation remains instantaneous.
 */

type SvgIconProps = { className?: string };

function ChevronLeftIcon({ className }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="15 6 9 12 15 18" />
    </svg>
  );
}

function ChevronRightIcon({ className }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

type GallerySlide = { src: string; alt: string };

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function HomeGallery() {
  const { t } = useLocale();
  const { content } = useCms();
  const reducedMotion = usePrefersReducedMotion();

  const allImages: GallerySlide[] = content.galleryImages
    .map((item) => ({ src: item.src, alt: item.alt }))
    .filter((it): it is GallerySlide => Boolean(it.src));

  const groups = chunk(allImages, 3).filter((g) => g.length === 3);
  const hasGroups = groups.length > 0;

  const [groupIndex, setGroupIndex] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const touchActiveRef = useRef<boolean>(false);

  const groupCount = groups.length;
  const advance = useCallback(
    () => setGroupIndex((i) => (i + 1) % Math.max(1, groupCount)),
    [groupCount],
  );
  const retreat = useCallback(
    () =>
      setGroupIndex((i) => (i - 1 + Math.max(1, groupCount)) % Math.max(1, groupCount)),
    [groupCount],
  );

  useEffect(() => {
    if (reducedMotion || paused || groupCount <= 1) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      advance();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, groupCount, advance]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
      else if (!touchActiveRef.current) setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const activeGroup = hasGroups ? groups[groupIndex] : [];

  return (
    <section
      aria-labelledby="ipf-gallery-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      {/* Approved Gallery background — Serene Temple River Panorama with
         Tricolour Waves. Temples cluster at the bottom-left; tricolour
         waves enter from the bottom-right; mandala ornament top-left,
         vertical ornament top-right. object-position anchors the BOTTOM
         so both the temple band and the tricolour band stay in-frame at
         every section height, and biases slightly RIGHT (75 %) so the
         tricolour remains visible on narrow viewports where the frame
         crops the image horizontally. On desktop (where the image fills
         the width in full) the horizontal bias has no visual effect —
         both ends read naturally. */}
      <picture aria-hidden="true">
        <source srcSet={BG_WEBP} type="image/webp" />
        <img
          src={BG_PNG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={1774}
          height={887}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[75%_bottom] lg:object-[center_bottom]"
        />
      </picture>

      <Container className="relative py-12 sm:py-14 lg:py-16">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p
              id="ipf-gallery-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              Gallery
            </p>
            <h2 className="mt-2 font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[var(--ipf-navy)] sm:text-[1.95rem] lg:text-[2.1rem]">
              Moments of service, culture
              <br className="hidden sm:block" /> and community.
            </h2>
          </div>
          <Link
            to="/events#ipf-gallery"
            className="group hidden shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F] sm:inline-flex"
          >
            {t("home.openGallery")}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>

        {/* Mosaic */}
        {!hasGroups ? (
          <p className="mt-8 text-sm text-[var(--ipf-muted)]">
            {t("home.galleryDesc")}
          </p>
        ) : (
          <div
            className="mt-8 sm:mt-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
              if (!touchActiveRef.current) setPaused(false);
            }}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => {
              window.setTimeout(() => {
                if (!document.activeElement?.closest("[data-gallery]")) {
                  if (!touchActiveRef.current) setPaused(false);
                }
              }, 50);
            }}
            onTouchStart={() => {
              touchActiveRef.current = true;
              setPaused(true);
            }}
            onTouchEnd={() => {
              window.setTimeout(() => {
                touchActiveRef.current = false;
                setPaused(false);
              }, 3000);
            }}
            data-gallery
          >
            {/* Group container with crossfade. The group is positioned
               via grid on desktop (feature + 2 stacked), stacked on
               mobile (one landscape primary + two smaller side-by-side). */}
            <div
              key={groupIndex}
              className={`grid gap-3 sm:gap-4 lg:gap-5 ${
                reducedMotion ? "" : "animate-ipf-gallery-fade"
              } sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr]`}
              style={{
                animationDuration: reducedMotion ? "0s" : "900ms",
                animationTimingFunction: "cubic-bezier(.2,.8,.2,1)",
                animationFillMode: "both",
              }}
            >
              {/* Feature image */}
              <figure className="relative overflow-hidden rounded-2xl ring-1 ring-[#D6AD60]/30 shadow-[0_12px_30px_rgba(11,31,58,0.12)]">
                <img
                  src={activeGroup[0].src}
                  alt={activeGroup[0].alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] h-full w-full object-cover sm:aspect-[4/3] lg:aspect-[16/11]"
                />
              </figure>
              {/* Right column — two stacked images */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 lg:gap-5">
                {activeGroup.slice(1, 3).map((item) => (
                  <figure
                    key={item.src}
                    className="relative overflow-hidden rounded-2xl ring-1 ring-[#D6AD60]/30 shadow-[0_12px_30px_rgba(11,31,58,0.12)]"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square h-full w-full object-cover lg:aspect-[16/9]"
                    />
                  </figure>
                ))}
              </div>
            </div>

            {/* Progress + arrows */}
            {groups.length > 1 ? (
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[#D6AD60]/25">
                  <div
                    className="h-full rounded-full bg-[#5A0F1E] transition-[width] duration-500 ease-out"
                    style={{
                      width: `${Math.round(((groupIndex + 1) / groups.length) * 100)}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={retreat}
                    aria-label="Previous gallery images"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF8] text-[#5A0F1E] ring-1 ring-[#D6AD60]/60 shadow-sm transition hover:bg-[#D6AD60]/15 hover:ring-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={advance}
                    aria-label="Next gallery images"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF8] text-[#5A0F1E] ring-1 ring-[#D6AD60]/60 shadow-sm transition hover:bg-[#D6AD60]/15 hover:ring-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}

            <p className="mt-5 sm:hidden">
              <Link
                to="/events#ipf-gallery"
                className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline"
              >
                {t("home.openGallery")}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
