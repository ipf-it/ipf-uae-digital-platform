import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CouncilCard } from "../components/CouncilCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { councilPath } from "../data/orgNav";
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
                  State and Special Councils bringing together communities across India's diverse cultural and regional heritage.
                </p>
              </div>
            </Container>
          </div>
        </div>
      </section>
      {/* ──────────────── STATE COUNCILS DIRECTORY ──────────────── */}
      <Section tone="white" id="state-councils" className="scroll-mt-28 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                State Councils
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              Communities representing India's states and regions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.92rem] leading-relaxed" style={{ color: INK }}>
              {t("page.councils.stateBody")}
            </p>
          </div>

          <ul
            role="list"
            className="mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-7"
          >
            {stateCouncils.map((council) => (
              <li key={council.id} className="min-w-0">
                <CouncilCard
                  slug={council.id}
                  name={council.name}
                  kind="state"
                  region={council.region ?? ""}
                  descriptor={council.description}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ──────────────── SPECIAL COUNCILS DIRECTORY ──────────────── */}
      <Section tone="ivory" id="special-councils" className="scroll-mt-28 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
                Special Councils
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>
            <h2
              className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.8rem] lg:text-[2rem]"
              style={{ color: NAVY }}
            >
              Focused communities across specialised areas
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.92rem] leading-relaxed" style={{ color: INK }}>
              {t("page.councils.specialBody")}
            </p>
          </div>

          {/* 3-card grid designed deliberately for THREE items.
              lg+: 3 equal columns at a narrower max-w so each card
              remains proportionate to the state cards above and the
              row doesn't look like a 4-col grid with a missing fourth.
              md: 3 across still comfortable; sm: single column
              (two-up at narrow widths would need a centered orphan). */}
          <ul
            role="list"
            className="mx-auto mt-10 grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-3 lg:mt-12 lg:gap-7"
          >
            {specialCouncils.map((council) => (
              <li key={council.id} className="min-w-0">
                <CouncilCard
                  slug={council.id}
                  name={council.name}
                  kind="special"
                  region={council.region ?? ""}
                  descriptor={council.description}
                />
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-2xl text-center text-[0.9rem] leading-relaxed" style={{ color: INK }}>
            {t("page.councils.yuvaNote")}{" "}
            <Link className="font-semibold underline-offset-4 hover:underline" style={{ color: NAVY }} to="/yuva">
              {t("nav.yuva")}
            </Link>
            .
          </p>
        </Container>
      </Section>
      {/* IPF Cares promo block retired from Councils per architecture:
          /support explains IPF Cares, /contact is the primary actionable
          contact. See SupportPage.tsx #ipf-cares + ContactPage.tsx. */}
    </>
  );
}
