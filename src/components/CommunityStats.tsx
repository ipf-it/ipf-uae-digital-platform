import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, UserRound, Users } from "lucide-react";
import { useCms } from "../cms/ContentProvider";
import { useCommunityStats } from "../hooks/useCommunityStats";
import { Container } from "./ui/Container";
import { cn } from "../lib/utils";

type StatKey = "members" | "yuva" | "events" | "chapters";

type StatCard = {
  key: StatKey;
  to: string;
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  hint: string;
  accent: string;
  accentSoft: string; // ~15% tint used for icon chip + border
};

/**
 * Per-card accent identity. Numbers themselves are rendered in deep ink so the
 * composition stays institutional; the accent lives in the top rule, the icon
 * chip and the hover ring. Values are the spec palette.
 */
const CARDS: readonly StatCard[] = [
  {
    key: "members",
    to: "/membership",
    icon: Users,
    label: "Members",
    hint: "Across the Emirates",
    accent: "#FF9933",
    accentSoft: "rgba(255,153,51,0.14)",
  },
  {
    key: "yuva",
    to: "/yuva",
    icon: UserRound,
    label: "IPF Yuva",
    hint: "Youth community",
    accent: "#5A0F1E",
    accentSoft: "rgba(90,15,30,0.12)",
  },
  {
    key: "events",
    to: "/events",
    icon: CalendarDays,
    label: "Events",
    hint: "Published programmes",
    accent: "#138808",
    accentSoft: "rgba(19,136,8,0.12)",
  },
  {
    key: "chapters",
    to: "/chapters",
    icon: MapPin,
    label: "UAE Chapters",
    hint: "Across the seven emirates",
    accent: "#D6AD60",
    accentSoft: "rgba(214,173,96,0.18)",
  },
];

const ANIMATION_MS = 1200;

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
 * Lightweight rAF-based count-up. Fires at most once per mount, when `enabled`
 * flips to true. If reduced motion is requested or target is 0, the final value
 * is set immediately.
 */
function useCountUp(target: number, enabled: boolean, reducedMotion: boolean): number {
  const [value, setValue] = useState<number>(0);
  const startedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    if (startedRef.current) {
      // Already animated once this mount — reflect any later data updates
      // directly, without a second animation.
      setValue(target);
      return;
    }
    startedRef.current = true;

    if (reducedMotion || target <= 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic — settles smoothly
      setValue(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(target); // land on the exact target
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, target, reducedMotion]);

  return value;
}

export function CommunityStats() {
  const { content } = useCms();
  const counts = useCommunityStats(content.eventHighlights.length);
  const reducedMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [inView]);

  const animated = {
    members: useCountUp(counts.members, inView, reducedMotion),
    yuva: useCountUp(counts.yuva, inView, reducedMotion),
    events: useCountUp(counts.events, inView, reducedMotion),
    chapters: useCountUp(counts.chapters, inView, reducedMotion),
  } as const;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ipf-glance-heading"
      className={cn(
        "relative isolate bg-[#FFF8EE] py-14 sm:py-16",
        // Slight 32px overlap into the hero on desktop so the stat row reads
        // as a bridge between hero and the next section.
        "lg:-mt-8 lg:py-20",
      )}
    >
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#D6AD60]">
            Our community
          </p>
          <h2
            id="ipf-glance-heading"
            className="mt-3 font-serif text-3xl font-bold tracking-tight text-[var(--ipf-navy)] sm:text-[2.25rem] lg:text-4xl"
          >
            IPF UAE at a Glance
          </h2>
          <p className="mt-3 text-sm text-[var(--ipf-muted)] sm:text-base">
            One community. Across the Emirates.
          </p>
        </header>

        <ul
          role="list"
          className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:mt-12 lg:grid-cols-4 lg:gap-6"
        >
          {CARDS.map((card) => {
            const Icon = card.icon;
            const displayed = animated[card.key];
            const target = counts[card.key];
            return (
              <li key={card.key} className="h-full">
                <Link
                  to={card.to}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 pt-6 shadow-[0_6px_18px_rgba(11,31,58,0.06)] ring-1 ring-[var(--ipf-line)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(11,31,58,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)] sm:p-6 sm:pt-7"
                  aria-label={`${card.label}: ${target.toLocaleString()}`}
                >
                  {/* Top accent rule — the only strong colour on the card edge. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ backgroundColor: card.accent }}
                  />

                  {/* Icon chip in the card's accent, soft fill + bold glyph. */}
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors group-hover:scale-[1.03] sm:h-11 sm:w-11"
                    style={{ backgroundColor: card.accentSoft, color: card.accent }}
                  >
                    <Icon size={22} />
                  </span>

                  {/* NUMBER — strongest visual element on the card. aria-hidden
                     because the <Link>'s aria-label already announces label + value;
                     keeps the animated counter out of the a11y tree. */}
                  <p
                    aria-hidden="true"
                    className="mt-5 font-serif text-[2.5rem] font-bold tabular-nums leading-none text-[var(--ipf-navy)] sm:text-5xl lg:text-[3.5rem]"
                    style={{ color: card.accent }}
                  >
                    {displayed.toLocaleString()}
                  </p>

                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ipf-navy)]">
                    {card.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ipf-muted)] sm:text-[0.8rem]">
                    {card.hint}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
