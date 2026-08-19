import { ChapterMap } from "../components/ChapterMap";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { chapters } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function ChaptersPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.chapters")} />
      <PageHero
        eyebrow={t("page.chapters.eyebrow")}
        title={t("page.chapters.title")}
        description={t("page.chapters.desc")}
        crumbs={[{ label: t("nav.chapters") }]}
      />
      <Section tone="white">
        <Container className="space-y-10">
          <ChapterMap />
          <CardGrid columns={2}>
            {chapters.map((chapter) => (
              <Card id={chapter.id} key={chapter.id} className="scroll-mt-28" tone="ivory" title={chapter.name} description={chapter.note}>
                <div className="flex flex-wrap gap-4 text-sm">
                  {chapter.email ? (
                    <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${chapter.email}`}>
                      {chapter.email}
                    </a>
                  ) : null}
                  <a className="font-semibold text-[var(--ipf-green)]" href={chapter.facebook} target="_blank" rel="noreferrer">
                    {t("common.facebook")}
                  </a>
                </div>
              </Card>
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
