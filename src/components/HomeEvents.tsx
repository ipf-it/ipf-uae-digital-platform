import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useLocale } from "../i18n/LocaleProvider";
import { Container } from "./ui/Container";

const BG_WEBP = "/images/home/events-background.webp";
const BG_PNG = "/images/home/events-background.png";
const AUTOPLAY_MS = 7000;

/**
 * Homepage Events — premium slow horizontal carousel on the approved
 * waterfront heritage background.
 *
 * Data
 *   Reads from the same source of truth used by the Events page:
 *   usePublicEvents({ tab: 'upcoming', featured: true }) first; falls back
 *   to generic upcoming events if there are no featured. Reuses the live
 *   CMS architecture — no duplicate data model.
 *
 * Motion
 *   Scroll-snap horizontal list. Autoplay advances by one card every 7 s
 *   with a native smooth scroll (browser's own 400–600 ms curve). Pauses on
 *   pointer hover, keyboard focus within the carousel, touch interaction,
 *   and when document.hidden becomes true (tab backgrounded). Respects
 *   prefers-reduced-motion by disabling autoplay entirely while leaving
 *   the arrows and swipe fully functional.
 *
 * Controls
 *   Previous/Next ivory circle buttons with heritage-gold ring and
 *   burgundy inline SVG chevrons. A thin progress line underneath tracks
 *   the current card position; no fat dots.
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

function LocationIcon({ className }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
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

/**
 * Format an ISO date (or free-form date string) as "18 OCT 2026" uppercase.
 * Falls back to the raw string if the input is not a parseable date so
 * CMS-supplied free-form dates still render.
 */
function formatEventDate(raw: string): string {
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(parsed);
  const dd = parts.find((p) => p.type === "day")?.value ?? "";
  const mmm = parts.find((p) => p.type === "month")?.value?.toUpperCase() ?? "";
  const yyyy = parts.find((p) => p.type === "year")?.value ?? "";
  return `${dd} ${mmm} ${yyyy}`.trim();
}

export function HomeEvents() {
  const { t } = useLocale();
  const reducedMotion = usePrefersReducedMotion();

  const { events: featured } = usePublicEvents({ tab: "upcoming", featured: true });
  const { events: upcoming } = usePublicEvents({ tab: "upcoming" });
  const list = (featured.length > 0 ? featured : upcoming).slice(0, 6);

  const scrollRef = useRef<HTMLUListElement | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0..1

  // Pause state driven by hover, focus-within, touch, and document visibility
  const [paused, setPaused] = useState<boolean>(false);
  const touchActiveRef = useRef<boolean>(false);

  const stepPx = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return el.clientWidth;
    // Advance by one card plus the inter-card gap (which equals the
    // distance from the first child's right edge to the second child's
    // left edge, i.e. offsetLeft of the second child).
    const second = first.nextElementSibling as HTMLElement | null;
    if (second) return second.offsetLeft - first.offsetLeft;
    return first.offsetWidth;
  }, []);

  const next = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = stepPx();
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
  }, [stepPx]);

  const prev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = stepPx();
    const atStart = el.scrollLeft <= 2;
    const target = atStart ? el.scrollWidth : el.scrollLeft - step;
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [stepPx]);

  // Autoplay
  useEffect(() => {
    if (reducedMotion || paused || list.length <= 1) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      next();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, list.length, next]);

  // Track progress for the thin indicator
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [list.length]);

  // Pause when tab hidden
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
         detail stays visible when the section is cropped horizontally. */}
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
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[35%_center]"
        />
      </picture>

      <Container className="relative py-12 sm:py-14 lg:py-16">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p
              id="ipf-events-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              Events
            </p>
            <h2 className="mt-2 font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[var(--ipf-navy)] sm:text-[1.95rem] lg:text-[2.1rem]">
              Stories of service, culture
              <br className="hidden sm:block" /> and community.
            </h2>
          </div>
          <Link
            to="/events"
            className="group hidden shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F] sm:inline-flex"
          >
            {t("home.allEvents")}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>

        {/* Carousel */}
        {list.length === 0 ? (
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
              // Small delay so focus moving between inner elements doesn't un-pause
              window.setTimeout(() => {
                const el = scrollRef.current;
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
              ref={scrollRef}
              role="list"
              className="ipf-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5 lg:gap-6"
              style={{ scrollbarWidth: "none" }}
              aria-label={t("home.allEvents")}
            >
              {list.map((event) => {
                const img = event.image || event.slides[0]?.src;
                const alt = event.slides[0]?.alt ?? event.title;
                const dateStr = formatEventDate(event.startsAt || event.date);
                return (
                  <li
                    key={event.id}
                    className="snap-start shrink-0 basis-[85%] sm:basis-[48%] lg:basis-[calc((100%-3rem)/3)]"
                  >
                    <Link
                      to={`/events/${event.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-[#FFFDF8] shadow-[0_10px_28px_rgba(11,31,58,0.10)] ring-1 ring-[#D6AD60]/35 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(11,31,58,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F]"
                    >
                      {img ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={img}
                            alt={alt}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] w-full bg-[#F1EBDA]" />
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        {dateStr ? (
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#8B6A1F]">
                            {dateStr}
                          </p>
                        ) : null}
                        <h3 className="font-serif text-[1.1rem] font-bold leading-snug text-[var(--ipf-navy)]">
                          {event.title}
                        </h3>
                        {event.location ? (
                          <p className="inline-flex items-center gap-1.5 text-[0.825rem] text-[var(--ipf-muted)]">
                            <LocationIcon className="h-4 w-4 text-[#8B6A1F]" />
                            {event.location}
                          </p>
                        ) : null}
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

            {/* Progress + arrows row */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[#D6AD60]/25">
                <div
                  className="h-full rounded-full bg-[#5A0F1E] transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.max(10, Math.round(progress * 100))}%` }}
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

            {/* 'View all events' repeated for mobile where it was hidden above */}
            <p className="mt-5 sm:hidden">
              <Link
                to="/events"
                className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline"
              >
                {t("home.allEvents")}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
