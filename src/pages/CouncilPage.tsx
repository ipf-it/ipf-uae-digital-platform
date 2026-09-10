import { Link, useParams } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { CommunityLandingHero } from "../components/CommunityLandingHero";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
import { StatPill } from "../components/ui/StatPill";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { useScopeStats } from "../hooks/useScopeStats";
import { useTenantContent } from "../hooks/useTenantContent";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useLeadership, useOrgCouncils } from "../hooks/useOrgDirectory";
import NotFoundPage from "./NotFoundPage";
import { councilTheme } from "../data/orgThemes";
import { CouncilJourneyHero } from "../components/CouncilJourneyHero";
import type { CSSProperties } from "react";

export default function CouncilPage() {
  const { t } = useLocale();
  const { councilId = "" } = useParams();
  const { councils, ready: councilsReady } = useOrgCouncils();
  const council = councils.find((item) => item.id === councilId);
  const { content: tenantContent } = useTenantContent("council", councilId);
  const { stats } = useScopeStats("council", councilId);
  const { events: upcomingEvents } = usePublicEvents({ tab: "upcoming", scopeType: "council", scopeId: councilId });
  const { leadership: officers } = useLeadership("council", councilId);
  if (councilsReady && !council) return <NotFoundPage />;
  if (!council) return null;

  const peers = councils.filter((item) => item.kind === council.kind && item.id !== council.id);
  const highlights = tenantContent?.highlights.filter(Boolean) ?? [];
  const intro =
    tenantContent?.intro ||
    council.description ||
    (council.kind === "state" ? t("page.council.stateIntro", { name: council.name, state: council.region }) : t("page.councils.specialBody"));
  const heroIntro = council.kind === "state"
    ? "Connecting our community through culture and service across the UAE."
    : "Focused community programmes connecting people across the UAE.";

  const theme = councilTheme(council.id, council.region);
  const pageStyle = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;
  return (
    <div className={`council-journey-page state-council-${council.id} council-motion-${theme.motion}`} data-state-council={council.kind === "state" ? council.id : undefined} data-cultural-motif={theme.motif} style={pageStyle}>
      <DocumentTitle title={council.name} />
      {council.kind === "state" ? <CouncilJourneyHero id={council.id} title={council.name} region={council.region} description={heroIntro} theme={theme} /> : <CommunityLandingHero id={council.id} eyebrow={t("nav.specialCouncils")} title={council.name} description={heroIntro} theme={theme} backTo="/councils" backLabel={t("nav.councils")} />}
      <Section tone="white" className="council-theme-section council-theme-section--story">
        <Container className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)]">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Members" value={String(stats.memberCount)} />
              <StatPill label="Volunteers" value={String(stats.volunteerCount)} />
              <StatPill label="Upcoming events" value={String(stats.upcomingEventCount)} />
            </div>
            <p>{intro}</p>
            <p>{t("page.council.workLead")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {highlights.length > 0 ? (
                highlights.map((line, index) => <li key={index}>{line}</li>)
              ) : council.kind === "state" ? (
                <>
                  <li>{t("page.council.stateWork1", { state: council.region })}</li>
                  <li>{t("page.council.stateWork2")}</li>
                  <li>{t("page.council.stateWork3")}</li>
                </>
              ) : (
                <li>{t("page.councils.specialBody")}</li>
              )}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <a href={`mailto:${council.contactEmail || site.email}`}>{t("page.council.writeDesk")}</a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/membership">{t("nav.membership")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/events">{t("nav.events")}</Link>
              </Button>
              {council.id === "business" ? (
                <Button asChild variant="outline">
                  <Link to="/jobs">{t("nav.jobs")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <aside className="space-y-5">
            <Card tone="ivory" title={t("page.council.contactTitle")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.council.contactBody")}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{site.office}</p>
              <p className="mt-3 text-sm">
                <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${council.contactEmail || site.email}`}>
                  {council.contactEmail || site.email}
                </a>
              </p>
            </Card>
            <Card tone="ivory" title={t("page.council.officersTitle")}>
              {officers.length > 0 ? (
                <div className="grid gap-3">
                  {officers.map((officer) => (
                    <PersonIdentity key={officer.id} src={officer.personImage} alt={officer.personName} name={officer.personName} role={officer.positionTitle} />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.council.officersEmpty")}</p>
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
        <Section tone="white" className="council-theme-section">
          <Container className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">What {council.name} is organising</h2>
            <CardGrid columns={3}>
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}
      <Section className="council-theme-section council-theme-section--network">
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.council.other")}</h2>
          <CardGrid columns={3}>
            {peers.map((item) => (
              <Card key={item.id} size="sm" tone="ivory" to={`/councils/${item.id}`} title={item.name} />
            ))}
          </CardGrid>
          <p className="text-sm">
            <Link className="font-semibold text-[var(--ipf-navy)]" to="/councils">
              {t("nav.viewAll")}
            </Link>
          </p>
        </Container>
      </Section>
    </div>
  );
}
