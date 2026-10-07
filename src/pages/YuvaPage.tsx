import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, History, QrCode, Users } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * YuvaPage — IPF Yuva engagement + membership page (polished).
 *
 * HERO: approved — locked. Eyebrow / 2-line headline / rhythm line /
 * burgundy Join CTA sit over the preserved artwork via <IllustratedHero>.
 *
 * BELOW THE HERO (end-to-end polish 2026-10-07):
 *   1. A PLACE TO BELONG — asymmetric editorial transition with a small
 *      "Established · 20 October 2024" editorial note (the only
 *      authoritative historical fact worth surfacing from the old raw
 *      bottom block).
 *   2. CONNECT · CONTRIBUTE · CELEBRATE · LEAD — four engagement themes
 *      presented as a horizontal journey with saffron/green/gold accent
 *      rotation. Not SaaS cards — numbered editorial moments with
 *      hairline connectors.
 *   3. YOUR YUVA MEMBERSHIP — compact 2×2 → 4-across icon row (not
 *      chunky dashboard tiles). Four AUTHORITATIVE items from
 *      page.yuva.li1..li4, presented as practical membership tools
 *      AFTER the community proposition.
 *   4. BE PART OF IPF YUVA — tight single-column conversion band on a
 *      warm ivory wash with a restrained tricolour watercolour sweep.
 *      Primary burgundy "Join IPF Yuva" CTA + emotional closing line
 *      integrated into the same composition.
 *
 * REMOVED:
 *   • <PageSectionRenderer pageId="yuva"> at the tail — it was
 *     dumping the raw legacy i18n paragraphs (page.yuva.p1/p2 + li1-4)
 *     at the bottom, which duplicated the editorial content already
 *     presented above and leaked the internal line "this space is that
 *     home". The authoritative facts those paragraphs contained are
 *     now surfaced in the sections above (date → "Established" note;
 *     benefits → membership row).
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";
const SAFFRON = "#E8871E";
const GREEN = "#4A7A3E";

type Theme = {
  n: string;
  label: string;
  body: string;
  accent: string;
};

const WHY_JOIN: Theme[] = [
  { n: "01", label: "Connect",    body: "Meet young Indians from different backgrounds and communities across the UAE.", accent: SAFFRON },
  { n: "02", label: "Contribute", body: "Take part in community initiatives and opportunities to serve alongside others.", accent: GOLD_INK },
  { n: "03", label: "Celebrate",  body: "Stay connected with Indian culture, traditions and community experiences.",      accent: GREEN },
  { n: "04", label: "Lead",       body: "Bring ideas, take responsibility and grow through active participation.",        accent: GOLD_INK },
];

export default function YuvaPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.yuva.title")} />

      {/* ──────────────── HERO (locked — approved artwork + copy) ──────────────── */}
      <IllustratedHero
        eyebrow="IPF Yuva"
        title={
          <>
            Young Indians.
            <br />
            One Community.
          </>
        }
        description="Connect. Contribute. Celebrate. Lead."
        crumbs={[{ label: t("page.yuva.title") }]}
        artworkPng="/images/yuva/yuva-hero-art.png"
        artworkWebp="/images/yuva/yuva-hero-art.webp"
        artworkAlt="Youthful tricolour journey at sunrise through Indian heritage landscape"
        artworkPosition="object-[72%_center]"
        cta={
          <Button asChild size="lg">
            <Link to="/register?kind=yuva">
              Join IPF Yuva
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        }
      />

      {/* ──────────────── 1 · A PLACE TO BELONG ──────────────── */}
      <section className="relative isolate overflow-hidden bg-[#FFF8EE] py-12 sm:py-14 lg:py-16">
        {/* Decorative tricolour watercolour accent — subtle, far right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 opacity-[0.14] lg:block"
          style={{
            background:
              "conic-gradient(from 215deg, rgba(232,135,30,0.5), rgba(74,122,62,0.4), rgba(214,173,96,0.4), rgba(232,135,30,0.5))",
            filter: "blur(60px)",
          }}
        />
        <Container>
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                  A Place to Belong
                </p>
              </div>
              <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: MUTED }}>
                Established · 20 October 2024
              </p>
            </div>
            <div className="min-w-0">
              <h2
                className="font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight sm:text-[1.9rem] lg:text-[2.15rem]"
                style={{ color: NAVY }}
              >
                A place to belong. A chance to make a difference.
              </h2>
              <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed" style={{ color: INK }}>
                IPF Yuva is a platform for young Indians across the UAE to connect, contribute, celebrate their heritage and take an active role in building a stronger community — bringing people together around community, culture, service and shared experiences.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────── 2 · CONNECT · CONTRIBUTE · CELEBRATE · LEAD ──────────────── */}
      <section className="relative bg-[#FFFBF2] py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
              Why Join IPF Yuva
            </p>
            <h2
              className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              Four ways to be part of something bigger.
            </h2>
          </div>

          <ol
            role="list"
            className="relative mx-auto mt-10 grid max-w-[1180px] grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-x-8"
          >
            {/* Thin journey rule across the top on desktop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-px lg:block"
              style={{
                background:
                  "linear-gradient(to right, rgba(214,173,96,0) 0%, rgba(214,173,96,0.6) 15%, rgba(74,122,62,0.5) 40%, rgba(232,135,30,0.6) 70%, rgba(214,173,96,0) 100%)",
              }}
            />
            {WHY_JOIN.map((item, i) => (
              <li
                key={item.label}
                className={`relative flex flex-col items-start lg:items-center lg:text-center ${
                  /* Subtle vertical rhythm on desktop so the row doesn't
                     read as a stiff database grid. */
                  i % 2 === 1 ? "lg:translate-y-3" : ""
                }`}
              >
                <span
                  className="relative z-10 inline-flex size-14 shrink-0 items-center justify-center rounded-full border bg-white font-serif text-[1.3rem] font-bold leading-none"
                  style={{ borderColor: `${item.accent}80`, color: item.accent }}
                  aria-hidden="true"
                >
                  {item.n}
                </span>
                <p
                  className="mt-5 font-serif text-[1.2rem] font-bold leading-tight tracking-tight"
                  style={{ color: NAVY }}
                >
                  {item.label}
                </p>
                <p className="mt-2 max-w-[260px] text-[0.9rem] leading-relaxed lg:max-w-none" style={{ color: MUTED }}>
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ──────────────── 3 · YOUR YUVA MEMBERSHIP (compact) ──────────────── */}
      <section className="relative bg-[#FFF8EE] py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="mx-auto max-w-[1100px]">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr] lg:items-start lg:gap-14">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                    Yuva Membership
                  </p>
                </div>
                <h2
                  className="mt-3 font-serif text-[1.4rem] font-bold leading-tight tracking-tight sm:text-[1.6rem] lg:text-[1.8rem]"
                  style={{ color: NAVY }}
                >
                  Your Yuva Membership
                </h2>
                <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed" style={{ color: MUTED }}>
                  Yuva members enrol through the IPF UAE membership application. On registration you receive the identity and tools to serve at chapter events and community initiatives.
                </p>
              </div>

              <ul
                role="list"
                className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2"
              >
                {[
                  { icon: BadgeCheck, label: "Permanent Yuva ID", body: t("page.yuva.li1") },
                  { icon: QrCode,     label: "Digital card + QR", body: t("page.yuva.li2") },
                  { icon: History,    label: "Hours in your portal", body: t("page.yuva.li3") },
                  { icon: Users,      label: "Chapter desk access", body: t("page.yuva.li4") },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border bg-white"
                        style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-[0.98rem] font-semibold leading-tight tracking-tight" style={{ color: NAVY }}>
                          {item.label}
                        </p>
                        <p className="mt-1 text-[0.85rem] leading-relaxed" style={{ color: MUTED }}>
                          {item.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────── 4 · BE PART OF IPF YUVA (conversion + closing) ──────────────── */}
      <section className="relative isolate overflow-hidden bg-[#FFF8EE] py-16 sm:py-18 lg:py-20">
        {/* Restrained tricolour watercolour sweep behind the composition */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[320px] -translate-y-1/2 opacity-[0.08]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(232,135,30,0.45) 0%, rgba(232,135,30,0) 55%), radial-gradient(ellipse at 55% 50%, rgba(214,173,96,0.35) 0%, rgba(214,173,96,0) 60%), radial-gradient(ellipse at 85% 50%, rgba(74,122,62,0.4) 0%, rgba(74,122,62,0) 55%)",
          }}
        />
        <Container>
          <div className="mx-auto max-w-[1000px]">
            <div className="rounded-[22px] border border-[#D6AD60]/35 bg-white/80 px-7 py-10 shadow-[0_14px_38px_rgba(11,31,58,0.08)] backdrop-blur-sm sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="inline-block h-px w-8" style={{ backgroundColor: `${GOLD}aa` }} />
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                      Be Part of IPF Yuva
                    </p>
                  </div>
                  <h2
                    className="mt-4 font-serif text-[1.65rem] font-bold leading-[1.1] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
                    style={{ color: NAVY }}
                  >
                    Your ideas.
                    <br />
                    Your energy.
                    <br />
                    Your community.
                  </h2>
                  <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed" style={{ color: INK }}>
                    Whether you want to contribute your time, meet people, participate in community initiatives or simply become more connected, IPF Yuva is a place to begin.
                  </p>
                </div>

                <div className="flex min-w-0 flex-col items-start gap-5 lg:items-end">
                  <Button asChild size="lg">
                    <Link to="/register?kind=yuva">
                      Join IPF Yuva
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                  <p
                    className="max-w-xs font-serif text-[0.98rem] italic leading-relaxed lg:text-right"
                    style={{ color: NAVY }}
                  >
                    One community grows stronger when the next generation steps forward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
