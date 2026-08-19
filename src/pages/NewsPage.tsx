import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function NewsPage() {
  const { t } = useLocale();
  const { content } = useCms();
  return (
    <>
      <DocumentTitle title={t("nav.news")} />
      <PageHero
        eyebrow={t("page.events.eyebrow")}
        title={t("page.news.title")}
        description={t("page.news.desc")}
        crumbs={[{ label: t("nav.news") }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid columns={2}>
            {content.news.map((item) => (
              <Card
                key={item.slug}
                to={`/news/${item.slug}`}
                tone="ivory"
                image={item.image}
                imageAlt={item.title}
                eyebrow={item.date}
                title={item.title}
                description={item.excerpt}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
      <PageExtras page="news" />
    </>
  );
}
