import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { testimonials } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function TestimonialsPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.testimonials.title")} />
      <PageHero
        eyebrow={t("page.testimonials.eyebrow")}
        title={t("page.testimonials.title")}
        description={t("page.testimonials.desc")}
        crumbs={[{ label: t("page.testimonials.title") }]}
      />
      {testimonials.map((group, index) => (
        <Section key={group.group} tone={index % 2 === 0 ? "white" : "ivory"}>
          <Container>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{group.group}</h2>
            <div className="mt-8">
              <ImageCarousel
                slides={group.items.map((item) => ({ src: item.image, alt: item.title, caption: item.title }))}
                heightClass="aspect-[4/3] h-auto max-h-[70vh] w-full"
              />
            </div>
          </Container>
        </Section>
      ))}
    </>
  );
}
