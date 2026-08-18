import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { chapters } from "../data/platformContent";

export default function ChaptersPage() {
  return (
    <>
      <DocumentTitle title="IPF Chapters" />
      <PageHero
        eyebrow="UAE presence"
        title="Chapters across the Emirates"
        description="IPF chapters are local teams of volunteers. Each chapter supports welfare, counselling and cultural programmes in its emirate."
        crumbs={[{ label: "Chapters" }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid columns={2}>
            {chapters.map((chapter) => (
              <Card id={chapter.id} key={chapter.id} tone="ivory" title={chapter.name} description={chapter.note}>
                <div className="flex flex-wrap gap-4 text-sm">
                  {chapter.email ? (
                    <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${chapter.email}`}>
                      {chapter.email}
                    </a>
                  ) : null}
                  <a className="font-semibold text-[var(--ipf-green)]" href={chapter.facebook} target="_blank" rel="noreferrer">
                    Chapter Facebook
                  </a>
                </div>
              </Card>
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
