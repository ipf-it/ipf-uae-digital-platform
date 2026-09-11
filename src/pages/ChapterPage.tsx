import { Link, useParams } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { ChapterJourneyHero } from "../components/ChapterJourneyHero";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
import { StatPill } from "../components/ui/StatPill";
import { chapterPath } from "../data/orgNav";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { useScopeStats } from "../hooks/useScopeStats";
import { useTenantContent } from "../hooks/useTenantContent";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useLeadership, useOrgChapters } from "../hooks/useOrgDirectory";
import NotFoundPage from "./NotFoundPage";
import { chapterTheme } from "../data/orgThemes";
import { useSetPageTheme } from "../lib/PageTheme";
import type { CSSProperties } from "react";

export default function ChapterPage() {
  const { t } = useLocale();
  const { chapterId = "" } = useParams();
  const { chapters, ready: chaptersReady } = useOrgChapters();
  const chapter = chapters.find((item) => item.id === chapterId);
  const { content: tenantContent } = useTenantContent("chapter", chapterId);
  const { stats } = useScopeStats("chapter", chapterId);
  const { events: upcomingEvents } = usePublicEvents({ tab: "upcoming", emirate: chapterId });
  const { leadership: officers } = useLeadership("chapter", chapterId);
  // Computed from the URL param alone (chapterTheme() falls back safely for an unknown id) so the
  // footer picks up the right colour immediately, without waiting on the chapter list to load —
  // and called unconditionally, before the early returns below, per the rules of hooks.
  const theme = chapterTheme(chapterId);
  useSetPageTheme(theme);
  if (chaptersReady && !chapter) return <NotFoundPage />;
  if (!chapter) return null;

  const email = chapter.contactEmail || site.email;
  const pageStyle = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;
  const peers = chapters.filter((item) => item.id !== chapter.id);
  const highlights = tenantContent?.highlights.filter(Boolean) ?? [];

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
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Members" value={String(stats.memberCount)} />
              <StatPill label="Volunteers" value={String(stats.volunteerCount)} />
              <StatPill label="Upcoming events" value={String(stats.upcomingEventCount)} />
            </div>
            <p>{tenantContent?.intro || chapter.description || t("page.chapter.intro", { name: chapter.name })}</p>
            <p>{t("page.chapter.workLead")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {highlights.length > 0 ? (
                highlights.map((line, index) => <li key={index}>{line}</li>)
              ) : (
                <>
                  <li>{t("page.chapter.work1")}</li>
                  <li>{t("page.chapter.work2")}</li>
                  <li>{t("page.chapter.work3")}</li>
                </>
              )}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <a href={`mailto:${email}`}>{t("page.council.writeDesk")}</a>
              </Button>
              {chapter.facebookUrl ? (
                <Button asChild variant="outline">
                  <a href={chapter.facebookUrl} target="_blank" rel="noreferrer">
                    {t("common.facebook")}
                  </a>
                </Button>
              ) : null}
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
              {chapter.facebookUrl ? (
                <p className="mt-3 text-sm">
                  <a className="font-semibold text-[var(--ipf-green)]" href={chapter.facebookUrl} target="_blank" rel="noreferrer">
                    {t("common.facebook")}
                  </a>
                </p>
              ) : null}
            </Card>
            <Card tone="ivory" title={t("page.council.officersTitle")}>
              {officers.length > 0 ? (
                <div className="grid gap-3">
                  {officers.map((officer) => (
                    <PersonIdentity key={officer.id} src={officer.personImage} alt={officer.personName} name={officer.personName} role={officer.positionTitle} />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.chapter.officersEmpty")}</p>
              )}
              <p className="mt-3 text-sm">
                <Link className="font-semibold text-[var(--ipf-green)]" to="/leadership">
                  {t("nav.leadership")}
                </Link>
              </p>
            </Card>
          </aside>
        </Container>
      </Section>
      {upcomingEvents.length > 0 ? (
        <Section tone="white" className="chapter-theme-section">
          <Container className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">What {chapter.name} is organising</h2>
            <CardGrid columns={3}>
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}
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
