import { Link, useParams } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { ChapterJourneyHero } from "../components/ChapterJourneyHero";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { chapterPath, emirateChapterOrder, getChapter } from "../data/orgNav";
import { chapters } from "../data/platformContent";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import NotFoundPage from "./NotFoundPage";
import { chapterTheme } from "../data/orgThemes";
import type { CSSProperties } from "react";

export default function ChapterPage() {
  const { t } = useLocale();
  const { chapterId = "" } = useParams();
  const chapter = getChapter(chapterId);
  if (!chapter) return <NotFoundPage />;

  const email = chapter.email ?? site.email;
  const theme = chapterTheme(chapter.id);
  const pageStyle = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;
  const note = t(`page.chapter.note.${chapter.id}`);
  const peers = emirateChapterOrder
    .map((id) => chapters.find((item) => item.id === id))
    .filter((item): item is (typeof chapters)[number] => Boolean(item && item.id !== chapter.id));

  return (
    <div className={`chapter-theme-page org-motion-${theme.motion}`} style={pageStyle}>
      <DocumentTitle title={chapter.name} />
      <ChapterJourneyHero
        id={chapter.id}
        title={chapter.name}
        description="Connecting the local community through welfare, culture and service."
        theme={theme}
      />
      <Section tone="white" className="chapter-theme-section chapter-theme-section--story">
        <Container className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)]">
            <p>{t("page.chapter.intro", { name: chapter.name })}</p>
            <p>{note}</p>
            <p>{t("page.chapter.workLead")}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t("page.chapter.work1")}</li>
              <li>{t("page.chapter.work2")}</li>
              <li>{t("page.chapter.work3")}</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <a href={`mailto:${email}`}>{t("page.council.writeDesk")}</a>
              </Button>
              <Button asChild variant="outline">
                <a href={chapter.facebook} target="_blank" rel="noreferrer">
                  {t("common.facebook")}
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/membership">{t("nav.membership")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/events">{t("nav.events")}</Link>
              </Button>
            </div>
          </div>
          <aside className="space-y-5">
            <Card tone="ivory" title={t("page.council.contactTitle")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.chapter.contactBody")}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{site.office}</p>
              <p className="mt-3 text-sm">
                <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
              <p className="mt-3 text-sm">
                <a className="font-semibold text-[var(--ipf-green)]" href={chapter.facebook} target="_blank" rel="noreferrer">
                  {t("common.facebook")}
                </a>
              </p>
            </Card>
            <Card tone="ivory" title={t("page.council.officersTitle")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.chapter.officersEmpty")}</p>
              <p className="mt-3 text-sm">
                <Link className="font-semibold text-[var(--ipf-green)]" to="/leadership">
                  {t("nav.leadership")}
                </Link>
              </p>
            </Card>
          </aside>
        </Container>
      </Section>
      <Section className="chapter-theme-section chapter-theme-section--network">
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.chapter.other")}</h2>
          <CardGrid columns={4}>
            {peers.map((item) => (
              <Card key={item.id} size="sm" tone="ivory" to={chapterPath(item.id)} title={item.name} />
            ))}
          </CardGrid>
          <p className="text-sm">
            <Link className="font-semibold text-[var(--ipf-navy)]" to="/chapters">
              {t("nav.viewAll")}
            </Link>
          </p>
        </Container>
      </Section>
    </div>
  );
}
