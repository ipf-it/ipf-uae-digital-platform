import { Link } from "react-router-dom";
import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { glimpseStories } from "../data/platformContent";

export default function GalleryPage() {
  const { content } = useCms();
  const slides = content.galleryImages.map((item) => ({ src: item.src, alt: item.alt, caption: item.alt }));

  return (
    <>
      <DocumentTitle title="Glimpses of IPF UAE" />
      <PageHero
        eyebrow="Gallery"
        title="Glimpses of IPF UAE"
        description="Photographs and highlights from chapter events, office inauguration, welfare drives and community outreach."
        crumbs={[{ label: "Gallery" }]}
      />
      <Section tone="white">
        <Container>
          <div className="mb-8 flex flex-wrap gap-3 text-sm">
            <Link className="border border-[var(--ipf-navy)] px-4 py-2 font-semibold text-[var(--ipf-navy)]" to="/gallery">
              Glimpses
            </Link>
            <Link className="border border-[var(--ipf-line)] px-4 py-2 text-[var(--ipf-muted)]" to="/discover-india">
              Discover India
            </Link>
            <Link className="border border-[var(--ipf-line)] px-4 py-2 text-[var(--ipf-muted)]" to="/explore-uae">
              Explore UAE
            </Link>
          </div>
          <ImageCarousel
            slides={slides}
            framed
            fit="contain"
            heightClass="h-[260px] sm:h-[400px] lg:h-[480px]"
          />
          <div className="mb-10 mt-10 grid gap-5 lg:grid-cols-3">
            {glimpseStories.map((story) => (
              <Link key={story.title} to={story.to} className="min-w-0 bg-[var(--ipf-ivory)] hover:opacity-95">
                <FramedPhoto
                  src={story.image}
                  alt={story.title}
                  fit="contain"
                  imgClassName="h-52 w-full bg-[var(--ipf-navy)]"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{story.date}</p>
                  <h2 className="mt-2 text-lg font-bold text-[var(--ipf-navy)]">{story.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--ipf-muted)]">{story.text}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.galleryImages.map((item) => (
              <figure key={item.src} className="min-w-0">
                <FramedPhoto
                  src={item.src}
                  alt={item.alt}
                  fit="contain"
                  loading="lazy"
                  imgClassName="h-56 w-full bg-[var(--ipf-navy)]"
                />
                <figcaption className="px-3 py-3 text-xs text-[var(--ipf-muted)]">{item.alt}</figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>
      <PageExtras page="gallery" />
    </>
  );
}
