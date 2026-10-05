import { Link } from "react-router-dom";
import { useOrgChapters, useOrgCouncils } from "../hooks/useOrgDirectory";
import { chapterPath, councilPath } from "../data/orgNav";
import { Container } from "./ui/Container";

/* ───────────────────────────────────────────────────────────────────────
 * HomeNetwork — "Our Network: Chapters & Councils"
 *
 * Visual spec: founder-approved reference
 *   ~/Downloads/Our Network_ Chapters and Councils.png
 *   (2048 × 768, aspect ≈ 2.67 : 1).
 *
 * Composition at ≥lg
 *   One integrated full-bleed editorial band — NOT two floating UI cards.
 *   - Chapters photograph bleeds from the viewport's LEFT edge inward
 *     with a sweeping organic SVG curve on its right boundary.
 *   - Councils photograph bleeds from the viewport's RIGHT edge inward
 *     with a mirrored sweeping curve on its left boundary.
 *   - Content panels sit in the ivory negative space between the two
 *     photos, over translucent ivory with NO drop shadow, NO ring,
 *     NO rounded card chrome.
 *   - A delicate central vertical gold hairline with a small static
 *     lotus ornament at the midpoint acts as the ornamental axis.
 *
 * Composition at <lg
 *   Section stacks (intro → Chapters block → ornament rule → Councils
 *   block). Photos sit at the top of each block with a vertical variant
 *   of the organic curve on their bottom edge.
 *
 * Data
 *   Chapters routes from useOrgChapters() → GET /api/org/chapters.
 *   Councils routes from useOrgCouncils() → GET /api/org/councils.
 *   Youth council slot connects to the existing /yuva page (Yuva is the
 *   youth wing of IPF). Professionals and Media council slots are
 *   rendered visually but have NO legitimate destination today — they
 *   are explicitly marked and non-interactive. See the final report.
 *
 * Motion
 *   NONE. No autoplay, no scroll reveal, no parallax, no decorative
 *   keyframes. The only interactive motion is a quiet medallion hover
 *   scale on real <Link> elements, auto-disabled under
 *   prefers-reduced-motion.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "#5A0F1E";
const INK = "#1c2430";
const MUTED = "#55606d";

/* Chapter id → medallion. All eight live chapters have an approved asset. */
const CHAPTER_ICON: Record<string, string> = {
  dubai: "/images/home/network/chapter-dubai.png",
  "abu-dhabi": "/images/home/network/chapter-abu-dhabi.png",
  "al-ain": "/images/home/network/chapter-al-ain.png",
  sharjah: "/images/home/network/chapter-sharjah.png",
  ajman: "/images/home/network/chapter-ajman.png",
  "umm-al-quwain": "/images/home/network/chapter-umm-al-quwain.png",
  "ras-al-khaimah": "/images/home/network/chapter-ras-al-khaimah.png",
  fujairah: "/images/home/network/chapter-fujairah.png",
};

/* Council slot definitions. `to === null` → the medallion is rendered
 * but non-interactive (no <Link> wrapper, no hover feedback) because no
 * legitimate destination exists today. These are intentionally present
 * in the visual composition per the founder-approved reference. */
type CouncilSlot = {
  key: string;
  label: string;
  icon: string;
  to: string | null;
  resolvedById?: string;
};

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

/** Static lotus ornament — eight-petal, pure SVG, no animation. */
function CentreOrnament({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className="block"
    >
      <g fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
        <path d="M24 6 C 20 12, 20 18, 24 24 C 28 18, 28 12, 24 6 Z" />
        <path d="M24 42 C 20 36, 20 30, 24 24 C 28 30, 28 36, 24 42 Z" />
        <path d="M6 24 C 12 20, 18 20, 24 24 C 18 28, 12 28, 6 24 Z" />
        <path d="M42 24 C 36 20, 30 20, 24 24 C 30 28, 36 28, 42 24 Z" />
        <path d="M12 12 C 16 15, 20 19, 24 24 C 19 20, 15 16, 12 12 Z" />
        <path d="M36 12 C 32 15, 28 19, 24 24 C 29 20, 33 16, 36 12 Z" />
        <path d="M12 36 C 16 33, 20 29, 24 24 C 19 28, 15 32, 12 36 Z" />
        <path d="M36 36 C 32 33, 28 29, 24 24 C 29 28, 33 32, 36 36 Z" />
      </g>
      <circle cx="24" cy="24" r="3" fill={GOLD} />
    </svg>
  );
}

/** Burgundy pill with heritage-gold hairline border. */
function PillLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-[#D6AD60]/70 bg-[#5A0F1E] px-5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#FFF8EE] transition hover:bg-[#3A0913] hover:border-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <span>{children}</span>
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* SVG clipPaths — ONE sweeping organic curve per side.                 */
/*                                                                      */
/* Rendered inline as hidden <svg><defs>; referenced via CSS            */
/* `clip-path: url(#id)`. `clipPathUnits="objectBoundingBox"` means     */
/* path coordinates are 0..1 fractions of the clipped element's box,   */
/* so the curves stretch responsively to any photo container size.     */
/* ------------------------------------------------------------------ */

const CHAPTER_CURVE_ID = "ipf-net-chapters-curve";
const COUNCIL_CURVE_ID = "ipf-net-councils-curve";

/* ------------------------------------------------------------------ */
/* Icon medallion                                                      */
/* ------------------------------------------------------------------ */

function MedallionBlock({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <>
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={120}
        height={120}
        /* The approved medallions already contain their circular treatment —
           do NOT add another ring, bg, border or crop. */
        className="h-10 w-10 object-contain transition-transform group-hover:scale-[1.05] sm:h-11 sm:w-11 lg:h-[52px] lg:w-[52px]"
      />
      <span className="whitespace-pre-line text-center text-[0.68rem] font-semibold leading-tight text-[#1c2430] sm:text-[0.72rem]">
        {label}
      </span>
    </>
  );
}

function ClickableMedallion({
  src,
  label,
  to,
}: {
  src: string;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 flex-col items-center gap-1 rounded-xl p-1 transition hover:bg-[#D6AD60]/10 focus-visible:bg-[#D6AD60]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <MedallionBlock icon={src} label={label} />
    </Link>
  );
}

function PlaceholderMedallion({
  src,
  label,
  reason,
}: {
  src: string;
  label: string;
  reason: string;
}) {
  return (
    <div
      className="group flex min-w-0 cursor-default flex-col items-center gap-1 rounded-xl p-1 opacity-55"
      title={reason}
      aria-label={`${label} — ${reason}`}
    >
      <MedallionBlock icon={src} label={label} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function HomeNetwork() {
  const { chapters } = useOrgChapters();
  const { councils } = useOrgCouncils();

  /* Chapter order locked to the approved reference. */
  const chapterOrder = [
    "dubai",
    "abu-dhabi",
    "al-ain",
    "sharjah",
    "ajman",
    "umm-al-quwain",
    "ras-al-khaimah",
    "fujairah",
  ];
  const orderedChapters = chapterOrder
    .map((id) => chapters.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  /* Council slots per approved reference (3 × 2 grid). Order follows the
     reference artwork left→right, top→bottom:
       Women's   · Youth    · Professionals
       Business  · Cultural · Media
     Each slot resolves to a real route where one exists, otherwise it
     renders as a static placeholder with the correct approved icon. */
  const womens   = councils.find((c) => c.id === "womens");
  const business = councils.find((c) => c.id === "business");
  const cultural = councils.find((c) => c.id === "cultural");

  const councilSlots: CouncilSlot[] = [
    {
      key: "womens",
      label: "Women's\nCouncil",
      icon: "/images/home/network/council-womens.png",
      to: womens ? councilPath(womens.id) : null,
      resolvedById: womens?.id,
    },
    {
      key: "youth",
      /* Yuva IS the youth wing of IPF — connect the Youth slot to the
         existing /yuva page per the founder's "YUVA belongs under the
         Council structure" direction. */
      label: "Youth\nCouncil",
      icon: "/images/home/network/council-youth.png",
      to: "/yuva",
    },
    {
      key: "professionals",
      label: "Professionals\nCouncil",
      icon: "/images/home/network/council-professionals.png",
      to: null,
    },
    {
      key: "business",
      label: "Business\nCouncil",
      icon: "/images/home/network/council-business.png",
      to: business ? councilPath(business.id) : null,
      resolvedById: business?.id,
    },
    {
      key: "cultural",
      label: "Cultural\nCouncil",
      icon: "/images/home/network/council-cultural.png",
      to: cultural ? councilPath(cultural.id) : null,
      resolvedById: cultural?.id,
    },
    {
      key: "media",
      label: "Media\nCouncil",
      icon: "/images/home/network/council-media.png",
      to: null,
    },
  ];

  return (
    <section
      aria-labelledby="ipf-network-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE] pb-6 lg:pb-8"
    >
      {/* Inline SVG definitions — one sweeping organic curve per side.
         Clip paths use objectBoundingBox units so the curves scale with
         any photo container width/height. Never visible themselves. */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        className="pointer-events-none absolute"
      >
        <defs>
          {/* Chapters photo: single sweeping gentle curve on the right
             edge, closely matching the reference's long leaf-like
             boundary. */}
          <clipPath id={CHAPTER_CURVE_ID} clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.9,0 C 0.65,0.4 0.8,0.6 0.6,1 L 0,1 Z" />
          </clipPath>
          {/* Councils photo: mirrored. */}
          <clipPath id={COUNCIL_CURVE_ID} clipPathUnits="objectBoundingBox">
            <path d="M 1,0 L 0.1,0 C 0.35,0.4 0.2,0.6 0.4,1 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Introductory header — constrained width inside the Container. */}
      <Container>
        <div className="pt-8 text-center sm:pt-9 lg:pt-10">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              id="ipf-network-eyebrow"
              className="text-[0.68rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              Our Network
            </p>
            <GoldRule />
          </div>
          <h2
            className="mt-2 font-serif text-[1.5rem] font-bold leading-[1.1] tracking-tight sm:text-[1.85rem] lg:text-[2.1rem]"
            style={{ color: NAVY }}
          >
            People. Communities. A Stronger Tomorrow.
          </h2>
          <p
            className="mx-auto mt-1.5 max-w-2xl text-[0.85rem] leading-snug sm:text-[0.9rem]"
            style={{ color: MUTED }}
          >
            Through our Chapters and Councils, IPF UAE connects people, ideas
            and opportunities across the Emirates and beyond.
          </p>
        </div>
      </Container>

      {/* ═══════════════════════════════════════════════════════════════
         Desktop & tablet composition (≥md) — FULL-BLEED band
         ═══════════════════════════════════════════════════════════════ */}
      <div className="relative mt-2 hidden w-full md:block lg:mt-3">
        {/* Composition band — compact wide cinematic ratio matching the
           founder-approved reference (2048 x 768 / aspect 2.67:1).
           Height formula: ~30 vw at desktop, clamped so icons stay
           readable at narrower breakpoints. */}
        <div className="relative h-[min(460px,calc(100vw*0.30))] min-h-[380px]">
          {/* LEFT PHOTO — bleeds from viewport-left, clipped by chapter curve */}
          <picture aria-hidden="true">
            <source
              srcSet="/images/home/network/chapters-skyline.webp"
              type="image/webp"
            />
            <img
              src="/images/home/network/chapters-skyline.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-[48%] object-cover lg:w-[46%]"
              style={{ clipPath: `url(#${CHAPTER_CURVE_ID})` }}
            />
          </picture>

          {/* RIGHT PHOTO — bleeds from viewport-right */}
          <picture aria-hidden="true">
            <source
              srcSet="/images/home/network/councils-community.webp"
              type="image/webp"
            />
            <img
              src="/images/home/network/councils-community.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-[48%] object-cover lg:w-[46%]"
              style={{ clipPath: `url(#${COUNCIL_CURVE_ID})` }}
            />
          </picture>

          {/* Centre overlay — two content panels in the ivory negative space.
             Each panel has a soft translucent ivory bg with large organic
             rounded corners so it integrates with the photos behind rather
             than sitting as a hard-edged rectangle.

             CTA alignment: `items-stretch` makes both outer flex columns
             fill the grid cell to EQUAL heights regardless of inner
             content differences (Councils labels like "Women's Council"
             wrap to two lines whereas most Chapter labels do not —
             without stretch the taller panel centres higher via
             items-center, which drops its CTA ~7 px below the opposite
             CTA). Each inner panel is `flex flex-col` so children flow
             vertically; the CTA uses `mt-auto` to anchor to the bottom
             of its panel. Result: both CTAs sit on the same horizontal
             baseline on desktop with no arbitrary per-button margin. */}
          <div className="absolute inset-0 grid grid-cols-2">
            {/* ────── CHAPTERS content ────── */}
            <div className="flex items-stretch justify-end pr-2 lg:pr-4">
              <div
                className="flex w-full max-w-[20rem] flex-col rounded-[2.5rem] bg-[#FFFDF8]/88 px-5 py-5 backdrop-blur-[2px] lg:max-w-[22rem] lg:px-6 lg:py-6"
                style={{
                  borderTopLeftRadius: "4rem",
                  borderBottomLeftRadius: "4rem",
                  borderTopRightRadius: "1.75rem",
                  borderBottomRightRadius: "1.75rem",
                }}
              >
                <GoldRule />
                <h3 className="mt-1.5 font-serif text-[1.5rem] font-bold leading-[0.95] tracking-tight sm:text-[1.75rem] lg:text-[2rem]">
                  <span className="block" style={{ color: GOLD_INK }}>
                    OUR
                  </span>
                  <span className="block" style={{ color: NAVY }}>
                    CHAPTERS
                  </span>
                </h3>
                <GoldRule className="mt-1.5" />
                <p
                  className="mt-2.5 text-[0.78rem] leading-snug sm:text-[0.82rem]"
                  style={{ color: INK }}
                >
                  Our chapters bring IPF closer to people across the Emirates,
                  fostering local engagement, community initiatives and
                  meaningful partnerships.
                </p>

                {orderedChapters.length > 0 ? (
                  <ul
                    role="list"
                    className="mt-4 grid grid-cols-4 gap-x-2 gap-y-2"
                  >
                    {orderedChapters.map((chapter) => {
                      const icon = CHAPTER_ICON[chapter.id];
                      if (!icon) return null;
                      return (
                        <li key={chapter.id} className="min-w-0">
                          <ClickableMedallion
                            src={icon}
                            label={chapter.name}
                            to={chapterPath(chapter.id)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {/* mt-auto pushes the CTA to the bottom of the stretched
                   flex-col panel so both CTAs share the same baseline. */}
                <p className="mt-auto pt-3">
                  <PillLink to="/chapters">Explore Chapters</PillLink>
                </p>
              </div>
            </div>

            {/* ────── COUNCILS content ────── */}
            <div className="flex items-stretch justify-start pl-2 lg:pl-4">
              <div
                className="flex w-full max-w-[20rem] flex-col rounded-[2.5rem] bg-[#FFFDF8]/88 px-5 py-5 backdrop-blur-[2px] lg:max-w-[22rem] lg:px-6 lg:py-6"
                style={{
                  borderTopRightRadius: "4rem",
                  borderBottomRightRadius: "4rem",
                  borderTopLeftRadius: "1.75rem",
                  borderBottomLeftRadius: "1.75rem",
                }}
              >
                <GoldRule />
                <h3 className="mt-1.5 font-serif text-[1.5rem] font-bold leading-[0.95] tracking-tight sm:text-[1.75rem] lg:text-[2rem]">
                  <span className="block" style={{ color: GOLD_INK }}>
                    OUR
                  </span>
                  <span className="block" style={{ color: BURGUNDY }}>
                    COUNCILS
                  </span>
                </h3>
                <GoldRule className="mt-1.5" />
                <p
                  className="mt-2.5 text-[0.78rem] leading-snug sm:text-[0.82rem]"
                  style={{ color: INK }}
                >
                  Our councils provide strategic guidance and leadership across
                  key areas, uniting expertise and experience to support IPF
                  UAE&rsquo;s mission and long-term vision.
                </p>

                <ul
                  role="list"
                  className="mt-4 grid grid-cols-3 gap-x-2 gap-y-2"
                >
                  {councilSlots.map((slot) =>
                    slot.to ? (
                      <li key={slot.key} className="min-w-0">
                        <ClickableMedallion
                          src={slot.icon}
                          label={slot.label}
                          to={slot.to}
                        />
                      </li>
                    ) : (
                      <li key={slot.key} className="min-w-0">
                        <PlaceholderMedallion
                          src={slot.icon}
                          label={slot.label}
                          reason="Destination pending"
                        />
                      </li>
                    ),
                  )}
                </ul>

                {/* mt-auto on the opposite side mirrors the Chapters CTA
                   so both buttons share the same baseline. */}
                <p className="mt-auto pt-3">
                  <PillLink to="/councils">Explore Councils</PillLink>
                </p>
              </div>
            </div>
          </div>

          {/* Central delicate gold hairline + static lotus ornament.
             Positioned over the two-column grid so it sits exactly on
             the composition axis. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-10 left-1/2 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(214,173,96,0.45) 20%, rgba(214,173,96,0.45) 80%, transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF8EE] p-1 ring-1 ring-[#D6AD60]/40"
          >
            <CentreOrnament size={30} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         Mobile composition (<md) — stacked
         ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <Container className="relative pb-10 pt-6">
          {/* Chapters block */}
          <div className="relative">
            <picture aria-hidden="true">
              <source
                srcSet="/images/home/network/chapters-skyline.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/chapters-skyline.png"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-40 w-full rounded-tl-3xl rounded-br-[5rem] object-cover sm:h-48"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 70%, 70% 90%, 30% 95%, 0 100%)",
                }}
              />
            </picture>
            <div className="relative mt-4">
              <GoldRule />
              <h3 className="mt-2 font-serif text-[2rem] font-bold leading-[0.95] tracking-tight">
                <span className="block" style={{ color: GOLD_INK }}>
                  OUR
                </span>
                <span className="block" style={{ color: NAVY }}>
                  CHAPTERS
                </span>
              </h3>
              <GoldRule className="mt-2" />
              <p
                className="mt-3 text-[0.9rem] leading-relaxed"
                style={{ color: INK }}
              >
                Our chapters bring IPF closer to people across the Emirates,
                fostering local engagement, community initiatives and
                meaningful partnerships.
              </p>
              {orderedChapters.length > 0 ? (
                <ul
                  role="list"
                  className="mt-5 grid grid-cols-4 gap-x-2 gap-y-3"
                >
                  {orderedChapters.map((chapter) => {
                    const icon = CHAPTER_ICON[chapter.id];
                    if (!icon) return null;
                    return (
                      <li key={chapter.id} className="min-w-0">
                        <ClickableMedallion
                          src={icon}
                          label={chapter.name}
                          to={chapterPath(chapter.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="mt-5">
                <PillLink to="/chapters">Explore Chapters</PillLink>
              </p>
            </div>
          </div>

          {/* Mobile ornament divider */}
          <div
            aria-hidden="true"
            className="my-8 flex items-center justify-center gap-3"
          >
            <GoldRule />
            <CentreOrnament size={26} />
            <GoldRule />
          </div>

          {/* Councils block */}
          <div className="relative">
            <picture aria-hidden="true">
              <source
                srcSet="/images/home/network/councils-community.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/councils-community.png"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-40 w-full rounded-tr-3xl rounded-bl-[5rem] object-cover sm:h-48"
                style={{
                  clipPath:
                    "polygon(0 30%, 30% 10%, 70% 5%, 100% 0, 100% 100%, 0 100%)",
                }}
              />
            </picture>
            <div className="relative mt-4">
              <GoldRule />
              <h3 className="mt-2 font-serif text-[2rem] font-bold leading-[0.95] tracking-tight">
                <span className="block" style={{ color: GOLD_INK }}>
                  OUR
                </span>
                <span className="block" style={{ color: BURGUNDY }}>
                  COUNCILS
                </span>
              </h3>
              <GoldRule className="mt-2" />
              <p
                className="mt-3 text-[0.9rem] leading-relaxed"
                style={{ color: INK }}
              >
                Our councils provide strategic guidance and leadership across
                key areas, uniting expertise and experience to support IPF
                UAE&rsquo;s mission and long-term vision.
              </p>
              <ul
                role="list"
                className="mt-5 grid grid-cols-3 gap-x-2 gap-y-3"
              >
                {councilSlots.map((slot) =>
                  slot.to ? (
                    <li key={slot.key} className="min-w-0">
                      <ClickableMedallion
                        src={slot.icon}
                        label={slot.label}
                        to={slot.to}
                      />
                    </li>
                  ) : (
                    <li key={slot.key} className="min-w-0">
                      <PlaceholderMedallion
                        src={slot.icon}
                        label={slot.label}
                        reason="Destination pending"
                      />
                    </li>
                  ),
                )}
              </ul>
              <p className="mt-5">
                <PillLink to="/councils">Explore Councils</PillLink>
              </p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
