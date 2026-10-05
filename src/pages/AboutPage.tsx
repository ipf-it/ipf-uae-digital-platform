import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * AboutPage — About IPF UAE (Phase 2 implementation, 5 Oct 2026).
 *
 * Replaces the previous 22-line page (dark burgundy PageHero + generic
 * PageSectionRenderer + empty PageExtras) with an 8-section editorial
 * composition that inherits the premium ivory/navy/burgundy/gold/green
 * visual language established on the homepage redesign while giving the
 * About page its own identity.
 *
 * Scope lock
 *   The 5 sibling About pages (History, Leadership, Yuva, Governance,
 *   Support) remain untouched — this page introduces + links to them.
 *   The existing Supabase page_sections rows for `about` are NOT
 *   deleted; they are simply no longer rendered by this page. If the
 *   CMS pipeline is re-enabled later the data is still present.
 *
 * i18n
 *   Every user-facing string comes from the project's i18n keys so all
 *   10 configured locales (en, hi, ml, ta, te, kn, gu, mr, pa, bn)
 *   render correctly. Image alt text + aria-labels are also localised.
 *   Zero hard-coded English strings in this component.
 *
 * Motion
 *   Static. No carousels, no autoplay, no parallax, no rotating
 *   decoration, no scroll reveal. Only link / button hover + focus.
 * ─────────────────────────────────────────────────────────────────── */

const HERO_IMG = "/legacy-assets/images/Ahlan_Modi.jpeg";
const WHO_IMG = "/legacy-assets/images/IMG-20211003-WA0135.jpg";
const RESP_IMG = "/legacy-assets/images/community-support.png";
const INDIA_UAE_IMG = "/legacy-assets/images/IMG-20220902-WA0090.jpg";

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "#5A0F1E";
const INK = "#1c2430";
const MUTED = "#55606d";

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

function Lotus({ size = 28 }: { size?: number }) {
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

type SectionProps = {
  tone?: "ivory" | "white";
  children: React.ReactNode;
  ariaLabelledBy?: string;
  /* Full-viewport backdrop layer rendered OUTSIDE the Container, so the
     approved artwork bleeds to the viewport's left and right edges
     instead of being constrained to the max-w-6xl content column. */
  backdrop?: React.ReactNode;
};

function Section({ tone = "ivory", children, ariaLabelledBy, backdrop }: SectionProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={`relative isolate overflow-hidden py-12 sm:py-14 lg:py-16 ${
        tone === "ivory" ? "bg-[#FFF8EE]" : "bg-[#FFFDF8]"
      }`}
    >
      {backdrop}
      <Container className="relative">{children}</Container>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────
 * Backdrop — decorative background layer for an About section.
 *
 * Renders the approved artwork via <picture> (WebP primary, PNG
 * fallback) at a controllable opacity + object-position, and lays a
 * soft ivory overlay on top so body copy / cards remain fully
 * readable. The overlay style determines how the artwork "emerges"
 * from the section:
 *   - radial    : visible around the outer edges, ivory in the centre
 *                 behind text (best for sections with centred content)
 *   - leftEdge  : visible on the left, fades to ivory on the right
 *   - rightEdge : visible on the right, fades to ivory on the left
 *   - verticalFade : visible in the middle, fades to ivory at the
 *                    top AND bottom edges so section boundaries are
 *                    soft rather than hard rectangles
 *
 * `objectPos` biases the <img> inside its own box so the key artwork
 * motif (mandala, horizon, etc.) lands where we want it on screen.
 * ───────────────────────────────────────────────────────────────── */

type BackdropOverlay = "radial" | "leftEdge" | "rightEdge" | "verticalFade";

function Backdrop({
  webp,
  png,
  opacity,
  objectPos = "center",
  overlay = "radial",
}: {
  webp: string;
  png: string;
  opacity: number;
  objectPos?: "left" | "center" | "right" | "topLeft" | "topRight";
  overlay?: BackdropOverlay;
}) {
  const posClass = {
    left: "object-[20%_center]",
    right: "object-[80%_center]",
    center: "object-center",
    topLeft: "object-[20%_30%]",
    topRight: "object-[80%_30%]",
  }[objectPos];

  /* Overlay opacity values are deliberately lighter than they look —
     the centre (where text sits) is only partially ivory so the
     artwork still reads behind it. The outer edges are fully clear so
     the illustration bleeds visibly to the viewport's left/right. */
  const overlayStyle: Record<BackdropOverlay, string> = {
    radial:
      "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(255,248,238,0.72) 0%, rgba(255,248,238,0.5) 40%, rgba(255,248,238,0.15) 80%, rgba(255,248,238,0) 100%)",
    leftEdge:
      "linear-gradient(to right, rgba(255,248,238,0) 0%, rgba(255,248,238,0.25) 30%, rgba(255,248,238,0.7) 60%, rgba(255,248,238,0.88) 85%, rgba(255,248,238,0.95) 100%)",
    rightEdge:
      "linear-gradient(to left, rgba(255,248,238,0) 0%, rgba(255,248,238,0.25) 30%, rgba(255,248,238,0.7) 60%, rgba(255,248,238,0.88) 85%, rgba(255,248,238,0.95) 100%)",
    verticalFade:
      "linear-gradient(to bottom, rgba(255,248,238,0.95) 0%, rgba(255,248,238,0.35) 22%, rgba(255,248,238,0.35) 78%, rgba(255,248,238,0.95) 100%)",
  };

  return (
    <>
      <picture aria-hidden="true">
        <source srcSet={webp} type="image/webp" />
        <img
          src={png}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={1983}
          height={793}
          className={`pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover ${posClass}`}
          style={{ opacity }}
        />
      </picture>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: overlayStyle[overlay] }}
      />
    </>
  );
}

/* Asset paths — approved artwork copied from ~/Desktop/ipf about */
const BG_VV_WEBP = "/images/about/about-vision-values-bg.webp";
const BG_VV_PNG = "/images/about/about-vision-values-bg.png";
const BG_RESP_WEBP = "/images/about/about-responsibility-bg.webp";
const BG_RESP_PNG = "/images/about/about-responsibility-bg.png";
const BG_IU_WEBP = "/images/about/about-india-uae-bg.webp";
const BG_IU_PNG = "/images/about/about-india-uae-bg.png";
const BG_CLOSE_WEBP = "/images/about/about-closing-bg.webp";
const BG_CLOSE_PNG = "/images/about/about-closing-bg.png";

/* ─────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  const { t } = useLocale();

  const aims = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
    t(`page.about.aim${i}`),
  );
  const visions = [1, 2, 3, 4].map((i) => t(`page.about.vision${i}`));
  const values = [1, 2, 3, 4].map((i) => t(`page.about.value${i}`));
  const resps = [1, 2, 3, 4, 5].map((i) => t(`page.about.resp${i}`));

  return (
    <>
      <DocumentTitle title={t("nav.aboutIpf")} />

      {/* ──────────────── 1 · PREMIUM ABOUT HERO ──────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <Container className="relative py-10 sm:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
            {/* Left — editorial text */}
            <div className="min-w-0">
              <nav
                aria-label={t("nav.aboutIpf")}
                className="flex items-center gap-2 text-[0.75rem] text-[#55606d]"
              >
                <Link
                  to="/"
                  className="hover:text-[var(--ipf-green)]"
                >
                  {t("nav.home")}
                </Link>
                <span aria-hidden="true" className="text-[#8B6A1F]/60">
                  /
                </span>
                <span className="text-[var(--ipf-navy)]">
                  {t("nav.aboutIpf")}
                </span>
              </nav>

              <div className="mt-5 inline-flex items-center gap-3">
                <GoldRule />
                <p
                  className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
                  style={{ color: GOLD_INK }}
                >
                  {t("page.about.eyebrow")}
                </p>
                <GoldRule />
              </div>

              <h1
                id="about-hero-heading"
                className="mt-4 font-serif text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.4rem] lg:text-[2.9rem]"
                style={{ color: NAVY }}
              >
                {t("page.about.title")}
              </h1>

              <p
                className="mt-4 max-w-[36rem] text-[0.95rem] leading-relaxed sm:text-[1rem]"
                style={{ color: INK }}
              >
                {t("page.about.desc")}
              </p>
            </div>

            {/* Right — community photograph with soft organic clip */}
            <div className="relative min-w-0">
              <div
                className="relative overflow-hidden shadow-[0_14px_40px_rgba(11,31,58,0.18)] ring-1 ring-[#D6AD60]/35"
                style={{ borderRadius: "2rem 5rem 2rem 5rem" }}
              >
                <img
                  src={HERO_IMG}
                  alt={t("page.about.alt.hero")}
                  loading="eager"
                  decoding="async"
                  width={1600}
                  height={1066}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────── 2 · WHO WE ARE ──────────────── */}
      <Section tone="white" ariaLabelledBy="about-who-heading">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
          <div className="relative order-2 min-w-0 lg:order-1">
            <div
              className="relative overflow-hidden shadow-[0_12px_32px_rgba(11,31,58,0.14)] ring-1 ring-[#D6AD60]/30"
              style={{ borderRadius: "5rem 2rem 5rem 2rem" }}
            >
              <img
                src={WHO_IMG}
                alt={t("page.about.alt.whoWeAre")}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1066}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <GoldRule />
            <p
              className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec2.eyebrow")}
            </p>
            <h2
              id="about-who-heading"
              className="mt-3 font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.about.sec2.heading")}
            </h2>
            <div
              className="mt-5 space-y-4 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              <p>{t("page.about.p1")}</p>
              <p>{t("page.about.p2")}</p>
              <p>{t("page.about.p3")}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────── 3 · VISION + VALUES ──────────────── */}
      {/* Image 1 (Gold Mandala + Sage Waves) bleeds full-viewport width
         behind Vision+Values; same artwork is repeated on Section 4
         with the opposite horizontal bias for visual continuity. */}
      <Section
        tone="ivory"
        ariaLabelledBy="about-vision-heading"
        backdrop={
          <Backdrop
            webp={BG_VV_WEBP}
            png={BG_VV_PNG}
            opacity={0.55}
            objectPos="right"
            overlay="radial"
          />
        }
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-12">
          {/* VISION */}
          <div className="min-w-0">
            <GoldRule />
            <p
              className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.visionEyebrow")}
            </p>
            <h2
              id="about-vision-heading"
              className="mt-3 font-serif text-[1.5rem] font-bold leading-[1.2] tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
              style={{ color: NAVY }}
            >
              {t("page.about.visionTitle")}
            </h2>
            <ul role="list" className="mt-5 space-y-3">
              {visions.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[0.95rem] leading-snug sm:text-[1rem]"
                  style={{ color: INK }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--ipf-green)" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Central divider + lotus ornament (desktop only). */}
          <div
            aria-hidden="true"
            className="hidden flex-col items-center justify-center gap-4 lg:flex"
          >
            <span className="h-24 w-px bg-[#D6AD60]/40" />
            <Lotus size={26} />
            <span className="h-24 w-px bg-[#D6AD60]/40" />
          </div>

          {/* VALUES */}
          <div className="min-w-0">
            <GoldRule />
            <p
              className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.valuesEyebrow")}
            </p>
            <h2
              className="mt-3 font-serif text-[1.5rem] font-bold leading-[1.2] tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
              style={{ color: BURGUNDY }}
            >
              {t("page.about.valuesTitle")}
            </h2>
            <p
              className="mt-4 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              {t("page.about.valuesBody")}
            </p>
            <ul role="list" className="mt-5 flex flex-wrap gap-2">
              {values.map((item, i) => (
                <li key={i}>
                  <span
                    className="inline-flex items-center rounded-full border border-[#D6AD60]/60 bg-[#FFFDF8] px-3 py-1.5 text-[0.8rem] font-semibold"
                    style={{ color: BURGUNDY }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ──────────────── 4 · OUR PURPOSE — AIMS & OBJECTIVES ──────────────── */}
      {/* Same image as Section 3 but mirrored to the opposite side —
         creates deliberate visual continuity across the Vision+Values
         -> Aims transition. Opacity slightly lower so the numbered
         01-10 grid remains the dominant visual. */}
      <Section
        tone="white"
        ariaLabelledBy="about-aims-heading"
        backdrop={
          <Backdrop
            webp={BG_VV_WEBP}
            png={BG_VV_PNG}
            opacity={0.42}
            objectPos="left"
            overlay="radial"
          />
        }
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec4.eyebrowOverride")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="about-aims-heading"
            className="mt-3 font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
            style={{ color: NAVY }}
          >
            {t("page.about.aimsTitle")}
          </h2>
          <p
            className="mx-auto mt-3 max-w-3xl text-[0.95rem] leading-relaxed sm:text-[1rem]"
            style={{ color: MUTED }}
          >
            {t("page.about.aimsIntro")}
          </p>
        </div>
        <ol
          role="list"
          className="mt-8 grid gap-x-6 gap-y-5 sm:mt-10 sm:grid-cols-2"
        >
          {aims.map((item, i) => {
            const num = `0${i + 1}`.slice(-2);
            return (
              <li
                key={i}
                className="flex min-w-0 gap-4 border-l-2 border-[#D6AD60]/50 pl-4"
              >
                <span
                  aria-hidden="true"
                  className="font-serif text-[1.3rem] font-bold leading-none sm:text-[1.5rem]"
                  style={{ color: GOLD_INK }}
                >
                  {num}
                </span>
                <p
                  className="min-w-0 text-[0.9rem] leading-snug sm:text-[0.95rem]"
                  style={{ color: INK }}
                >
                  {item}
                </p>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* ──────────────── 5 · RESPONSIBILITY IN ACTION ──────────────── */}
      {/* Image 2 (Ivory Mandala Presentation) bleeds full-viewport width
         with the mandala pulled to the outer right. leftEdge overlay
         keeps the left half (where the real community-support
         photograph sits) and the content text clean, while the right
         half shows the mandala clearly. */}
      <Section
        tone="ivory"
        ariaLabelledBy="about-resp-heading"
        backdrop={
          <Backdrop
            webp={BG_RESP_WEBP}
            png={BG_RESP_PNG}
            opacity={0.55}
            objectPos="right"
            overlay="leftEdge"
          />
        }
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
          <div className="relative min-w-0">
            <div
              className="relative overflow-hidden shadow-[0_12px_32px_rgba(11,31,58,0.14)] ring-1 ring-[#D6AD60]/30"
              style={{ borderRadius: "2rem 5rem 2rem 5rem" }}
            >
              <img
                src={RESP_IMG}
                alt={t("page.about.alt.responsibility")}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1066}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0">
            <GoldRule />
            <p
              className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec5.eyebrow")}
            </p>
            <h2
              id="about-resp-heading"
              className="mt-3 font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.about.respTitle")}
            </h2>
            <p
              className="mt-4 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              {t("page.about.respBody")}
            </p>
            <ul role="list" className="mt-5 flex flex-wrap gap-2">
              {resps.map((item, i) => (
                <li key={i}>
                  <span
                    className="inline-flex items-center rounded-full border border-[var(--ipf-green)]/50 bg-[#FFFDF8] px-3 py-1.5 text-[0.8rem] font-semibold"
                    style={{ color: INK }}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-2 size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--ipf-green)" }}
                    />
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ──────────────── 6 · ONE IPF — NETWORK ──────────────── */}
      <Section tone="white" ariaLabelledBy="about-network-heading">
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec6.eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="about-network-heading"
            className="mx-auto mt-3 max-w-3xl font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
            style={{ color: NAVY }}
          >
            {t("page.about.sec6.heading")}
          </h2>
          <p
            className="mx-auto mt-3 max-w-2xl text-[0.95rem] leading-relaxed sm:text-[1rem]"
            style={{ color: MUTED }}
          >
            {t("page.about.sec6.intro")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-3 lg:gap-6">
          {[
            {
              label: t("nav.chapters"),
              desc: t("page.about.sec6.chaptersDesc"),
              to: "/chapters",
            },
            {
              label: t("nav.councils"),
              desc: t("page.about.sec6.councilsDesc"),
              to: "/councils",
            },
            {
              label: t("nav.yuva"),
              desc: t("page.yuva.desc"),
              to: "/yuva",
            },
          ].map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex min-w-0 flex-col rounded-[1.25rem] border border-[#D6AD60]/35 bg-[#FFFDF8] p-6 transition hover:border-[#D6AD60] hover:shadow-[0_12px_28px_rgba(11,31,58,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60] lg:p-7"
            >
              <GoldRule />
              <h3
                className="mt-2 font-serif text-[1.3rem] font-bold leading-tight tracking-tight sm:text-[1.5rem]"
                style={{ color: NAVY }}
              >
                {card.label}
              </h3>
              <p
                className="mt-3 flex-1 text-[0.9rem] leading-relaxed sm:text-[0.95rem]"
                style={{ color: INK }}
              >
                {card.desc}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: BURGUNDY }}
              >
                {t("nav.viewAll")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ──────────────── 7 · INDIA × UAE ──────────────── */}
      {/* Image 3 (Watercolour Skyline Fusion) is the strongest visual
         moment on the page. opacity 0.7 means the India/UAE skyline
         illustration bleeds clearly to the viewport's left and right
         edges; the central radial ivory veil keeps the real IPF
         photograph + editorial copy readable. The real Jaishankar
         meeting photograph is preserved — the illustration becomes
         context, not a replacement. */}
      <Section
        tone="ivory"
        ariaLabelledBy="about-india-uae-heading"
        backdrop={
          <Backdrop
            webp={BG_IU_WEBP}
            png={BG_IU_PNG}
            opacity={0.7}
            objectPos="center"
            overlay="radial"
          />
        }
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
          <div className="relative min-w-0">
            <div
              className="relative overflow-hidden shadow-[0_12px_32px_rgba(11,31,58,0.14)] ring-1 ring-[#D6AD60]/30"
              style={{ borderRadius: "5rem 2rem 5rem 2rem" }}
            >
              <img
                src={INDIA_UAE_IMG}
                alt={t("page.about.alt.indiaUae")}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1066}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0">
            <GoldRule />
            <p
              className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec7.eyebrow")}
            </p>
            <h2
              id="about-india-uae-heading"
              className="mt-3 font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
              style={{ color: NAVY }}
            >
              {t("page.about.sec7.heading")}
            </h2>
            <p
              className="mt-4 text-[0.95rem] leading-relaxed sm:text-[1rem]"
              style={{ color: INK }}
            >
              {t("page.about.sec7.body")}
            </p>
          </div>
        </div>
      </Section>

      {/* ──────────────── 8 · DISCOVER MORE + CTA ──────────────── */}
      {/* Image 4 (Heritage Horizon) bleeds full-viewport width in the
         middle of the section, fading to ivory at both the top AND the
         bottom via verticalFade. The clean ivory bottom edge gives the
         real IPF footer artwork (India-UAE skyline) room to breathe —
         this backdrop is a visual bridge rather than another full
         illustration above the footer. */}
      <Section
        tone="white"
        ariaLabelledBy="about-discover-heading"
        backdrop={
          <Backdrop
            webp={BG_CLOSE_WEBP}
            png={BG_CLOSE_PNG}
            opacity={0.4}
            objectPos="center"
            overlay="verticalFade"
          />
        }
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <GoldRule />
            <p
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD_INK }}
            >
              {t("page.about.sec8.eyebrow")}
            </p>
            <GoldRule />
          </div>
          <h2
            id="about-discover-heading"
            className="mt-3 font-serif text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-[1.95rem] lg:text-[2.1rem]"
            style={{ color: NAVY }}
          >
            {t("page.about.sec8.heading")}
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Tile `desc` values use dedicated page.about.tile.*Desc keys
             rather than page.{sibling}.desc because two of the sibling
             .desc keys contain unsafe content for public tiles:
               - page.leadership.desc has an unfilled {name} placeholder
               - page.governance.desc has developer-facing text about
                 "old broken sign-in links"
             Those sibling pages will be redesigned in Phase 2+ of the
             About family roadmap; About IPF never shows that copy. */}
          {[
            {
              eyebrow: t("page.history.eyebrow"),
              label: t("nav.history"),
              desc: t("page.about.tile.historyDesc"),
              to: "/history",
            },
            {
              eyebrow: t("page.leadership.eyebrow"),
              label: t("nav.leadership"),
              desc: t("page.about.tile.leadershipDesc"),
              to: "/leadership",
            },
            {
              eyebrow: t("page.governance.eyebrow"),
              label: t("nav.governance"),
              desc: t("page.about.tile.governanceDesc"),
              to: "/governance",
            },
            {
              eyebrow: t("page.support.eyebrow"),
              label: t("nav.support"),
              desc: t("page.about.tile.supportDesc"),
              to: "/support",
            },
          ].map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="group flex min-w-0 flex-col rounded-[1.25rem] border border-[#D6AD60]/30 bg-[#FFFDF8] p-5 transition hover:border-[#D6AD60] hover:shadow-[0_10px_24px_rgba(11,31,58,0.09)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60] lg:p-6"
            >
              <p
                className="text-[0.65rem] font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD_INK }}
              >
                {tile.eyebrow}
              </p>
              <h3
                className="mt-2 font-serif text-[1.1rem] font-bold leading-tight tracking-tight sm:text-[1.2rem]"
                style={{ color: NAVY }}
              >
                {tile.label}
              </h3>
              <p
                className="mt-2 flex-1 text-[0.84rem] leading-snug sm:text-[0.88rem]"
                style={{ color: MUTED }}
              >
                {tile.desc}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: BURGUNDY }}
              >
                {t("nav.viewAll")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Compact closing CTA band — burgundy, restrained. */}
        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-5 rounded-[1.5rem] bg-[#5A0F1E] px-6 py-7 text-center text-[#FFF8EE] sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
          <div className="min-w-0">
            <p className="font-serif text-[1.2rem] font-bold leading-tight text-[#FFF8EE] sm:text-[1.35rem]">
              {t("page.about.cta.heading")}
            </p>
            <p className="mt-1 text-[0.85rem] text-[#FFF8EE]/80 sm:text-[0.9rem]">
              {t("page.about.cta.body")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 rounded-full border border-[#D6AD60] bg-[#FFF8EE] px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#5A0F1E] transition hover:bg-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
            >
              {t("nav.joinLong")}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#FFF8EE]/60 px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#FFF8EE] transition hover:border-[#FFF8EE] hover:bg-[#FFF8EE]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
            >
              {t("nav.contact")}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
