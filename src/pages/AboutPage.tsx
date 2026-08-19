import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { PageExtras } from "../cms/PageExtras";
import { Section } from "../components/ui/Section";
import { img } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

const visionKeys = ["page.about.vision1", "page.about.vision2", "page.about.vision3", "page.about.vision4"] as const;
const valueKeys = ["page.about.value1", "page.about.value2", "page.about.value3", "page.about.value4"] as const;
const aimKeys = [
  "page.about.aim1",
  "page.about.aim2",
  "page.about.aim3",
  "page.about.aim4",
  "page.about.aim5",
  "page.about.aim6",
  "page.about.aim7",
  "page.about.aim8",
  "page.about.aim9",
  "page.about.aim10",
] as const;
const respKeys = ["page.about.resp1", "page.about.resp2", "page.about.resp3", "page.about.resp4", "page.about.resp5"] as const;

export default function AboutPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.aboutIpf")} />
      <PageHero
        eyebrow={t("page.about.eyebrow")}
        title={t("page.about.title")}
        description={t("page.about.desc")}
        crumbs={[{ label: t("nav.aboutIpf") }]}
      />
      <Section tone="white">
        <Container className="grid items-stretch gap-8 md:grid-cols-2">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)] sm:text-base">
            <p>{t("page.about.p1")}</p>
            <p>{t("page.about.p2")}</p>
            <p>{t("page.about.p3")}</p>
          </div>
          <FitImage fill fit="contain" src={img.indiaUae} alt="India and UAE partnership" />
        </Container>
      </Section>

      <Section id="vision">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{t("page.about.visionEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
              {t("page.about.visionTitle")}
            </h2>
            <ul className="mt-5 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
              {visionKeys.map((key) => (
                <li key={key}>• {t(key)}</li>
              ))}
            </ul>
          </div>
          <FitImage className="lg:order-first" src={img.vision} alt="IPF vision of community unity" />
        </Container>
      </Section>

      <Section id="values" tone="white">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{t("page.about.valuesEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">{t("page.about.valuesTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              {t("page.about.valuesBody")}
            </p>
            <CardGrid columns={2} className="mt-6">
              {valueKeys.map((key) => (
                <Card key={key} size="sm" tone="ivory" title={t(key)} />
              ))}
            </CardGrid>
          </div>
          <FitImage
            fit="contain"
            src={img.values}
            alt="Satyameva Jayate — State Emblem of India"
            className="mx-auto h-[220px] w-full max-w-[280px] sm:h-[280px]"
          />
        </Container>
      </Section>

      <Section id="aims">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{t("page.about.aimsEyebrow")}</p>
          <h2 id="aim-objective" className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
            {t("page.about.aimsTitle")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.about.aimsIntro")}
          </p>
          <CardGrid columns={2} className="mt-8">
            {aimKeys.map((key, index) => (
              <Card key={key} size="sm" eyebrow={`0${index + 1}`.slice(-2)} description={t(key)} />
            ))}
          </CardGrid>
        </Container>
      </Section>

      <Section id="responsibility" tone="white">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{t("page.about.respEyebrow")}</p>
            <h2 id="our-responsibility" className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
              {t("page.about.respTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              {t("page.about.respBody")}
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
              {respKeys.map((key) => (
                <li key={key}>• {t(key)}</li>
              ))}
            </ul>
          </div>
          <FitImage src={img.responsibility} alt="IPF community responsibility programmes" />
        </Container>
      </Section>
      <PageExtras page="about" />
    </>
  );
}
