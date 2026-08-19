import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function ResourcesPage() {
  const { t } = useLocale();
  const items = [
    { title: t("page.drishti.title"), description: t("page.drishti.desc"), to: "/drishti" },
    { title: t("nav.support"), description: t("page.support.desc"), to: "/support" },
    { title: t("nav.ipfCares"), description: t("page.councils.caresBody"), to: "/support#community" },
    { title: t("nav.governance"), description: t("page.events.standing"), to: "/governance" },
    { title: t("nav.news"), description: t("page.news.desc"), to: "/news" },
    { title: t("nav.events"), description: t("page.events.desc"), to: "/events" },
  ];

  return (
    <>
      <DocumentTitle title={t("nav.resources")} />
      <PageHero
        eyebrow={t("page.events.eyebrow")}
        title={t("nav.resources")}
        description={t("page.resources.desc")}
        crumbs={[{ label: t("nav.resources") }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid columns={2}>
            {items.map((item) => (
              <Card key={item.to} to={item.to} tone="ivory" title={item.title} description={item.description} />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
