import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
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
          <div className="grid gap-5 md:grid-cols-2">
            {chapters.map((chapter) => (
              <article
                id={chapter.id}
                key={chapter.id}
                className="scroll-mt-32 border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6"
              >
                <h2 className="text-xl font-bold text-[var(--ipf-navy)]">{chapter.name}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{chapter.note}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {chapter.email ? (
                    <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${chapter.email}`}>
                      {chapter.email}
                    </a>
                  ) : null}
                  <a className="font-semibold text-[var(--ipf-green)]" href={chapter.facebook} target="_blank" rel="noreferrer">
                    Chapter Facebook
                  </a>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
