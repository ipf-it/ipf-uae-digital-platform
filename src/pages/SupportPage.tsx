import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Mail, MessageCircle, Users } from "lucide-react";
import { PageExtras } from "../cms/PageExtras";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { usePageSections } from "../hooks/usePageSections";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * SupportPage — IPF UAE community support + IPF Cares.
 *
 * APPROVED HERO ARTWORK preserved (/images/support/support-hero-art.*).
 *
 * Below the hero
 *   • Introduction band — "You don't have to find the right path alone."
 *   • IPF CARES prominent section — ivory + burgundy editorial band with
 *     an id="ipf-cares" anchor so the hero's "Get Support" CTA scrolls
 *     straight to it. CTA inside the band routes to /contact (the
 *     authoritative contact pathway — Support explains, Contact acts).
 *   • How Support Works — simple 3-step editorial strip
 *   • Support Areas — guidance based on EXISTING authoritative i18n
 *     content (grievances/counselling · cultural challenges · blue-
 *     collared workers · local services · community support). No
 *     fabricated categories (no "legal / medical / financial / jobs").
 *   • Closing CTA — reach the right connection
 *
 * CMS extensibility preserved via <PageExtras page="support">. Existing
 * usePageSections("support") still loads admin overrides for
 * grievances/community bodies and uses them in preference to the i18n
 * fallback — same source of truth as before.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const BURGUNDY = "var(--ipf-burgundy)";
const INK = "#1c2430";
const MUTED = "#55606d";

export default function SupportPage() {
  const { t } = useLocale();
  const { sections } = usePageSections("support");
  const grievanceBody = sections[0]?.body;
  const communityBody = sections[1]?.body;

  return (
    <>
      <DocumentTitle title={t("nav.support")} />

      {/* ──────────────── HERO (approved artwork preserved) ──────────────── */}
      <IllustratedHero
        eyebrow="Community Support"
        title="Here when you need us."
        description="Guidance. Support. Community."
        crumbs={[{ label: t("nav.resources"), to: "/resources" }, { label: t("nav.support") }]}
        artworkPng="/images/support/support-hero-art.png"
        artworkWebp="/images/support/support-hero-art.webp"
        artworkAlt="Hands forming a circle of unity, foliage and tricolour ribbon"
        artworkPosition="object-[72%_center]"
      />

      {/* ──────────────── INTRODUCTION ──────────────── */}
      <Section tone="ivory" className="py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
              style={{ color: NAVY }}
            >
              You don't have to find the right path alone.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
              IPF UAE's community network brings people together not only for culture and celebration, but also to help members of the community find the right connection when support is needed.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="lg">
                <a href="#ipf-cares">
                  Get Support
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Contact IPF</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* ──────────────── IPF CARES (prominent) ──────────────── */}
      <section
        id="ipf-cares"
        aria-labelledby="ipf-cares-heading"
        className="relative scroll-mt-28 bg-[#FFF8EE] py-14 sm:py-18 lg:py-24"
      >
        <Container>
          <div className="mx-auto max-w-[1120px]">
            <div className="overflow-hidden rounded-[22px] border border-[#D6AD60]/40 bg-[#FFFBF2] shadow-[0_14px_38px_rgba(11,31,58,0.08)]">
              <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:p-14">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${BURGUNDY}`, color: "#FFF8EE" }}
                    >
                      <HeartHandshake className="size-4" />
                    </span>
                    <p
                      className="text-[0.72rem] font-bold uppercase tracking-[0.3em]"
                      style={{ color: BURGUNDY }}
                    >
                      IPF Cares
                    </p>
                  </div>
                  <h2
                    id="ipf-cares-heading"
                    className="mt-4 font-serif text-[1.65rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] lg:text-[2.2rem]"
                    style={{ color: NAVY }}
                  >
                    Care begins with listening.
                  </h2>
                  <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed" style={{ color: INK }}>
                    {grievanceBody ? (
                      grievanceBody.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                      <>
                        <p>
                          <strong style={{ color: NAVY }}>{t("page.support.cultural")}</strong>{" "}
                          {t("page.support.culturalBody")}
                        </p>
                        <p>
                          <strong style={{ color: NAVY }}>{t("page.support.workers")}</strong>{" "}
                          {t("page.support.workersBody")}
                        </p>
                        <p>
                          <strong style={{ color: NAVY }}>{t("page.support.local")}</strong>{" "}
                          {t("page.support.localBody")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <aside className="min-w-0 rounded-[18px] border border-[#D6AD60]/40 bg-[#FFF8EE] p-6 sm:p-7">
                  <p
                    className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                    style={{ color: GOLD_INK }}
                  >
                    Reach IPF Cares
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                    If you or someone you know needs guidance from IPF UAE's community network, write to our team and we'll connect your enquiry with the right people.
                  </p>
                  <div className="mt-5 flex items-start gap-3">
                    <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" style={{ color: GOLD_INK }} />
                    <a
                      className="break-all text-[0.95rem] font-semibold underline-offset-4 hover:underline"
                      style={{ color: NAVY }}
                      href={`mailto:${site.grievanceEmail}`}
                    >
                      {site.grievanceEmail}
                    </a>
                  </div>
                  <div className="mt-6">
                    <Button asChild>
                      <Link to="/contact#ipf-cares">
                        Contact IPF Cares
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </Button>
                  </div>
                  <p className="mt-5 text-[0.78rem] leading-relaxed" style={{ color: MUTED }}>
                    IPF UAE community support is not a replacement for UAE emergency or professional services.
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────── HOW SUPPORT WORKS ──────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
              How Support Works
            </p>
            <h2
              className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              A simple way to reach the right people.
            </h2>
          </div>
          <ol
            role="list"
            className="mx-auto mt-10 grid max-w-[1120px] grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-3 lg:gap-8"
          >
            {[
              { n: "01", label: "Tell us how we can help", body: "Share your enquiry via the contact form, email or your local chapter desk." },
              { n: "02", label: "We connect to the right channel", body: "Your enquiry is routed to the IPF UAE team, chapter or council best placed to respond." },
              { n: "03", label: "The relevant team responds", body: "An IPF UAE volunteer or desk responds, or guides you further to the appropriate community channel." },
            ].map((s) => (
              <li
                key={s.n}
                className="relative rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7"
              >
                <p className="font-serif text-[0.74rem] font-bold tabular-nums tracking-[0.22em]" style={{ color: GOLD_INK }}>
                  {s.n}
                </p>
                <p className="mt-3 font-serif text-[1.1rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                  {s.label}
                </p>
                <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ──────────────── SUPPORT AREAS (authoritative only) ──────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Support Areas
              </p>
              <h2
                className="mt-3 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
                style={{ color: NAVY }}
              >
                Guidance across community life
              </h2>
            </div>
            <ul
              role="list"
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-2 lg:gap-7"
            >
              <li className="rounded-[18px] border border-[#D6AD60]/35 bg-white p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFFBF2]"
                    style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                  >
                    <Users className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[1.05rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                      {t("page.support.cultural").replace(/\.$/, "")}
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                      {t("page.support.culturalBody")}
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-[18px] border border-[#D6AD60]/35 bg-white p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFFBF2]"
                    style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                  >
                    <HeartHandshake className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[1.05rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                      {t("page.support.workers").replace(/\.$/, "")}
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                      {t("page.support.workersBody")}
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-[18px] border border-[#D6AD60]/35 bg-white p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFFBF2]"
                    style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                  >
                    <MessageCircle className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[1.05rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                      {t("page.support.local").replace(/\.$/, "")}
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                      {t("page.support.localBody")}
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-[18px] border border-[#D6AD60]/35 bg-white p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFFBF2]"
                    style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                  >
                    <Users className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[1.05rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                      Community Support
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                      {communityBody || t("page.support.communityBody")}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      {/* ──────────────── CLOSING CTA ──────────────── */}
      <Section tone="white" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 border-t border-b border-[#D6AD60]/30 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14 sm:py-14">
              <div className="min-w-0">
                <h2
                  className="font-serif text-[1.55rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]"
                  style={{ color: NAVY }}
                >
                  We're here to help you find the right connection.
                </h2>
                <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                  If you're unsure where to begin, reach out to IPF UAE and we'll help direct your enquiry to the appropriate community channel.
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-end">
                <Button asChild size="lg">
                  <a href="#ipf-cares">
                    Get Support
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">Contact IPF</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* CMS-extensible tail — admin editors can append sections */}
      <PageExtras page="support" />
    </>
  );
}
