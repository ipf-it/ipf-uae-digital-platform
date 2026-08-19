import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { PillNav } from "../components/ui/Tabs";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { galleryNavItems } from "../data/galleryNav";
import { glimpseStories } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function GalleryPage() {
  const { t } = useLocale();
  const { content } = useCms();
  const slides = content.galleryImages.map((item) => ({ src: item.src, alt: item.alt, caption: item.alt }));

  return (
    <>
      <DocumentTitle title={t("page.gallery.title")} />
      <PageHero
        eyebrow={t("page.gallery.eyebrow")}
        title={t("page.gallery.title")}
        description={t("page.gallery.desc")}
        crumbs={[{ label: t("nav.gallery") }]}
      />
      <Section tone="white">
        <Container>
          <div className="mb-8">
            <PillNav items={galleryNavItems.map((item) => ({ to: item.to, label: t(item.key) }))} />
          </div>
          <ImageCarousel
            slides={slides}
            framed
            fit="contain"
            heightClass="h-[260px] sm:h-[400px] lg:h-[480px]"
          />
          <CardGrid className="mb-10 mt-10">
            {glimpseStories.map((story, index) => {
              const n = index + 1;
              return (
                <Card
                  key={story.to + n}
                  to={story.to}
                  tone="ivory"
                  eyebrow={story.date}
                  title={t(`page.gallery.s${n}Title`)}
                  description={t(`page.gallery.s${n}Text`)}
                  image={story.image}
                  imageAlt={t(`page.gallery.s${n}Title`)}
                  imageFit="contain"
                />
              );
            })}
          </CardGrid>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.galleryImages.map((item) => (
              <figure key={item.src} className="min-w-0">
                <FramedPhoto
                  src={item.src}
                  alt={item.alt}
                  fit="contain"
                  loading="lazy"
                  imgClassName="h-64 w-full bg-[var(--ipf-navy)] sm:h-56"
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
