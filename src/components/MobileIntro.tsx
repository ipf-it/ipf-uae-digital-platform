import { useEffect, useRef, useState, type RefObject } from "react";
import { BrandLoader } from "./BrandLoader";
import { BrandMark } from "./BrandMark";
import { site } from "../data/site";
import { cn } from "../lib/utils";

const EMBLEM_MS = 850;
const WORD_MS = 1400;
const ZOOM_MS = 1100;

type MobileIntroProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  onDone: () => void;
};

export function MobileIntro({ anchorRef, onDone }: MobileIntroProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"emblem" | "word" | "zoom">("emblem");
  const [fly, setFly] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const wordTimer = window.setTimeout(() => setPhase("word"), EMBLEM_MS);
    const zoomTimer = window.setTimeout(() => {
      const from = groupRef.current?.getBoundingClientRect();
      const to = anchorRef.current?.getBoundingClientRect();
      if (from && to && from.width > 0 && to.width > 0) {
        setFly({
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: to.width / from.width,
        });
      }
      setPhase("zoom");
    }, EMBLEM_MS + WORD_MS);
    const doneTimer = window.setTimeout(() => {
      document.body.style.overflow = "";
      onDone();
    }, EMBLEM_MS + WORD_MS + ZOOM_MS);

    return () => {
      window.clearTimeout(wordTimer);
      window.clearTimeout(zoomTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, [anchorRef, onDone]);

  return (
    <div
      className={cn("ipf-splash-overlay lg:hidden", phase === "zoom" && "ipf-splash-overlay--clear")}
      role="status"
      aria-live="polite"
      aria-label={`${site.brandMark} ${site.name}`}
    >
      <div
        ref={groupRef}
        className="ipf-splash-mark flex flex-col items-center"
        style={
          phase === "zoom"
            ? { transform: `translate3d(${fly.x}px, ${fly.y}px, 0) scale(${fly.scale})` }
            : undefined
        }
      >
        <div className="ipf-splash-emblem-in">
          <BrandLoader size={198} label={`${site.brandMark} emblem`} />
        </div>
        <BrandMark size="splash" reveal={phase !== "emblem"} className="mt-7" />
      </div>
    </div>
  );
}
