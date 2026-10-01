import { Link } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card, CardGrid } from "./ui/Card";
import { Container } from "./ui/Container";
import { FitImage } from "./ui/FitImage";
import { ImageCarousel } from "./ui/ImageCarousel";
import { Section } from "./ui/Section";
import { SectionTitle } from "./ui/SectionTitle";
import { FramedPhoto } from "./ui/TricolorFrame";
import { usePageSections, type PageSection } from "../hooks/usePageSections";

/** Renders one page's live, admin-managed content blocks — the generalisation of the old
 * src/cms/PageExtras.tsx (same six-branch shape, now relational, per-locale, and able to compose a
 * whole page rather than only append below one). A page keeps any bespoke hero/breadcrumb of its
 * own and renders this in place of what used to be hardcoded JSX. */
export function PageSectionRenderer({ pageId, startTone = "white" }: { pageId: string; startTone?: "white" | "ivory" }) {
  const { sections } = usePageSections(pageId);
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section, index) => {
        const tone = (index + (startTone === "ivory" ? 1 : 0)) % 2 === 0 ? "white" : "ivory";
        return <PageSectionBlock key={section.id} section={section} tone={tone} imageFirst={index % 2 === 1} />;
      })}
    </>
  );
}

function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function bulletLines(body: string) {
  return body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function PageSectionBlock({ section, tone, imageFirst }: { section: PageSection; tone: "white" | "ivory"; imageFirst: boolean }) {
  if (section.type === "cta") {
    return (
      <Section tone={tone}>
        <Container>
          <Card size="lg" tone="ivory" title={section.title} description={section.description}>
            {section.buttons.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {section.buttons.map((button) => (
                  <Button key={button.to + button.label} asChild variant="outline">
                    <Link to={button.to}>{button.label}</Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </Card>
        </Container>
      </Section>
    );
  }

  if (section.type === "imageText") {
    return (
      <Section tone={tone}>
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className={imageFirst ? "lg:order-2" : undefined}>
            {section.title ? <SectionTitle eyebrow={section.eyebrow} title={section.title} description={section.description} /> : null}
            <div className="mt-4 space-y-2 text-sm leading-7 text-[var(--ipf-muted)] sm:text-base">
              {bulletLines(section.body).some((line) => line.startsWith("• ")) ? (
                <ul className="space-y-2">
                  {bulletLines(section.body).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                paragraphs(section.body).map((para, i) => <p key={i}>{para}</p>)
              )}
            </div>
          </div>
          {section.image ? <FitImage className={imageFirst ? "lg:order-1" : undefined} src={section.image} alt={section.title || ""} /> : null}
        </Container>
      </Section>
    );
  }

  if (section.type === "statList") {
    const hasValues = section.stats.some((item) => item.value?.trim());
    return (
      <Section tone={tone}>
        <Container className={section.image ? "grid gap-8 lg:grid-cols-2 lg:items-center" : undefined}>
          <div className={section.image && imageFirst ? "lg:order-2" : undefined}>
            <SectionTitle eyebrow={section.eyebrow} title={section.title} description={section.description} />
            {hasValues ? (
              <CardGrid columns={2} className="mt-6">
                {section.stats.map((item, i) => (
                  <Card key={i} size="sm" tone="ivory" eyebrow={`0${i + 1}`.slice(-2)} title={item.value} description={item.label} />
                ))}
              </CardGrid>
            ) : (
              <ul className="mt-5 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
                {section.stats.map((item, i) => (
                  <li key={i}>• {item.label}</li>
                ))}
              </ul>
            )}
          </div>
          {section.image ? <FitImage className={imageFirst ? "lg:order-1" : undefined} fit="contain" src={section.image} alt={section.title || ""} /> : null}
        </Container>
      </Section>
    );
  }

  return (
    <Section tone={tone}>
      <Container>
        <SectionTitle eyebrow={section.eyebrow} title={section.title} description={section.description} />
        {section.type === "carousel" && section.slides.length > 0 ? (
          <div className="mt-8">
            <ImageCarousel slides={section.slides} />
          </div>
        ) : null}
        {section.type === "photoGrid" && section.slides.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.slides.map((slide, i) => (
              <FramedPhoto key={i} src={slide.src} alt={slide.alt} fit="cover" imgClassName="h-56 w-full sm:h-64" />
            ))}
          </div>
        ) : null}
        {section.type === "richText" && section.body ? (
          <div className="mt-6 max-w-3xl space-y-2 text-sm leading-7 text-[var(--ipf-muted)] sm:text-base">
            {bulletLines(section.body).some((line) => line.startsWith("• ")) ? (
              <ul className="space-y-2">
                {bulletLines(section.body).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              paragraphs(section.body).map((para, i) => <p key={i}>{para}</p>)
            )}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
