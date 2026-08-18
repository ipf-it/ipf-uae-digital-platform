import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
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
        <Container className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            {uaeHighlights.map((item) => (
              <article key={item.title} className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-5">
                <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{item.description}</p>
              </article>
            ))}
          </div>
          {slides.length > 0 ? (
            <ImageCarousel slides={slides} heightClass="aspect-[4/3] h-auto w-full" />
          ) : (
            <FitImage src={img.slider} alt="Community life in the UAE" />
          )}
        </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">IPF across the Emirates</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chapterList.map((chapter) => (
              <Link
                key={chapter}
                to="/chapters"
                className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] px-4 py-4 text-center text-sm font-semibold text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]"
              >
                {chapter}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
