import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { useCms } from "./ContentProvider";
import type { CmsPageKey } from "./types";

export function PageExtras({ page, tone = "ivory" }: { page: CmsPageKey; tone?: "ivory" | "white" }) {
  const { content } = useCms();
  const sections = content.extras[page] ?? [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section, index) => {
        const sectionTone = (index + (tone === "white" ? 1 : 0)) % 2 === 0 ? "white" : "ivory";
        return (
          <Section key={section.id} tone={sectionTone}>
            <Container>
              {section.type === "cta" ? (
                <Card size="lg" tone="ivory" title={section.title} description={section.description}>
                  {section.buttons?.length ? (
                    <div className="flex flex-wrap gap-3">
                      {section.buttons.map((button) => (
                        <Button key={button.to + button.label} asChild variant="outline">
                          <Link to={button.to}>{button.label}</Link>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </Card>
              ) : (
                <>
                  <SectionTitle eyebrow={section.eyebrow} title={section.title} description={section.description} />
                  {section.type === "carousel" && section.slides?.length ? (
                    <div className="mt-8">
                      <ImageCarousel slides={section.slides} />
                    </div>
                  ) : null}
                  {section.type === "photoGrid" && section.slides?.length ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.slides.map((slide) => (
                        <FramedPhoto
                          key={slide.src}
                          src={slide.src}
                          alt={slide.alt}
                          fit="contain"
                          imgClassName="h-56 w-full bg-[var(--ipf-navy)] sm:h-64"
                        />
                      ))}
                    </div>
                  ) : null}
                  {section.type === "richText" && section.body ? (
                    <p className="mt-6 max-w-3xl text-sm leading-8 text-[var(--ipf-muted)] sm:text-base">{section.body}</p>
                  ) : null}
                </>
              )}
            </Container>
          </Section>
        );
      })}
    </>
  );
}
