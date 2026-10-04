import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../cms/ContentProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { Container } from "./ui/Container";

const BG_WEBP = "/images/home/events-background.webp";
const BG_PNG = "/images/home/events-background.png";

/* Autoplay cycle: 5000 ms = ~4.2 s compositional hold + ~800 ms native
   smooth-scroll transition on each advance. The user explicitly approved
   a slow cinematic carousel — this is content movement, not decoration. */
const AUTOPLAY_MS = 5000;

/* ─────────────────────────────────────────────────────────────────────────
 * HomeEvents — premium editorial, seamless, slow continuous event carousel
 *
 * Data
 *   Reads `content.eventHighlights` directly from the CMS content
 *   provider. Each entry is CMS-editable via /api/cms/content; admins
 *   add/edit/delete/reorder/toggle without a code change. Seed data
 *   lives in src/data/platformContent.ts → `homeEventsCarousel`.
 *
 * Carousel
 *   Horizontal scroll-snap list. Six real cards are rendered TWICE back
 *   to back so autoplay produces a truly seamless loop: when scrollLeft
 *   crosses the width of the first copy, we instantly subtract that
 *   width (invisible — the two halves are byte-identical content). This
 *   avoids the fast "snap back to start" rewind that disqualifies most
 *   naive carousels from feeling cinematic.
 *
 * Motion
 *   Autoplay advances by one card every AUTOPLAY_MS using the browser's
 *   native smooth-scroll. Pauses on pointer hover, keyboard focus-within,
 *   touch (3 s grace), and document.hidden. prefers-reduced-motion
 *   disables autoplay entirely; arrows + swipe remain fully usable.
 *
 * Decorative animation audit
 *   The homepage parent `.home-theme-page > section::before` CSS at
 *   src/index.css:440-441 renders a rotating saffron/green mandala over
 *   every DIRECT <section> child. HomeEvents is intentionally wrapped in
 *   a <div> inside HomePage.tsx so the CSS selector never matches — the
 *   mandala rotation does not render over or around this section. Inside
 *   this component there are no rotations, radial pulses, parallax,
 *   particles, reveal wrappers, IntersectionObserver effects, or
 *   decorative keyframe animations. The ONLY motion is the approved
 *   carousel advance.
 * ────────────────────────────────────────────────────────────────────── */

type SvgIconProps = { className?: string };

function ChevronLeftIcon({ className }: SvgIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <polyline points="15 6 9 12 15 18" />
    </svg>
  );
}

function ChevronRightIcon({ className }: SvgIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function LocationIcon({ className }: SvgIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
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

function formatEventDate(raw: string | undefined): string {
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).formatToParts(parsed);
  const dd = parts.find((p) => p.type === "day")?.value ?? "";
  const mmm = parts.find((p) => p.type === "month")?.value?.toUpperCase() ?? "";
  const yyyy = parts.find((p) => p.type === "year")?.value ?? "";
  return `${dd} ${mmm} ${yyyy}`.trim();
}

type EventCard = {
  id: string;
  title: string;
  date: string;
  startsAt?: string;
  location?: string;
  category?: string;
  image: string;
  alt: string;
};

export function HomeEvents() {
  const { t } = useLocale();
  const { content } = useCms();
  const reducedMotion = usePrefersReducedMotion();

  const cards = useMemo<EventCard[]>(() => {
    return content.eventHighlights.slice(0, 6).map((event) => {
      const firstSlide = event.slides?.[0];
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        startsAt: event.startsAt,
        location: event.location,
        category: event.category,
        image: firstSlide?.src ?? "",
        alt: firstSlide?.alt ?? event.title,
      };
    });
  }, [content.eventHighlights]);

  const originalCount = cards.length;
  const trackCards = useMemo(() => [...cards, ...cards], [cards]);

  const trackRef = useRef<HTMLUListElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const touchActiveRef = useRef<boolean>(false);
  const resettingRef = useRef<boolean>(false);

  /* Returns the horizontal step for one card (card width + gap). */
  const stepPx = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    const second = first?.nextElementSibling as HTMLElement | null;
    if (first && second) return second.offsetLeft - first.offsetLeft;
    return first?.offsetWidth ?? el.clientWidth;
  }, []);

  /* Width of the first copy of the duplicated track — the invisible wrap point. */
  const halfWidth = useCallback(() => stepPx() * originalCount, [stepPx, originalCount]);

  const next = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: stepPx(), behavior: "smooth" });
  }, [stepPx]);

  const prev = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // If we're already at the left-edge of the first copy, invisibly jump
    // forward by one halfWidth so the smooth-scroll leftward still has
    // room — this preserves the seamless loop in BOTH directions.
    if (el.scrollLeft <= 2) {
      resettingRef.current = true;
      el.scrollLeft = halfWidth();
      // Next frame: perform the smooth back-step.
      requestAnimationFrame(() => {
        resettingRef.current = false;
        el.scrollBy({ left: -stepPx(), behavior: "smooth" });
      });
      return;
    }
    el.scrollBy({ left: -stepPx(), behavior: "smooth" });
  }, [halfWidth, stepPx]);

  /* Autoplay */
  useEffect(() => {
    if (reducedMotion || paused || originalCount <= 1) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      next();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, originalCount, next]);

  /* Seamless loop + progress indicator.
     - When scrollLeft crosses the first-copy width, invisibly subtract
       that width. User sees the content continue without a rewind. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (resettingRef.current) return;
      const half = halfWidth();
      if (half > 0 && el.scrollLeft >= half - 1) {
        resettingRef.current = true;
        el.scrollLeft = el.scrollLeft - half;
        // Give the browser one frame to settle before accepting scrolls again.
        requestAnimationFrame(() => {
          resettingRef.current = false;
        });
      }
      // Progress reflects position within the first copy only.
      const effectiveMax = half || el.scrollWidth - el.clientWidth;
      const within = el.scrollLeft % Math.max(1, half || el.scrollLeft || 1);
      setProgress(effectiveMax > 0 ? within / effectiveMax : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [halfWidth, originalCount]);

  /* Pause when tab backgrounded */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
      else if (!touchActiveRef.current) setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <section
      aria-labelledby="ipf-events-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      {/* Approved Events background — Elegant Indian-Arabian Waterfront Banner.
         object-position biased slightly left so the bottom-left tricolour
         detail stays visible when the section crops horizontally. The
         background is NOT the newly-approved Gallery artwork — the two
         sections intentionally sit on different approved assets. */}
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
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[35%_center] opacity-90"
        />
      </picture>

      <Container className="relative py-12 sm:py-14 lg:py-16">
        {/* Editorial header: left = eyebrow + heading; right = supporting
           line + 'View all events →'. Composed as a two-column grid at
           ≥lg so the right rail doesn't swallow the heading at mid-widths. */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <p
              id="ipf-events-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              Events
            </p>
            <h2 className="mt-2 font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[var(--ipf-navy)] sm:text-[1.95rem] lg:text-[2.1rem]">
              Connecting our community
              <br className="hidden sm:block" /> through meaningful experiences.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-start lg:items-end lg:text-right">
            <p className="max-w-md text-[0.95rem] leading-relaxed text-[#2a3340]">
              Programmes, cultural celebrations, community initiatives and
              engagements organised across IPF UAE.
            </p>
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F]"
            >
              {t("home.allEvents")}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Carousel */}
        {originalCount === 0 ? (
          <p className="mt-8 text-sm text-[var(--ipf-muted)]">
            {t("page.events.emptyUpcoming")}
          </p>
        ) : (
          <div
            className="relative mt-8 sm:mt-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
              if (!touchActiveRef.current) setPaused(false);
            }}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => {
              window.setTimeout(() => {
                const el = trackRef.current;
                if (el && !el.contains(document.activeElement)) {
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
          >
            <ul
              ref={trackRef}
              role="list"
              aria-label={t("home.allEvents")}
              className="ipf-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5 lg:gap-6"
              style={{ scrollbarWidth: "none" }}
            >
              {trackCards.map((event, index) => {
                const dateStr = formatEventDate(event.startsAt || event.date);
                /* Mobile 85 % + lg 3 cards + xl 3.3 cards (slight 4th peek).
                   10 % next-card peek on mobile is INTENTIONAL (user spec). */
                return (
                  <li
                    key={`${event.id}-${index}`}
                    className="snap-start shrink-0 basis-[88%] sm:basis-[48%] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/3.3)]"
                  >
                    <Link
                      to={`/events/${event.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[16px] bg-[#FFFDF8] shadow-[0_10px_28px_rgba(11,31,58,0.09)] ring-1 ring-[#D6AD60]/35 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(11,31,58,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                    >
                      {/* Image region — ~60 % of card height via a locked 16:10 aspect
                         ratio. object-cover guarantees consistent framing even when
                         CMS admins upload varying source photographs. */}
                      <div className="relative overflow-hidden bg-[#F1EBDA]">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.alt}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-[#F3EADA] to-[#E8DBB8]">
                            <span className="font-serif text-[1.5rem] font-bold text-[#8B6A1F]/60">IPF</span>
                          </div>
                        )}
                      </div>
                      {/* Info region — ~40 % of card. Fixed min-height so all
                         cards align vertically even with varying title/location
                         lengths. flex-1 pushes 'View event →' to the bottom. */}
                      <div className="flex min-h-[12.5rem] flex-1 flex-col gap-2.5 p-5 sm:p-6">
                        {event.category ? (
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#8B6A1F]">
                            {event.category}
                          </p>
                        ) : null}
                        <h3 className="line-clamp-2 font-serif text-[1.05rem] font-bold leading-[1.3] text-[var(--ipf-navy)] sm:text-[1.125rem]">
                          {event.title}
                        </h3>
                        <p className="line-clamp-1 inline-flex items-center gap-1.5 text-[0.8rem] text-[#55606d]">
                          {dateStr ? <span className="font-semibold text-[#1c2430]">{dateStr}</span> : null}
                          {dateStr && event.location ? <span aria-hidden="true" className="text-[#8B6A1F]/60">·</span> : null}
                          {event.location ? (
                            <span className="inline-flex items-center gap-1">
                              <LocationIcon className="h-3.5 w-3.5 text-[#8B6A1F]" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-auto pt-3 text-[0.825rem] font-semibold text-[#5A0F1E]">
                          View event{" "}
                          <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">
                            &rarr;
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Progress bar + ivory arrow buttons. 0..1 progress wraps every
               full loop so the bar never slams back to zero visibly. */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[#D6AD60]/25">
                <div
                  className="h-full rounded-full bg-[#5A0F1E] transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.max(8, Math.round(progress * 100))}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous event"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF8] text-[#5A0F1E] ring-1 ring-[#D6AD60]/60 shadow-sm transition hover:bg-[#D6AD60]/15 hover:ring-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next event"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF8] text-[#5A0F1E] ring-1 ring-[#D6AD60]/60 shadow-sm transition hover:bg-[#D6AD60]/15 hover:ring-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>
        )}
      </Container>
    </section>
  );
}
