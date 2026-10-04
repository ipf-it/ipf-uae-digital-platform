import { useEffect, useRef, useState } from "react";
import { homeStats } from "../data/homeStats";
import { Container } from "./ui/Container";

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
 * One-shot easeOutCubic count-up from 0 → target. Fires once per mount when
 * `enabled` flips true. Reduced motion / zero target → final value immediately.
 * The suffix (e.g. "+") is appended by the component, so this hook only
 * animates the numeric part.
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

/**
 * Thin, unified burgundy statistics band directly below the identity section.
 * No cards, no shadows, no per-stat backgrounds — four equal zones separated
 * only by hairline ivory dividers so the row reads as a single institutional
 * strip. Values come from the static homeStats config in src/data/homeStats.ts
 * (CMS-ready contract).
 */
export function CommunityStats() {
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

  // One useCountUp call per statistic, deterministic order to satisfy
  // React's rules of hooks.
  const [members, yuva, events, chapters] = homeStats;
  const animated: Record<string, number> = {
    members: useCountUp(members.value, inView, reducedMotion),
    yuva: useCountUp(yuva.value, inView, reducedMotion),
    events: useCountUp(events.value, inView, reducedMotion),
    chapters: useCountUp(chapters.value, inView, reducedMotion),
  };

  return (
    <section
      ref={sectionRef}
      aria-label="IPF UAE community statistics"
      className="bg-[#5A0F1E] py-6 sm:py-7 lg:py-8"
    >
      <Container>
        {/* grid-cols-2 (2×2) on mobile, lg:grid-cols-4 on desktop — one
           unified band with hairline white/15 dividers on the desktop row. */}
        <ul
          role="list"
          className="grid grid-cols-2 gap-y-5 lg:grid-cols-4 lg:gap-y-0"
        >
          {homeStats.map((entry, idx) => {
            const displayed = animated[entry.key];
            const final = `${entry.value.toLocaleString()}${entry.suffix}`;
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
                  {entry.suffix}
                </p>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#FFF8EE]/85 sm:text-[0.7rem]">
                  {entry.label}
                </p>
                {/* Final value exposed to assistive tech instead of the
                   count-up noise. */}
                <span className="sr-only">
                  {entry.label}: {final}
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
