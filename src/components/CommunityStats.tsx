import { useEffect, useRef, useState } from "react";
import { useCms } from "../cms/ContentProvider";
import { useCommunityStats } from "../hooks/useCommunityStats";
import { Container } from "./ui/Container";

type StatKey = "members" | "yuva" | "events" | "chapters";

type StatEntry = {
  readonly key: StatKey;
  readonly label: string;
};

/**
 * Thin, unified burgundy band. Four live statistics from the existing
 * useCommunityStats hook — no hard-coded numbers, no cards, no shadows,
 * no per-statistic surfaces. All four are the same visual weight.
 */
const ENTRIES: readonly StatEntry[] = [
  { key: "members", label: "Members" },
  { key: "yuva", label: "IPF Yuva" },
  { key: "events", label: "Events" },
  { key: "chapters", label: "UAE Chapters" },
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
 * Lightweight count-up: eases from 0 → target over ANIMATION_MS once per
 * mount when `enabled` flips true. Reduced motion / zero target → final
 * value in one tick.
 */
function useCountUp(target: number, enabled: boolean, reducedMotion: boolean): number {
  const [value, setValue] = useState<number>(0);
  const startedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    if (startedRef.current) {
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
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
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

  // One useCountUp call per statistic, deterministic order.
  const animated = {
    members: useCountUp(counts.members, inView, reducedMotion),
    yuva: useCountUp(counts.yuva, inView, reducedMotion),
    events: useCountUp(counts.events, inView, reducedMotion),
    chapters: useCountUp(counts.chapters, inView, reducedMotion),
  } as const;

  return (
    <section
      ref={sectionRef}
      aria-label="IPF UAE community statistics"
      className="bg-[#5A0F1E] py-6 sm:py-7 lg:py-8"
    >
      <Container>
        {/* grid-cols-2 on mobile → 2×2 compact; four equal columns on desktop
           with subtle ivory dividers so the four stats read as ONE strip. */}
        <ul
          role="list"
          className="grid grid-cols-2 gap-y-5 lg:grid-cols-4 lg:gap-y-0"
        >
          {ENTRIES.map((entry, idx) => {
            const target = counts[entry.key];
            const displayed = animated[entry.key];
            // Hairline dividers on desktop between items 2/3/4; mobile gets no
            // divider — the row gap plus column gap already carry the beat.
            const dividerClass =
              idx > 0 ? "lg:border-l lg:border-[#FFF8EE]/15" : "";
            return (
              <li
                key={entry.key}
                className={`text-center ${dividerClass} lg:px-4`.trim()}
              >
                <p
                  aria-hidden="true"
                  className="font-serif text-[2rem] font-bold leading-none tabular-nums text-[#D6AD60] sm:text-[2.25rem] lg:text-[2.5rem]"
                >
                  {displayed.toLocaleString()}
                </p>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#FFF8EE]/85 sm:text-[0.7rem]">
                  {entry.label}
                </p>
                {/* Live total exposed only to assistive tech so screen readers
                   hear the final value, not the count-up noise. */}
                <span className="sr-only">
                  {entry.label}: {target.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
