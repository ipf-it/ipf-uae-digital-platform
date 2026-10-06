import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { chapterPath } from "../data/orgNav";
import { chapters } from "../data/platformContent";
import uaeMap from "../data/uaeMap.json";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

/* ───────────────────────────────────────────────────────────────────────
 * ChapterMap — premium ivory/parchment UAE map (6 Oct 2026).
 *
 * Previous implementation used a dark navy backdrop with saffron pins
 * and a glass-ish selector panel. Rebuilt here to the premium IPF
 * visual system per the Chapters page redesign brief:
 *   • warm ivory/parchment surface
 *   • muted navy/blue-grey UAE geography
 *   • fine gold details
 *   • gold location markers; saffron ACTIVE marker
 *   • deep navy text
 *   • subtle border + restrained radius + soft shadow
 *   • left: map · right: selected-chapter info + navigation
 *
 * Only the seven current UAE chapters are offered as pins and buttons.
 * The ChapterPage route still supports /chapters/al-ain if that record
 * exists in the DB — we simply don't surface it here per the current
 * 2026 organisational structure (CHAPTER_COUNT = 7).
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";
const SAFFRON = "#E8871E";

/* Eight currently-routed chapter experiences — matches ChaptersPage.
   NOTE: authoritative 2026 count is 7, but 8 routes are live in prod
   (incl. Al Ain). Preserved pending Rockstar reconciliation. */
const EIGHT_CHAPTER_IDS = new Set([
  "dubai",
  "abu-dhabi",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
  "al-ain",
]);

const chapterById = Object.fromEntries(
  chapters.filter((c) => EIGHT_CHAPTER_IDS.has(c.id)).map((c) => [c.id, c]),
);

const PINS: { id: string; x: number; y: number; label: string }[] = [
  { id: "abu-dhabi", x: 425, y: 305, label: "Abu Dhabi" },
  { id: "al-ain", x: 638, y: 332, label: "Al Ain" },
  { id: "dubai", x: 555, y: 178, label: "Dubai" },
  { id: "sharjah", x: 605, y: 142, label: "Sharjah" },
  { id: "ajman", x: 622, y: 122, label: "Ajman" },
  { id: "umm-al-quwain", x: 652, y: 102, label: "UAQ" },
  { id: "ras-al-khaimah", x: 705, y: 88, label: "RAK" },
  { id: "fujairah", x: 738, y: 172, label: "Fujairah" },
];

const CHAPTER_BUTTON_ORDER = [
  "dubai",
  "abu-dhabi",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
  "al-ain",
];

function regionClass(selected: boolean) {
  return cn(
    "cursor-pointer stroke-[#FFFBF2] stroke-[1.5] transition-colors duration-200",
    selected
      ? "fill-[var(--ipf-navy)]"
      : "fill-[#C7D0D9] hover:fill-[#A6B4C2]",
  );
}

export function ChapterMap() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [active, setActive] = useState("dubai");
  const chapter = chapterById[active];
  const abuDhabi = useMemo(
    () => uaeMap.locations.find((item) => item.id === "abu-dhabi"),
    [],
  );
  const otherEmirates = useMemo(
    () => uaeMap.locations.filter((item) => item.id !== "abu-dhabi"),
    [],
  );

  function selectChapter(id: string) {
    setActive(id);
  }

  function goChapter(id: string) {
    navigate(chapterPath(id));
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#D6AD60]/35 bg-[#FFFBF2] shadow-[0_10px_28px_rgba(11,31,58,0.08)]">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] lg:items-stretch">
        {/* ─── MAP ─── */}
        <div className="relative flex min-h-[320px] items-center justify-center p-5 sm:min-h-[420px] sm:p-6 lg:min-h-[460px] lg:p-8">
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
                {/* Al Ain renders as a clipped sub-region of Abu Dhabi */}
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
            {PINS.map((pin) => {
              const isActive = active === pin.id;
              return (
                <g
                  key={pin.id}
                  className="cursor-pointer"
                  onClick={() => selectChapter(pin.id)}
                >
                  <circle cx={pin.x} cy={pin.y} r="26" fill="transparent" className="pointer-events-auto" />
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isActive ? 10 : 7}
                    fill={isActive ? SAFFRON : GOLD}
                    stroke="#5A0F1E"
                    strokeOpacity="0.5"
                    strokeWidth="1.4"
                  />
                  <text
                    x={pin.x + 14}
                    y={pin.y + 5}
                    fill={isActive ? "#5A0F1E" : INK}
                    fontSize="16"
                    fontWeight={isActive ? "700" : "600"}
                    fontFamily="Noto Sans, sans-serif"
                    className="max-sm:hidden pointer-events-none"
                  >
                    {pin.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ─── RIGHT · SELECTOR + CHAPTER INFO ─── */}
        <div className="flex flex-col gap-5 border-t border-[#D6AD60]/30 bg-[#FFF8EE] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
              Choose your chapter
            </p>
            <ul role="list" className="mt-3 flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              {CHAPTER_BUTTON_ORDER.map((id) => {
                const item = chapterById[id];
                if (!item) return null;
                const isActive = active === id;
                return (
                  <li key={id} className="lg:w-full">
                    <button
                      type="button"
                      className={cn(
                        "inline-flex w-full items-center justify-start rounded-md border px-3 py-2 text-left text-[0.85rem] font-semibold transition",
                        isActive
                          ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-[#FFF8EE]"
                          : "border-[#D6AD60]/40 bg-white/70 text-[var(--ipf-navy)] hover:border-[#D6AD60] hover:bg-[#FFFBF2]",
                      )}
                      onClick={() => selectChapter(id)}
                      aria-pressed={isActive}
                    >
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {chapter ? (
            <div className="mt-1 border-t border-[#D6AD60]/30 pt-4">
              <p className="font-serif text-[1.1rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                {chapter.name} Chapter
              </p>
              <p className="mt-2 text-[0.85rem] leading-relaxed" style={{ color: MUTED }}>
                {chapter.note}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={chapterPath(active)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ipf-burgundy)] px-5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--ipf-burgundy-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                  onClick={() => goChapter(active)}
                >
                  Explore chapter
                  <ArrowRight aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
