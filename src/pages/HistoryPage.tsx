import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
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
          <div className="grid gap-4 md:grid-cols-2">
            {historyMilestones.map((mile) => (
              <article key={mile.title} className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{mile.year}</p>
                <h2 className="mt-2 text-xl font-bold text-[var(--ipf-navy)]">{mile.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{mile.detail}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
