import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drishtiEditions.map((edition) => (
              <a
                key={edition.period}
                href={edition.href}
                target="_blank"
                rel="noreferrer"
                className="bg-[var(--ipf-ivory)] hover:opacity-95"
              >
                <FramedPhoto src={edition.image} alt={`${edition.title} ${edition.period}`} imgClassName="h-64" loading="lazy" />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{edition.period}</p>
                  <h2 className="mt-2 text-lg font-bold text-[var(--ipf-navy)]">{edition.title}</h2>
                  <p className="mt-1 text-xs text-[var(--ipf-muted)]">Open reader</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
