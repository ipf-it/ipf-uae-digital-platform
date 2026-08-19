import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { EventRsvp } from "../components/EventRsvp";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { Section } from "../components/ui/Section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { eventCalendar } from "../data/platformContent";
import { downloadIcs } from "../lib/ics";

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
              <EventRsvp
                eventId={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                body={event.body}
              />
            </div>
            {event.slides.length > 0 ? (
              <ImageCarousel slides={event.slides} heightClass="aspect-[4/3] h-auto w-full" />
            ) : null}
          </Container>
        </Section>
      ))}
      <Section>
        <Container>
          <p className="mb-6 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Standing annual cycle. Dated programmes with photographs are added from the content desk as events take place.
          </p>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Month</TableHeader>
                <TableHeader>Programme</TableHeader>
                <TableHeader>Level</TableHeader>
                <TableHeader>Committee</TableHeader>
                <TableHeader>Attend</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {eventCalendar.map((event) => (
                <TableRow key={`${event.month}-${event.title}`}>
                  <TableCell className="font-medium text-[var(--ipf-navy)]">{event.month}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.level}</TableCell>
                  <TableCell>{event.committee}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadIcs({ title: event.title, month: event.month })}
                    >
                      Calendar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Container>
      </Section>
      <PageExtras page="events" />
    </>
  );
}
