import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { eventCalendar } from "../data/platformContent";

export default function EventsPage() {
  const { content } = useCms();

  return (
    <>
      <DocumentTitle title="Events Calendar" />
      <PageHero
        eyebrow="Resources"
        title="Events Calendar"
        description="IPF's annual community programme cycle — cultural days, national commemorations, health awareness and chapter celebrations across the UAE."
        crumbs={[{ label: "Resources", to: "/news" }, { label: "Events Calendar" }]}
      />
      {content.eventHighlights.map((event) => (
        <Section key={event.id} tone="white">
          <Container className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">{event.date}</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">{event.title}</h2>
              {event.location ? <p className="mt-2 text-sm text-[var(--ipf-muted)]">{event.location}</p> : null}
              {event.body ? <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">{event.body}</p> : null}
            </div>
            {event.slides.length > 0 ? <ImageCarousel slides={event.slides} heightClass="h-[220px] sm:h-[320px]" /> : null}
          </Container>
        </Section>
      ))}
      <Section>
        <Container>
          <p className="mb-6 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Standing annual cycle. Dated programmes with photographs are added from the content desk as events take place.
          </p>
          <div className="overflow-x-auto">
            <table className="ipf-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Programme</th>
                  <th>Level</th>
                  <th>Committee</th>
                </tr>
              </thead>
              <tbody>
                {eventCalendar.map((event) => (
                  <tr key={`${event.month}-${event.title}`}>
                    <td>{event.month}</td>
                    <td>{event.title}</td>
                    <td>{event.level}</td>
                    <td>{event.committee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
      <PageExtras page="events" />
    </>
  );
}
