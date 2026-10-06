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
          FULL-BLEED panoramic banner: artwork spans the entire hero
          width via object-fit:cover + object-position:center top. The
          image's natural ivory/cream negative space on the LEFT holds
          the HTML text, and a soft ivory→transparent gradient wash
          restores text contrast without applying any colour tint to
          the artwork itself. object-position:center top preserves
          monument tops (Red Fort + flag, Taj, temple tower, mountain
          peaks, mandala corner); the bottom tricolour watercolour wave
          sits toward the bottom edge of the hero at close-to-natural
          aspect because the hero clamp(340..520) tracks the image's
          2.81:1 panoramic ratio. ZERO colour overlay, no filter,
          no blend-mode — image renders at natural opacity. */}
      <section
        aria-labelledby="councils-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <div className="relative w-full" style={{ height: "clamp(340px, 34vw, 520px)" }}>
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
              className="absolute inset-0 block h-full w-full object-cover"
              style={{ objectPosition: "center top", filter: "none", opacity: 1 }}
            />
          </picture>

          {/* Ivory wash on the LEFT only — fades to transparent by 68%
              of width so the India composition remains fully visible on
              the right. No tint applied to the artwork itself. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,248,238,0.92) 0%, rgba(255,248,238,0.78) 30%, rgba(255,248,238,0.35) 52%, rgba(255,248,238,0) 68%)",
            }}
          />

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
