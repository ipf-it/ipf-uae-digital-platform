import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { drishtiEditions } from "../data/platformContent";

export default function DrishtiPage() {
  return (
    <>
      <DocumentTitle title="Drishti e-Magazine" />
      <PageHero
        eyebrow="Resources"
        title="Drishti e-Magazine"
        description="IPF's public newsletter and magazine editions, from the first issues through the latest special booklet."
        crumbs={[{ label: "Resources", to: "/news" }, { label: "Drishti e-Magazine" }]}
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
                description="Open reader"
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
