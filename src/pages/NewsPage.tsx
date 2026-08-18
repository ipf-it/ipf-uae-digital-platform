import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export default function NewsPage() {
  const { content } = useCms();
  return (
    <>
      <DocumentTitle title="News" />
      <PageHero
        eyebrow="Resources"
        title="News and updates"
        description="Public highlights from IPF programmes, community meetings and organisational milestones."
        crumbs={[{ label: "News" }]}
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
