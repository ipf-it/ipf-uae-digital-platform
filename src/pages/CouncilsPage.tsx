import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { councilPath } from "../data/orgNav";
import {
  STATE_COUNCIL_COUNT,
  SPECIAL_COUNCIL_COUNT,
} from "../data/orgCounts";
import { useOrgCouncils } from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";

export default function CouncilsPage() {
  const { t } = useLocale();
  const { councils } = useOrgCouncils();
  const stateCouncils = councils.filter((council) => council.kind === "state");
  const specialCouncils = councils.filter((council) => council.kind === "special");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && councils.some((council) => council.id === id)) navigate(councilPath(id), { replace: true });
  }, [location.hash, navigate, councils]);

  return (
    <>
      <DocumentTitle title={t("nav.councils")} />

      {/* ──────────────── HERO — approved India's Heritage in Watercolour ────────────────
          Supplied artwork at /images/councils/councils-hero.{webp,png}
          (2103×748 panorama) with a deliberate ivory negative space on
          the LEFT and the detailed India heritage composition on the
          RIGHT (Red Fort + flag, Taj, mountains, elephant, performers,
          temple tower, tricolour watercolour ribbon). Rendered with
          object-fit:contain so no monument top gets clipped at any
          width — image anchors to bottom-right, blank area blends with
          the section's ivory background and holds the HTML text.
          Zero overlay / filter / tint / gradient — image renders at
          natural opacity. */}
      <section
        aria-labelledby="councils-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <div className="relative w-full" style={{ height: "clamp(320px, 32vw, 440px)" }}>
          <picture>
            <source srcSet="/images/councils/councils-hero.webp" type="image/webp" />
            <img
              src="/images/councils/councils-hero.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              width={2103}
              height={748}
              className="absolute inset-0 block h-full w-full object-contain"
              style={{ objectPosition: "bottom right", filter: "none", opacity: 1 }}
            />
          </picture>

          <div className="absolute inset-0 flex items-center">
            <Container>
              <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[580px]">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="inline-block h-px w-8" style={{ backgroundColor: `${GOLD}aa` }} />
                  <p
                    className="text-[0.7rem] font-bold uppercase tracking-[0.3em] sm:text-[0.75rem]"
                    style={{ color: GOLD_INK }}
                  >
                    Councils
                  </p>
                </div>
                <h1
                  id="councils-page-heading"
                  className="mt-3 font-serif text-[1.7rem] font-bold leading-[1.08] tracking-tight sm:text-[2.05rem] md:text-[2.3rem] lg:text-[2.5rem]"
                  style={{ color: NAVY }}
                >
                  Many traditions.
                  <br />
                  One Indian community.
                </h1>
                <div aria-hidden="true" className="mt-4 h-px w-14" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="mt-4 max-w-[480px] text-[0.95rem] leading-relaxed sm:text-[1rem]" style={{ color: INK }}>
                  {STATE_COUNCIL_COUNT} State Councils and {SPECIAL_COUNCIL_COUNT} Special Councils bring together communities across India's diverse cultural and regional heritage.
                </p>
              </div>
            </Container>
          </div>
        </div>
      </section>
      <Section tone="white" id="state-councils" className="scroll-mt-28">
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("nav.stateCouncils")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">{t("page.councils.stateBody")}</p>
          <CardGrid columns={3}>
            {stateCouncils.map((council) => (
              <Card
                id={council.id}
                key={council.id}
                className="scroll-mt-28"
                size="sm"
                tone="ivory"
                title={council.name}
                to={councilPath(council.id)}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
      <Section id="special-councils" className="scroll-mt-28">
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("nav.specialCouncils")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">{t("page.councils.specialBody")}</p>
          <CardGrid columns={2}>
            {specialCouncils.map((council) => (
              <Card
                id={council.id}
                key={council.id}
                className="scroll-mt-28"
                tone="ivory"
                title={council.name}
                description={council.description}
                to={councilPath(council.id)}
              />
            ))}
          </CardGrid>
          <p className="text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.councils.yuvaNote")}{" "}
            <Link className="font-semibold text-[var(--ipf-green)]" to="/yuva">
              {t("nav.yuva")}
            </Link>
          </p>
        </Container>
      </Section>
      <Section tone="white">
        <Container>
          <div className="rounded-xl border border-[#e8a0a8] bg-[#fdf2f2] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[#c41e3a]">
                <Phone className="size-4" />
                {t("nav.ipfCares")}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ipf-muted)]">{t("page.councils.caresBody")}</p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link to="/support#community">{t("nav.support")}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
