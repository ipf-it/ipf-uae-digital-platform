import { Link } from "react-router-dom";
import { useOrgChapters, useOrgCouncils } from "../hooks/useOrgDirectory";
import { chapterPath, councilPath } from "../data/orgNav";
import { Container } from "./ui/Container";

/* ───────────────────────────────────────────────────────────────────────
 * HomeNetwork — "Our Network: Chapters & Councils" homepage section.
 *
 * Approved by the founder (reference artwork + composition supplied in
 * ~/Desktop/chapter & councils). This component implements that
 * composition — it does NOT redesign it, does NOT replace the artwork,
 * does NOT add animations, does NOT introduce icons from a library.
 *
 * Layout
 *   DESKTOP (≥lg)
 *     Top centre     : gold rule · OUR NETWORK · gold rule
 *                      "People. Communities. A Stronger Tomorrow."
 *                      intro paragraph
 *     Two columns underneath, each inset by its own content card.
 *       LEFT  : Golden-Hour UAE Skyline bleeds in from the LEFT edge
 *               behind a decorative S-curve clip, with the Chapters
 *               content card sitting toward the RIGHT inside that column.
 *               8 chapter medallions in a 4×2 grid; "Explore Chapters →".
 *       RIGHT : Dubai Sunset Community Gathering bleeds in from the
 *               RIGHT edge behind a mirrored S-curve clip, with the
 *               Councils content card sitting toward the LEFT.
 *               3 council medallions (the three real Special Councils
 *               that exist in the live /api/org/councils data today);
 *               "Explore Councils →".
 *     Centre        : thin vertical gold hairline with a small static
 *                      heritage floral motif at its mid-point.
 *
 *   TABLET / MOBILE (<lg)
 *     Content stacks: eyebrow → heading → intro → Chapters (image,
 *     content, medallions, CTA) → thin horizontal gold ornamental
 *     divider → Councils (image, content, medallions, CTA). No vertical
 *     centre divider. Images use a horizontal curved mask so the artwork
 *     still reads as an organic flowing shape rather than a flat rect.
 *
 * Data (preserving the project's single source of truth)
 *   Chapters routes come from `useOrgChapters()` → `/api/org/chapters?...`
 *   Councils routes come from `useOrgCouncils()` → `/api/org/councils?...`
 *   Every medallion is an independent <Link> to the entity's own page.
 *
 * Motion
 *   NONE. No autoplay carousel, no parallax, no scroll reveal, no rotating
 *   mandala, no decorative keyframes. The only motion in the section is a
 *   subtle hover scale on each medallion (0.03 translate on hover) which
 *   is a user-interaction state, not autonomous motion. prefers-reduced-
 *   motion disables the CSS transition on medallion hover automatically
 *   via the global reduce rule in src/index.css.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "#5A0F1E";
const INK = "#1c2430";
const MUTED = "#55606d";

/* Chapter id → medallion file. All eight live chapters have a dedicated
   approved asset at public/images/home/network/chapter-<id>.png. */
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

/* Council id → medallion file. Only the three Special Councils that
   currently exist in the live /api/org/councils data get a medallion
   — the task brief explicitly forbids hard-coding routes that do not
   exist. The remaining 5 of the 8 supplied council medallion assets
   stay in the project but are not displayed today; they will be
   adopted the moment the corresponding council records are added to
   the database. */
const COUNCIL_ICON: Record<string, string> = {
  business: "/images/home/network/council-business.png",
  cultural: "/images/home/network/council-cultural.png",
  womens: "/images/home/network/council-womens.png",
};

/* ------------------------------------------------------------------ */
/* Shared decorative primitives                                        */
/* ------------------------------------------------------------------ */

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 bg-[${GOLD}]/60 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

/** Static heritage ornament rendered as inline SVG. No animation.
 *  Lotus-inspired eight-petal geometry centred on a small gold disc —
 *  reads as a quiet editorial motif at ~20 px, never as a mandala. */
function CentreOrnament() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="36"
      height="36"
      aria-hidden="true"
      className="block"
    >
      {/* outer petals */}
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
      {/* centre disc */}
      <circle cx="24" cy="24" r="3" fill={GOLD} />
    </svg>
  );
}

/** Burgundy pill CTA with heritage-gold hairline border. */
function PillLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-[#D6AD60]/70 bg-[#5A0F1E] px-5 py-2.5 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] shadow-[0_4px_14px_rgba(90,15,30,0.25)] transition hover:bg-[#3A0913] hover:border-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <span>{children}</span>
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Image clip-paths                                                    */
/*                                                                     */
/* Each large photograph bleeds from the OUTER edge of its column and  */
/* a flowing S-curve forms the inner boundary — the shape visible in   */
/* the approved reference artwork. Implemented with CSS polygon() so   */
/* the mask scales with the container at every breakpoint without a   */
/* bespoke SVG per aspect ratio. The chosen points approximate the    */
/* S-curve of the reference without requiring JS.                     */
/* ------------------------------------------------------------------ */

const SKYLINE_CLIP_DESKTOP =
  "polygon(0% 0%, 72% 0%, 60% 16%, 68% 34%, 76% 50%, 68% 66%, 60% 84%, 72% 100%, 0% 100%)";
const COMMUNITY_CLIP_DESKTOP =
  "polygon(28% 0%, 100% 0%, 100% 100%, 28% 100%, 40% 84%, 32% 66%, 24% 50%, 32% 34%, 40% 16%)";

const SKYLINE_CLIP_MOBILE =
  "polygon(0% 0%, 100% 0%, 100% 68%, 80% 78%, 60% 84%, 40% 92%, 0% 100%)";
const COMMUNITY_CLIP_MOBILE =
  "polygon(0% 32%, 40% 22%, 60% 16%, 80% 10%, 100% 0%, 100% 100%, 0% 100%)";

/* ------------------------------------------------------------------ */
/* Medallion                                                           */
/* ------------------------------------------------------------------ */

function Medallion({
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
      className="group flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-1.5 transition hover:bg-[#D6AD60]/10 focus-visible:bg-[#D6AD60]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={160}
        height={160}
        /* The supplied medallions already contain the circular treatment;
           we do NOT add another ring, background or crop. */
        className="h-14 w-14 object-contain transition-transform group-hover:scale-[1.05] sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]"
      />
      <span className="whitespace-pre-line text-center text-[0.72rem] font-semibold leading-tight text-[#1c2430] sm:text-[0.78rem]">
        {label}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function HomeNetwork() {
  const { chapters } = useOrgChapters();
  const { councils } = useOrgCouncils();

  /* Preserve approved chapter order (Dubai first, then counter-clockwise
     around the UAE). This matches both the reference artwork and the
     eight supplied medallion file names. */
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

  /* Only Special Councils that have a medallion asset AND exist in the
     live data. Today that is Business, Cultural, Women's — the three
     Special Councils served by /api/org/councils. */
  const councilOrder = ["business", "cultural", "womens"];
  const orderedCouncils = councilOrder
    .map((id) => councils.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section
      aria-labelledby="ipf-network-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      <Container className="relative py-12 sm:py-14 lg:py-20">
        {/* Top centre */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              id="ipf-network-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              Our Network
            </p>
            <GoldRule />
          </div>
          <h2
            className="mt-4 font-serif text-[1.75rem] font-bold leading-[1.1] tracking-tight sm:text-[2.1rem] lg:text-[2.5rem]"
            style={{ color: typeof NAVY === "string" ? NAVY : undefined }}
          >
            People. Communities. A Stronger Tomorrow.
          </h2>
          <p
            className="mx-auto mt-3 max-w-2xl text-[0.95rem] leading-relaxed sm:text-base"
            style={{ color: MUTED }}
          >
            Through our Chapters and Councils, IPF UAE connects people, ideas
            and opportunities across the Emirates and beyond.
          </p>
        </div>

        {/* Two-column composition */}
        <div className="relative mt-10 grid gap-10 sm:mt-12 lg:mt-14 lg:grid-cols-2 lg:gap-0">
          {/* ────────────── LEFT HALF — CHAPTERS ────────────── */}
          <div className="relative lg:pr-10 xl:pr-14">
            {/* Mobile / tablet: compact image above content, horizontally
               clipped. Desktop: image bleeds behind the content card from
               the LEFT edge of the viewport. */}
            <picture aria-hidden="true" className="lg:hidden">
              <source
                srcSet="/images/home/network/chapters-skyline.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/chapters-skyline.png"
                alt=""
                loading="lazy"
                decoding="async"
                width={1536}
                height={1024}
                className="h-48 w-full rounded-tl-3xl rounded-br-[6rem] object-cover sm:h-56"
                style={{ clipPath: SKYLINE_CLIP_MOBILE }}
              />
            </picture>
            <picture aria-hidden="true" className="hidden lg:block">
              <source
                srcSet="/images/home/network/chapters-skyline.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/chapters-skyline.png"
                alt=""
                loading="lazy"
                decoding="async"
                width={1536}
                height={1024}
                /* On desktop the photograph sits BEHIND the Chapters card
                   and extends to the viewport's left edge via a negative
                   left offset larger than the Container's horizontal
                   padding. The S-curve polygon forms the inner boundary. */
                className="pointer-events-none absolute inset-y-0 -z-10 h-full w-[calc(100%+6rem)] object-cover opacity-95"
                style={{
                  left: "-6rem",
                  clipPath: SKYLINE_CLIP_DESKTOP,
                }}
              />
            </picture>

            {/* Chapters content card */}
            <div className="relative mt-6 rounded-3xl bg-[#FFFDF8]/92 p-6 shadow-[0_14px_38px_rgba(11,31,58,0.12)] ring-1 ring-[#D6AD60]/35 sm:p-8 lg:ml-auto lg:mt-0 lg:w-[94%] lg:p-9 xl:w-[88%]">
              <GoldRule className="mb-3" />
              <h3 className="font-serif text-[2rem] font-black leading-[0.95] tracking-tight sm:text-[2.4rem] lg:text-[2.6rem]">
                <span className="block" style={{ color: GOLD_INK }}>
                  OUR
                </span>
                <span className="block" style={{ color: typeof NAVY === "string" ? NAVY : undefined }}>
                  CHAPTERS
                </span>
              </h3>
              <GoldRule className="mt-3" />
              <p
                className="mt-5 max-w-md text-[0.95rem] leading-relaxed"
                style={{ color: INK }}
              >
                Our chapters bring IPF closer to people across the Emirates,
                fostering local engagement, community initiatives and
                meaningful partnerships.
              </p>

              {/* 8 chapter medallions — 4 columns from sm, 4 columns on lg
                 (so the grid is 4 × 2 on desktop and 2 × 4 on tiny
                 mobiles). Every medallion is an independent <Link>. */}
              {orderedChapters.length > 0 ? (
                <ul
                  role="list"
                  className="mt-6 grid grid-cols-4 gap-2 sm:gap-3"
                >
                  {orderedChapters.map((chapter) => {
                    const icon = CHAPTER_ICON[chapter.id];
                    if (!icon) return null;
                    return (
                      <li key={chapter.id} className="min-w-0">
                        <Medallion
                          src={icon}
                          label={chapter.name}
                          to={chapterPath(chapter.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <p className="mt-6">
                <PillLink to="/chapters">Explore Chapters</PillLink>
              </p>
            </div>
          </div>

          {/* ────────────── CENTRE DIVIDER (lg+ only) ────────────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D6AD60]/40 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          >
            <div className="rounded-full bg-[#FFF8EE] p-1.5 ring-1 ring-[#D6AD60]/40">
              <CentreOrnament />
            </div>
          </div>

          {/* Mobile-only horizontal ornament between the two halves */}
          <div
            aria-hidden="true"
            className="my-2 flex items-center justify-center gap-3 lg:hidden"
          >
            <GoldRule />
            <CentreOrnament />
            <GoldRule />
          </div>

          {/* ────────────── RIGHT HALF — COUNCILS ────────────── */}
          <div className="relative lg:pl-10 xl:pl-14">
            {/* Mobile image above content */}
            <picture aria-hidden="true" className="lg:hidden">
              <source
                srcSet="/images/home/network/councils-community.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/councils-community.png"
                alt=""
                loading="lazy"
                decoding="async"
                width={1672}
                height={941}
                className="h-48 w-full rounded-tr-3xl rounded-bl-[6rem] object-cover sm:h-56"
                style={{ clipPath: COMMUNITY_CLIP_MOBILE }}
              />
            </picture>
            {/* Desktop image bleeds from RIGHT */}
            <picture aria-hidden="true" className="hidden lg:block">
              <source
                srcSet="/images/home/network/councils-community.webp"
                type="image/webp"
              />
              <img
                src="/images/home/network/councils-community.png"
                alt=""
                loading="lazy"
                decoding="async"
                width={1672}
                height={941}
                className="pointer-events-none absolute inset-y-0 -z-10 h-full w-[calc(100%+6rem)] object-cover opacity-95"
                style={{
                  right: "-6rem",
                  clipPath: COMMUNITY_CLIP_DESKTOP,
                }}
              />
            </picture>

            {/* Councils content card */}
            <div className="relative mt-6 rounded-3xl bg-[#FFFDF8]/92 p-6 shadow-[0_14px_38px_rgba(11,31,58,0.12)] ring-1 ring-[#D6AD60]/35 sm:p-8 lg:mr-auto lg:mt-0 lg:w-[94%] lg:p-9 xl:w-[88%]">
              <GoldRule className="mb-3" />
              <h3 className="font-serif text-[2rem] font-black leading-[0.95] tracking-tight sm:text-[2.4rem] lg:text-[2.6rem]">
                <span className="block" style={{ color: GOLD_INK }}>
                  OUR
                </span>
                <span className="block" style={{ color: BURGUNDY }}>
                  COUNCILS
                </span>
              </h3>
              <GoldRule className="mt-3" />
              <p
                className="mt-5 max-w-md text-[0.95rem] leading-relaxed"
                style={{ color: INK }}
              >
                Our councils provide strategic guidance and leadership across
                key areas, uniting expertise and experience to support IPF
                UAE&rsquo;s mission and long-term vision.
              </p>

              {/* The three Special Councils that exist today. Each a <Link>. */}
              {orderedCouncils.length > 0 ? (
                <ul
                  role="list"
                  className="mt-6 grid grid-cols-3 gap-2 sm:gap-3"
                >
                  {orderedCouncils.map((council) => {
                    const icon = COUNCIL_ICON[council.id];
                    if (!icon) return null;
                    /* Shorten "Women's Council" style labels to just the
                       distinguishing word pair on narrow viewports. */
                    const label = council.name.replace(/\s*Council\s*$/i, "");
                    return (
                      <li key={council.id} className="min-w-0">
                        <Medallion
                          src={icon}
                          label={`${label}\nCouncil`}
                          to={councilPath(council.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <p className="mt-6">
                <PillLink to="/councils">Explore Councils</PillLink>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
