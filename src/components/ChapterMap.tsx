import { useState } from "react";
import { chapters } from "../data/platformContent";
import uaeMap from "../data/uaeMap.json";
import { cn } from "../lib/utils";

const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));

const pins: { id: string; x: number; y: number; label: string }[] = [
  { id: "abu-dhabi", x: 425, y: 305, label: "Abu Dhabi" },
  { id: "al-ain", x: 638, y: 332, label: "Al Ain" },
  { id: "dubai", x: 555, y: 178, label: "Dubai" },
  { id: "sharjah", x: 605, y: 142, label: "Sharjah" },
  { id: "ajman", x: 622, y: 122, label: "Ajman" },
  { id: "umm-al-quwain", x: 652, y: 102, label: "UAQ" },
  { id: "ras-al-khaimah", x: 705, y: 88, label: "RAK" },
  { id: "fujairah", x: 738, y: 172, label: "Fujairah" },
];

const abuDhabi = uaeMap.locations.find((item) => item.id === "abu-dhabi");
const otherEmirates = uaeMap.locations.filter((item) => item.id !== "abu-dhabi");

function openChapter(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function regionClass(selected: boolean) {
  return cn(
    "cursor-pointer stroke-white stroke-[1.5] transition",
    selected ? "fill-[var(--ipf-navy)]" : "fill-[#9bb3c9] hover:fill-[var(--ipf-saffron)]",
  );
}

export function ChapterMap() {
  const [active, setActive] = useState("dubai");
  const chapter = chapterById[active];

  function selectChapter(id: string, scrollToCard = false) {
    setActive(id);
    if (scrollToCard) openChapter(id);
  }

  return (
    <div className="grid overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] lg:grid-cols-[minmax(0,1.2fr)_16rem] lg:items-stretch">
      <div className="flex h-[min(38vh,240px)] items-center justify-center bg-[#eef3f8] p-2 sm:h-[min(42vh,300px)] sm:p-3 lg:h-[320px]">
        <svg
          viewBox={uaeMap.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full max-h-full max-w-full"
          role="img"
          aria-label="IPF chapters across the United Arab Emirates"
        >
          <defs>
            <clipPath id="ipf-abu-dhabi-land" clipPathUnits="userSpaceOnUse">
              <path d={abuDhabi?.path} />
            </clipPath>
            <mask id="ipf-abu-dhabi-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="760" height="613">
              <rect x="0" y="0" width="760" height="613" fill="white" />
              <path d={uaeMap.alAinClip} fill="black" />
            </mask>
          </defs>
          {otherEmirates.map((emirate) => (
            <path
              key={emirate.id}
              d={emirate.path}
              className={regionClass(emirate.id === active)}
              onClick={() => selectChapter(emirate.id)}
            >
              <title>{emirate.name}</title>
            </path>
          ))}
          {abuDhabi ? (
            <>
              <path
                d={abuDhabi.path}
                mask="url(#ipf-abu-dhabi-mask)"
                className={regionClass(active === "abu-dhabi")}
                onClick={() => selectChapter("abu-dhabi")}
              >
                <title>Abu Dhabi</title>
              </path>
              <path
                d={uaeMap.alAinClip}
                clipPath="url(#ipf-abu-dhabi-land)"
                className={cn(regionClass(active === "al-ain"), "stroke-[2]")}
                onClick={() => selectChapter("al-ain")}
              >
                <title>Al Ain</title>
              </path>
            </>
          ) : null}
          {pins.map((pin) => (
            <g key={pin.id} className="cursor-pointer" onClick={() => selectChapter(pin.id)}>
              <circle cx={pin.x} cy={pin.y} r={active === pin.id ? 9 : 7} fill="#ff9933" stroke="#0b1f3a" strokeWidth="2" />
              <text
                x={pin.x + 12}
                y={pin.y + 4}
                fill="#0b1f3a"
                fontSize="18"
                fontWeight="700"
                fontFamily="Noto Sans, sans-serif"
                className="max-sm:hidden"
              >
                {pin.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-col border-t border-[var(--ipf-line)] p-3 sm:p-4 lg:h-[320px] lg:border-l lg:border-t-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">IPF chapters</p>
        <ul className="mt-2 flex flex-wrap gap-1.5 lg:flex-1 lg:flex-col lg:flex-nowrap lg:gap-1 lg:overflow-y-auto">
          {chapters.map((item) => (
            <li key={item.id} className="lg:w-full">
              <button
                type="button"
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold sm:text-sm",
                  active === item.id ? "bg-[var(--ipf-navy)] text-white" : "bg-[var(--ipf-ivory)] text-[var(--ipf-navy)] hover:bg-[var(--ipf-navy)]/10",
                )}
                onClick={() => selectChapter(item.id, true)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        {chapter ? (
          <p className="mt-3 hidden text-xs leading-5 text-[var(--ipf-muted)] lg:block">
            {chapter.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
