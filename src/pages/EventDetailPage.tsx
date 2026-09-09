import { Link, useParams } from "react-router-dom";
import { EventRsvp } from "../components/EventRsvp";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { eventEmirates, isUpcomingEvent } from "../data/eventCatalog";
import { usePublicEvent } from "../hooks/usePublicEvents";
import { useLocale } from "../i18n/LocaleProvider";
import { PageLoader } from "../components/layout/PageLoader";
import NotFoundPage from "./NotFoundPage";

export default function EventDetailPage() {
  const { t } = useLocale();
  const { eventId = "" } = useParams();
  const { event, ready, memberCount, volunteerCount } = usePublicEvent(eventId);
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
            {event.location ? <p className="mt-2 text-sm text-[var(--ipf-muted)]">{event.location}{emirate ? ` · ${emirate}` : ""}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[var(--ipf-ivory)] px-2.5 py-1 text-[var(--ipf-navy)]">{event.category}</span>
              {upcoming ? null : (
                <span className="rounded-full bg-[var(--ipf-navy)] px-2.5 py-1 text-white">{t("page.events.past")}</span>
              )}
              {event.isFree ? (
                <span className="rounded-full bg-[var(--ipf-green)]/10 px-2.5 py-1 text-[var(--ipf-green)]">{t("page.events.free")}</span>
              ) : null}
            </div>
            {event.body ? <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">{event.body}</p> : null}
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
    </>
  );
}
