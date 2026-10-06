import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, QrCode, History, Users } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * YuvaPage — IPF Yuva engagement + membership page.
 *
 * APPROVED HERO ARTWORK preserved (/images/yuva/yuva-hero-art.*). The
 * eyebrow/title/description/crumbs pass through <IllustratedHero> so
 * the artwork, responsive crop and premium typography system remain
 * identical to the rest of the About family.
 *
 * Below the hero
 *   • Introduction band — editorial lede
 *   • Why join IPF Yuva — four engagement themes (Connect / Contribute
 *     / Celebrate / Lead) as a premium 4-column grid, not SaaS feature
 *     boxes
 *   • What you get when you join — the four AUTHORITATIVE Yuva benefits
 *     already present in i18n (page.yuva.li1..li4): permanent
 *     YUVA-UAE-XXXXXX ID, digital card + QR, hours in portal, chapter
 *     desk visibility
 *   • Join section — conversion band with burgundy CTA to
 *     /register?kind=yuva (existing membership flow — no new route)
 *   • Emotional closing line
 *
 * CMS extensibility preserved via <PageSectionRenderer pageId="yuva">
 * at the end so admin editors can continue to append sections.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

type Theme = {
  n: string;
  label: string;
  body: string;
};

const WHY_JOIN: Theme[] = [
  { n: "01", label: "Connect",     body: "Meet young Indians from different backgrounds and communities across the UAE." },
  { n: "02", label: "Contribute",  body: "Take part in community initiatives and opportunities to serve alongside others." },
  { n: "03", label: "Celebrate",   body: "Stay connected with Indian culture, traditions and community experiences." },
  { n: "04", label: "Lead",        body: "Bring ideas, take responsibility and grow through active participation." },
];

export default function YuvaPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.yuva.title")} />

      {/* ──────────────── HERO (approved artwork preserved) ──────────────── */}
      <IllustratedHero
        eyebrow="IPF Yuva"
        title="Young Indians. Shared Roots. A Future We Build Together."
        description="A platform for young Indians across the UAE to connect, contribute, celebrate their heritage and take an active role in building a stronger community."
        crumbs={[{ label: t("page.yuva.title") }]}
        artworkPng="/images/yuva/yuva-hero-art.png"
        artworkWebp="/images/yuva/yuva-hero-art.webp"
        artworkAlt="Youthful tricolour journey at sunrise through Indian heritage landscape"
        artworkPosition="object-[72%_center]"
      />

      {/* ──────────────── INTRODUCTION ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                A Place to Belong
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              className="mt-4 font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
              style={{ color: NAVY }}
            >
              A place to belong. A chance to make a difference.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-relaxed" style={{ color: INK }}>
              IPF Yuva brings young Indians in the UAE together around community, culture, service and shared experiences. It creates opportunities to meet people, contribute ideas, participate in meaningful initiatives and stay connected to the values and traditions that bring the Indian community together.
            </p>
          </div>
        </Container>
      </Section>

      {/* ──────────────── WHY JOIN IPF YUVA ──────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
              Why Join IPF Yuva
            </p>
            <h2
              className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              Connect. Contribute. Grow.
            </h2>
          </div>

          <ul role="list" className="mx-auto mt-10 grid max-w-[1180px] grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-x-10">
            {WHY_JOIN.map((item) => (
              <li key={item.label} className="border-t pt-5" style={{ borderColor: `${GOLD}99` }}>
                <p className="font-serif text-[0.72rem] font-bold tabular-nums" style={{ color: GOLD_INK }}>
                  {item.n}
                </p>
                <p className="mt-3 font-serif text-[1.15rem] font-bold leading-tight tracking-tight sm:text-[1.25rem]" style={{ color: NAVY }}>
                  {item.label}
                </p>
                <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ──────────────── WHAT YOU GET WHEN YOU JOIN ────────────────
          Uses the AUTHORITATIVE Yuva benefits from i18n (page.yuva.li1..4). */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Yuva Membership
              </p>
              <h2
                className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
                style={{ color: NAVY }}
              >
                What you receive when you join
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                Yuva members enrol through the IPF UAE membership application. On registration you receive the identity and tools to serve at chapter events, cultural programmes and community initiatives.
              </p>
            </div>

            <ul
              role="list"
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6"
            >
              {[
                { icon: BadgeCheck, label: "Permanent Yuva ID", body: t("page.yuva.li1") },
                { icon: QrCode,     label: "Digital card + QR", body: t("page.yuva.li2") },
                { icon: History,    label: "Hours in your portal", body: t("page.yuva.li3") },
                { icon: Users,      label: "Chapter desk access", body: t("page.yuva.li4") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFF8EE]"
                      style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <p className="mt-4 font-serif text-[1rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                      {item.label}
                    </p>
                    <p className="mt-2 text-[0.88rem] leading-relaxed" style={{ color: MUTED }}>
                      {item.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ──────────────── JOIN SECTION (conversion) ──────────────── */}
      <Section tone="white" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-10 border-t border-b border-[#D6AD60]/30 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14 sm:py-14">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-8" style={{ backgroundColor: `${GOLD}aa` }} />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                    Be Part of IPF Yuva
                  </p>
                </div>
                <h2
                  className="mt-4 font-serif text-[1.6rem] font-bold leading-[1.1] tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
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
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-end">
                <Button asChild size="lg">
                  <Link to="/register?kind=yuva">
                    Join IPF Yuva
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">Explore membership</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ──────────────── EMOTIONAL CLOSING ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-18">
        <Container>
          <p
            className="mx-auto max-w-2xl text-center font-serif text-[1.1rem] italic leading-relaxed sm:text-[1.25rem] lg:text-[1.35rem]"
            style={{ color: NAVY }}
          >
            One community grows stronger when the next generation steps forward.
          </p>
        </Container>
      </Section>

      {/* CMS-extensible tail — admin editors can continue appending sections */}
      <PageSectionRenderer pageId="yuva" startTone="white" />
    </>
  );
}
