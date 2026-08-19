import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { TricolorFrame } from "./TricolorFrame";

export type CarouselSlide = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

type ImageCarouselProps = {
  slides: CarouselSlide[];
  className?: string;
  heightClass?: string;
  autoPlay?: boolean;
  interval?: number;
  framed?: boolean;
  fit?: "cover" | "contain";
  positionClass?: string;
};

function uniqueSlides(slides: CarouselSlide[]) {
  const seen = new Set<string>();
  return slides.filter((slide) => {
    if (!slide.src || seen.has(slide.src)) return false;
    seen.add(slide.src);
    return true;
  });
}

function useCarousel(length: number, interval: number, autoPlay: boolean) {
  const [index, setIndex] = useState(0);
  const hover = useRef(false);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback(
    (next: number) => {
      if (length < 1) return;
      setIndex((current) => (current + next + length) % length);
    },
    [length],
  );

  useEffect(() => {
    setIndex(0);
  }, [length]);

  useEffect(() => {
    if (!autoPlay || reduceMotion || length < 2) return;
    const timer = window.setInterval(() => {
      if (!hover.current) go(1);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, go, interval, length, reduceMotion]);

  return { index, setIndex, go, hover };
}

function Controls({
  count,
  index,
  onPrev,
  onNext,
  onSelect,
  light = false,
  caption,
  compact = false,
}: {
  count: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (next: number) => void;
  light?: boolean;
  caption?: string;
  compact?: boolean;
}) {
  if (count < 2 && !caption) return null;
  const showDots = count > 1 && count <= 6;

  return (
    <>
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            className={cn(
              "absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-sm backdrop-blur-md transition hover:scale-105 sm:left-3",
              light ? "bg-black/40 hover:bg-black/55" : "bg-[var(--ipf-navy)]/75 hover:bg-[var(--ipf-navy)]",
            )}
            onClick={onPrev}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className={cn(
              "absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-sm backdrop-blur-md transition hover:scale-105 sm:right-3",
              light ? "bg-black/40 hover:bg-black/55" : "bg-[var(--ipf-navy)]/75 hover:bg-[var(--ipf-navy)]",
            )}
            onClick={onNext}
          >
            <ChevronRight size={18} />
          </button>
        </>
      ) : null}
      {compact ? (
        count > 1 ? (
          <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, itemIndex) => (
              <button
                key={itemIndex}
                type="button"
                aria-label={`Slide ${itemIndex + 1}`}
                aria-current={itemIndex === index}
                className={cn(
                  "h-2 rounded-full transition",
                  itemIndex === index ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
                )}
                onClick={() => onSelect(itemIndex)}
              />
            ))}
          </div>
        ) : null
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgba(11,31,58,0.82)] via-[rgba(11,31,58,0.35)] to-transparent px-10 pb-4 pt-14 text-center">
          {caption ? (
            <p className="mx-auto max-w-2xl text-sm font-semibold leading-6 text-white sm:text-base">{caption}</p>
          ) : null}
          {count > 1 ? (
            <div className={cn("flex items-center justify-center", caption ? "mt-3" : "")}>
              {showDots ? (
                <div className="flex gap-2">
                  {Array.from({ length: count }).map((_, itemIndex) => (
                    <button
                      key={itemIndex}
                      type="button"
                      aria-label={`Slide ${itemIndex + 1}`}
                      aria-current={itemIndex === index}
                      className={cn(
                        "h-2 rounded-full transition",
                        itemIndex === index ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
                      )}
                      onClick={() => onSelect(itemIndex)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-semibold tracking-wide text-white/85">
                  {index + 1} / {count}
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

export function ImageCarousel({
  slides,
  className = "",
  heightClass = "aspect-video h-auto max-h-[70vh] w-full",
  autoPlay = true,
  interval = 5500,
  framed = true,
  fit = "cover",
  positionClass = "object-top",
}: ImageCarouselProps) {
  const items = uniqueSlides(slides);
  const startX = useRef(0);
  const { index, setIndex, go, hover } = useCarousel(items.length, interval, autoPlay);
  const slide = items[index];

  if (!slide) return null;

  const viewport = (
    <div
      className={cn("relative overflow-hidden bg-[var(--ipf-navy)]", heightClass)}
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
      onPointerDown={(event) => {
        startX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        const delta = event.clientX - startX.current;
        if (delta > 40) go(-1);
        if (delta < -40) go(1);
      }}
    >
      <img
        src={slide.src}
        alt={slide.alt}
        className={cn(
          "absolute inset-0 h-full w-full max-w-none",
          fit === "contain"
            ? "object-contain object-center"
            : cn("object-contain object-center ipf-photo-cover-desktop", positionClass),
        )}
      />
      <Controls
        count={items.length}
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onSelect={setIndex}
        caption={slide.title || slide.caption}
      />
    </div>
  );

  return (
    <figure className={cn("min-w-0 overflow-hidden", className)} aria-roledescription="carousel">
      {framed ? <TricolorFrame>{viewport}</TricolorFrame> : viewport}
    </figure>
  );
}

type HeroSlideshowProps = {
  slides: CarouselSlide[];
  children: ReactNode;
  interval?: number;
  fillViewport?: boolean;
};

export function HeroSlideshow({ slides, children, interval = 7000, fillViewport = false }: HeroSlideshowProps) {
  const items = uniqueSlides(slides);
  const { index, setIndex, go, hover } = useCarousel(items.length, interval, true);

  if (items.length === 0) return <>{children}</>;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[var(--ipf-navy)] text-white",
        fillViewport && "flex min-h-[calc(100dvh-6.75rem)] flex-col",
      )}
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
    >
      {items.map((item, itemIndex) => (
        <img
          key={`${item.src}-${itemIndex}`}
          src={item.src}
          alt={itemIndex === index ? item.alt : ""}
          className={cn(
            "absolute inset-0 h-full w-full max-w-none object-cover object-[68%_center] transition-opacity duration-700",
            itemIndex === index ? "opacity-70" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.92)_0%,rgba(11,31,58,0.72)_38%,rgba(11,31,58,0.28)_68%,rgba(11,31,58,0.12)_100%)]" />
      <div className={cn("relative", fillViewport && "flex flex-1 flex-col justify-center")}>{children}</div>
      <Controls
        count={items.length}
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onSelect={setIndex}
        light
        compact
      />
    </section>
  );
}
