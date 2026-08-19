import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { drishtiEditions } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function DrishtiPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.drishti.title")} />
      <PageHero
        eyebrow={t("page.events.eyebrow")}
        title={t("page.drishti.title")}
        description={t("page.drishti.desc")}
        crumbs={[{ label: t("page.events.eyebrow"), to: "/news" }, { label: t("page.drishti.title") }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid>
            {drishtiEditions.map((edition) => (
              <Card
                key={edition.period}
                href={edition.href}
                tone="ivory"
                image={edition.image}
                imageAlt={`${edition.title} ${edition.period}`}
                imageFit="contain"
                imageClassName="h-64"
                eyebrow={edition.period}
                title={edition.title}
                description={t("common.openReader")}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
