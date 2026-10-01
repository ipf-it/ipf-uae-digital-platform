import { Link, useParams } from "react-router-dom";
import { EventRsvp } from "../components/EventRsvp";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { eventEmirates, isUpcomingEvent } from "../data/eventCatalog";
import { usePublicEvent } from "../hooks/usePublicEvents";
import { useEventSponsors } from "../hooks/useSponsors";
import { useLocale } from "../i18n/LocaleProvider";
import { PageLoader } from "../components/layout/PageLoader";
import NotFoundPage from "./NotFoundPage";

export default function EventDetailPage() {
  const { t } = useLocale();
  const { eventId = "" } = useParams();
  const { event, ready, memberCount, volunteerCount } = usePublicEvent(eventId);
  const { sponsors } = useEventSponsors(eventId);
  if (!ready) return <PageLoader />;
  if (!event) return <NotFoundPage />;

  const emirate = eventEmirates.find((item) => item.id === event.emirate)?.label;
  const upcoming = isUpcomingEvent(event);

  return (
    <>
      <DocumentTitle title={event.title} />
      <PageHero
        eyebrow={event.category}
        title={event.title}
        description={event.body || t("page.events.desc")}
        crumbs={[{ label: t("page.events.title"), to: "/events" }, { label: event.title }]}
        image={event.image}
      />
      <Section tone="white">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{event.date}</p>
            {event.location ? (
              <p className="mt-2 text-sm text-[var(--ipf-muted)]">
                {event.location}
                {emirate ? ` · ${emirate}` : ""}
                {event.venueMapUrl ? (
                  <>
                    {" · "}
                    <a className="font-semibold text-[var(--ipf-navy)]" href={event.venueMapUrl} target="_blank" rel="noreferrer">
                      {t("page.events.viewMap")}
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[var(--ipf-ivory)] px-2.5 py-1 text-[var(--ipf-navy)]">{event.category}</span>
              {upcoming ? null : (
                <span className="rounded-full bg-[var(--ipf-navy)] px-2.5 py-1 text-white">{t("page.events.past")}</span>
              )}
              {event.isFree ? (
                <span className="rounded-full bg-[var(--ipf-green)]/10 px-2.5 py-1 text-[var(--ipf-green)]">{t("page.events.free")}</span>
              ) : null}
              {event.capacity ? (
                <span className="rounded-full bg-[var(--ipf-ivory)] px-2.5 py-1 text-[var(--ipf-navy)]">{t("page.events.capacity", { count: event.capacity })}</span>
              ) : null}
            </div>
            {event.body ? <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">{event.body}</p> : null}
            {event.registrationUrl ? (
              <Button asChild className="mt-4">
                <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                  {t("page.events.register")}
                </a>
              </Button>
            ) : null}
            {event.eventContact ? (
              <p className="mt-3 text-sm text-[var(--ipf-muted)]">
                {t("page.events.contactLabel")} {event.eventContact}
              </p>
            ) : null}
            <EventRsvp
              eventId={event.id}
              title={event.title}
              date={event.startsAt || event.date}
              startsAt={event.startsAt}
              location={event.location}
              body={event.body}
              memberCount={memberCount}
              volunteerCount={volunteerCount}
            />
            <p className="mt-6 text-sm">
              <Link className="font-semibold text-[var(--ipf-navy)]" to="/events">
                {t("page.events.viewAll")}
              </Link>
            </p>
          </div>
          {event.slides.length > 0 ? (
            <ImageCarousel slides={event.slides} heightClass="aspect-[4/3] h-auto w-full" />
          ) : null}
        </Container>
      </Section>
      {sponsors.length > 0 ? (
        <Section tone="ivory">
          <Container>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{t("page.sponsors.eventEyebrow")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              {sponsors.map((sponsor) =>
                sponsor.website ? (
                  <a key={sponsor.id} href={sponsor.website} target="_blank" rel="noreferrer" title={sponsor.name}>
                    {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} className="h-12 object-contain" loading="lazy" decoding="async" /> : <span className="font-semibold text-[var(--ipf-navy)]">{sponsor.name}</span>}
                  </a>
                ) : (
                  <span key={sponsor.id} title={sponsor.name}>
                    {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} className="h-12 object-contain" loading="lazy" decoding="async" /> : <span className="font-semibold text-[var(--ipf-navy)]">{sponsor.name}</span>}
                  </span>
                ),
              )}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
