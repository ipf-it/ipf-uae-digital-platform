import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chapterPath } from "../data/orgNav";
import { chapters } from "../data/platformContent";
import uaeMap from "../data/uaeMap.json";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";
import { motion, useReducedMotion } from "motion/react";

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

function regionClass(selected: boolean) {
  return cn(
    "cursor-pointer stroke-white stroke-[1.5] transition",
    selected ? "fill-[var(--ipf-navy)]" : "fill-[#9bb3c9] hover:fill-[var(--ipf-saffron)]",
  );
}

export function ChapterMap() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [active, setActive] = useState("dubai");
  const reduce = useReducedMotion();
  const chapter = chapterById[active];

  function selectChapter(id: string) {
    setActive(id);
    navigate(chapterPath(id));
  }

  return (
    <div className="chapter-directory-map grid overflow-hidden rounded-[1.5rem] border border-white/15 lg:grid-cols-[minmax(0,1.2fr)_18rem] lg:items-stretch">
      <div className="relative flex h-[min(48vh,330px)] items-center justify-center p-3 sm:h-[min(52vh,420px)] sm:p-5 lg:h-[460px]">
        <div className="chapter-directory-orbit" aria-hidden="true" />
        <svg
          viewBox={uaeMap.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full max-h-full max-w-full"
          role="img"
          aria-label={t("page.chapters.mapAria")}
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
            <motion.path
              key={emirate.id}
              d={emirate.path}
              className={regionClass(emirate.id === active)}
              onClick={() => selectChapter(emirate.id)}
              animate={emirate.id === active && !reduce ? { opacity:[1,.64,1] } : undefined}
              transition={{ duration:2.6, repeat:Infinity }}
            >
              <title>{emirate.name}</title>
            </motion.path>
          ))}
          {abuDhabi ? (
            <>
              <motion.path
                d={abuDhabi.path}
                mask="url(#ipf-abu-dhabi-mask)"
                className={regionClass(active === "abu-dhabi")}
                onClick={() => selectChapter("abu-dhabi")}
                animate={active === "abu-dhabi" && !reduce ? { opacity: [1, .64, 1] } : undefined}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <title>Abu Dhabi</title>
              </motion.path>
              <motion.path
                d={uaeMap.alAinClip}
                clipPath="url(#ipf-abu-dhabi-land)"
                className={cn(regionClass(active === "al-ain"), "stroke-[2]")}
                onClick={() => selectChapter("al-ain")}
                animate={active === "al-ain" && !reduce ? { opacity: [1, .64, 1] } : undefined}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <title>Al Ain</title>
              </motion.path>
            </>
          ) : null}
          {pins.map((pin) => (
            <g key={pin.id} className="cursor-pointer" onClick={() => selectChapter(pin.id)}>
              <circle cx={pin.x} cy={pin.y} r="24" fill="transparent" className="pointer-events-auto" />
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
      <div className="flex flex-col border-t border-white/10 bg-[#071a31]/72 p-4 text-white backdrop-blur-xl sm:p-5 lg:h-[460px] lg:border-l lg:border-t-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ipf-gold)]">Choose your chapter</p>
        <ul className="mt-2 flex flex-wrap gap-1.5 lg:flex-1 lg:flex-col lg:flex-nowrap lg:gap-1 lg:overflow-y-auto">
          {chapters.map((item) => (
            <li key={item.id} className="lg:w-full">
              <button
                type="button"
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-left text-xs font-semibold sm:text-sm",
                  active === item.id ? "bg-[var(--ipf-saffron)] text-[var(--ipf-navy)]" : "bg-white/8 text-white hover:bg-white/15",
                )}
                onClick={() => selectChapter(item.id)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        {chapter ? (
          <p className="mt-4 hidden border-t border-white/10 pt-4 text-xs leading-6 text-white/65 lg:block">
            {t(`page.chapter.note.${chapter.id}`)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
