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
};

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
}: {
  count: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (next: number) => void;
  light?: boolean;
  caption?: string;
}) {
  if (count < 2 && !caption) return null;
  return (
    <>
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            className={cn(
              "absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white",
              light ? "bg-black/45" : "bg-[var(--ipf-navy)]/80",
            )}
            onClick={onPrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className={cn(
              "absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white",
              light ? "bg-black/45" : "bg-[var(--ipf-navy)]/80",
            )}
            onClick={onNext}
          >
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}
      <div className="absolute bottom-3 left-12 right-12 z-10 flex flex-col items-center gap-2 text-center">
        {caption ? <p className="max-w-xl text-sm font-semibold text-white drop-shadow">{caption}</p> : null}
        {count > 1 ? (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, itemIndex) => (
              <button
                key={itemIndex}
                type="button"
                aria-label={`Slide ${itemIndex + 1}`}
                aria-current={itemIndex === index}
                className={cn("h-2 w-2 rounded-full", itemIndex === index ? "bg-white" : "bg-white/45")}
                onClick={() => onSelect(itemIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function ImageCarousel({
  slides,
  className = "",
  heightClass = "h-[280px] sm:h-[400px] lg:h-[480px]",
  autoPlay = true,
  interval = 5500,
  framed = true,
  fit = "contain",
}: ImageCarouselProps) {
  const startX = useRef(0);
  const { index, setIndex, go, hover } = useCarousel(slides.length, interval, autoPlay);
  const slide = slides[index];

  if (slides.length === 0 || !slide) return null;

  const viewport = (
    <div
      className="relative overflow-hidden bg-[var(--ipf-navy)]"
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
          "w-full bg-[var(--ipf-navy)]",
          heightClass,
          fit === "contain" ? "object-contain object-center" : "object-cover object-top",
        )}
      />
      <Controls
        count={slides.length}
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onSelect={setIndex}
        caption={slide.title || slide.caption}
      />
    </div>
  );

  return (
    <figure className={cn("min-w-0", className)} aria-roledescription="carousel">
      {framed ? <TricolorFrame>{viewport}</TricolorFrame> : viewport}
    </figure>
  );
}

type HeroSlideshowProps = {
  slides: CarouselSlide[];
  children: ReactNode;
  interval?: number;
};

export function HeroSlideshow({ slides, children, interval = 7000 }: HeroSlideshowProps) {
  const { index, setIndex, go, hover } = useCarousel(slides.length, interval, true);
  const current = slides[index];

  if (slides.length === 0) return <>{children}</>;

  return (
    <section
      className="relative overflow-hidden bg-[var(--ipf-navy)] text-white"
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
    >
      {slides.map((item, itemIndex) => (
        <img
          key={`${item.src}-${itemIndex}`}
          src={item.src}
          alt={itemIndex === index ? item.alt : ""}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-[68%_center] transition-opacity duration-700",
            itemIndex === index ? "opacity-70" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.92)_0%,rgba(11,31,58,0.72)_38%,rgba(11,31,58,0.28)_68%,rgba(11,31,58,0.12)_100%)]" />
      <div className="relative">{children}</div>
      <Controls
        count={slides.length}
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onSelect={setIndex}
        light
        caption={current?.title}
      />
    </section>
  );
}
