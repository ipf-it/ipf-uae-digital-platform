import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { historyMilestones } from "../data/platformContent";

export default function HistoryPage() {
  return (
    <>
      <DocumentTitle title="History" />
      <PageHero
        eyebrow="Our journey"
        title="History of IPF UAE"
        description="From volunteer beginnings in 2014 to a licensed eight-chapter socio-cultural organisation serving Indians across the UAE."
        crumbs={[{ label: "About IPF", to: "/about" }, { label: "History" }]}
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
