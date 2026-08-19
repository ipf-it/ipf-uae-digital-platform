import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { historyMilestones } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function HistoryPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.history")} />
      <PageHero
        eyebrow={t("page.history.eyebrow")}
        title={t("page.history.title")}
        description={t("page.history.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.history") }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid columns={2}>
            {historyMilestones.map((mile) => (
              <Card key={mile.title} tone="ivory" eyebrow={mile.year} title={mile.title} description={mile.detail} />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
