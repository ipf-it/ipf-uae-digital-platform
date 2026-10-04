import { useEffect, useState } from "react";

const DESKTOP_SRC = "/hero/ipf-uae-hero-desktop.webm";
const MOBILE_SRC = "/hero/ipf-uae-hero-mobile.webm";
const DESKTOP_POSTER = "/hero/ipf-uae-hero-desktop-poster.webp";
const MOBILE_POSTER = "/hero/ipf-uae-hero-mobile-poster.webp";
const DESKTOP_BREAKPOINT = "(min-width: 768px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Responsive IPF UAE homepage hero.
 *
 * Asset selection — single native download per viewport
 *   The browser evaluates the `media` attribute on each <source> at load time
 *   and fetches only the matching one. On desktop (≥ 768px) only the
 *   2304×1080 WebM is requested; on narrower viewports only the 1080×1440
 *   WebM is requested. No JS branching, no duplicate downloads.
 *
 * Reduced motion
 *   When `prefers-reduced-motion: reduce` is set, the <video> is swapped for
 *   a matched <picture> + <img> poster so the hero is a still visual.
 *
 * The <video> poster attribute is kept in sync with the current breakpoint so
 * the first paint before playback is the correct still, matching the chosen
 * source.
 *
 * The video is treated as decorative (aria-hidden) — the actual hero copy
 * remains the <h1>, badge, and CTAs rendered by the parent hero section.
 */
export function HomeHeroVideo({ className = "" }: { className?: string }) {
  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(REDUCED_MOTION).matches
      : false,
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(DESKTOP_BREAKPOINT).matches
      : true,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mqReduce = window.matchMedia(REDUCED_MOTION);
    const mqBreak = window.matchMedia(DESKTOP_BREAKPOINT);
    const handleReduce = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    const handleBreak = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mqReduce.addEventListener("change", handleReduce);
    mqBreak.addEventListener("change", handleBreak);
    return () => {
      mqReduce.removeEventListener("change", handleReduce);
      mqBreak.removeEventListener("change", handleBreak);
    };
  }, []);

  // Reduced-motion fallback: a still poster, picked responsively.
  if (reduceMotion) {
    return (
      <picture>
        <source media={DESKTOP_BREAKPOINT} srcSet={DESKTOP_POSTER} />
        <img
          src={MOBILE_POSTER}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-center ${className}`.trim()}
        />
      </picture>
    );
  }

  const poster = isDesktop ? DESKTOP_POSTER : MOBILE_POSTER;
  // Desktop composition is centre-weighted; the mobile 3:4 composition reads
  // best when biased slightly upward of centre so the hero copy below the fold
  // does not crop out the main subject at tall viewports.
  const objectPosition = isDesktop ? "object-center" : "object-[50%_38%]";

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover ${objectPosition} ${className}`.trim()}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      // Explicit attributes avoid the mobile "download" / "fullscreen" controls
      // in some WebKit builds, and disable the native picture-in-picture button.
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
    >
      <source src={DESKTOP_SRC} type="video/webm" media={DESKTOP_BREAKPOINT} />
      <source src={MOBILE_SRC} type="video/webm" />
    </video>
  );
}
