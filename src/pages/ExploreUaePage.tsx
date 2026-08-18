import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
import { PillNav } from "../components/ui/Tabs";
import { galleryNavItems } from "../data/galleryNav";
import { chapterList, uaeHighlights } from "../data/platformContent";
import { img } from "../data/site";

export default function ExploreUaePage() {
  const { content } = useCms();
  const slides = content.galleryImages.slice(0, 6);
  return (
    <>
      <DocumentTitle title="Explore UAE" />
      <PageHero
        eyebrow="Gallery"
        title="Explore the UAE"
        description="The United Arab Emirates is home to the Indian community IPF serves. Respect for local law, culture and institutions is part of every chapter's work."
        crumbs={[{ label: "Gallery", to: "/gallery" }, { label: "Explore UAE" }]}
      />
      <Section tone="white">
        <Container>
          <div className="mb-8">
            <PillNav items={galleryNavItems} />
          </div>
          <div className="grid items-stretch gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-5">
            {uaeHighlights.map((item) => (
              <Card key={item.title} tone="ivory" title={item.title} description={item.description} />
            ))}
          </div>
          {slides.length > 0 ? (
            <ImageCarousel slides={slides} heightClass="aspect-[4/3] h-auto w-full" />
          ) : (
            <FitImage src={img.slider} alt="Community life in the UAE" />
          )}
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">IPF across the Emirates</h2>
          <CardGrid columns={4} className="mt-6">
            {chapterList.map((chapter) => (
              <Card key={chapter} to="/chapters" size="sm" align="center" title={chapter} />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
