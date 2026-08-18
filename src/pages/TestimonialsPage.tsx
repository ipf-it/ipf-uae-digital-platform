import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { testimonials } from "../data/platformContent";

export default function TestimonialsPage() {
  return (
    <>
      <DocumentTitle title="Testimonials" />
      <PageHero
        eyebrow="Community record"
        title="Testimonials"
        description="Public photographs from IPF's Vande Bharat Mission repatriation work and the Mahatma Gandhi 150-year programme."
        crumbs={[{ label: "Testimonials" }]}
      />
      {testimonials.map((group, index) => (
        <Section key={group.group} tone={index % 2 === 0 ? "white" : "ivory"}>
          <Container>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{group.group}</h2>
            <div className="mt-8">
              <ImageCarousel
                slides={group.items.map((item) => ({ src: item.image, alt: item.title, caption: item.title }))}
                heightClass="h-[240px] sm:h-[380px]"
              />
            </div>
          </Container>
        </Section>
      ))}
    </>
  );
}
