import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChapterMap } from "../components/ChapterMap";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { chapterPath, getChapter } from "../data/orgNav";
import { chapters } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function ChaptersPage() {
  const { t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && getChapter(id)) navigate(chapterPath(id), { replace: true });
  }, [location.hash, navigate]);

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
              <Card
                id={chapter.id}
                key={chapter.id}
                className="scroll-mt-28"
                tone="ivory"
                title={chapter.name}
                description={t(`page.chapter.note.${chapter.id}`)}
                to={chapterPath(chapter.id)}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
