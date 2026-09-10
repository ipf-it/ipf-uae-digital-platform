import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

export default function GovernancePage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.governance")} />
      <PageHero
        eyebrow={t("page.governance.eyebrow")}
        title={t("page.governance.title")}
        description={t("page.governance.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.governance") }]}
      />
      <Section id="bye-law" tone="white">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.bye")}</h2>
          <p>{t("page.governance.bye1")}</p>
          <p>{t("page.governance.bye2")}</p>
          <p>{t("page.governance.bye3")}</p>
        </Container>
      </Section>
      <Section id="ethics">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.ethics")}</h2>
          <p>{t("page.governance.ethicsLead")}</p>
          <ul className="space-y-2">
            <li>• {t("page.governance.ethics1")}</li>
            <li>• {t("page.governance.ethics2")}</li>
            <li>• {t("page.governance.ethics3")}</li>
            <li>• {t("page.governance.ethics4")}</li>
            <li>• {t("page.governance.ethics5")}</li>
          </ul>
        </Container>
      </Section>
      <Section id="it-policy" tone="white">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.it")}</h2>
          <p>{t("page.governance.it1")}</p>
          <p>{t("page.governance.it2")}</p>
        </Container>
      </Section>
      <PageExtras page="governance" />
    </>
  );
}
