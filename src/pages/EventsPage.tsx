import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock } from "lucide-react";
import { EventCard } from "../components/EventCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { eventCategories, eventEmirates } from "../data/eventCatalog";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { PageExtras } from "../cms/PageExtras";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

export default function EventsPage() {
  const { t } = useLocale();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "past" ? "past" : "upcoming";
  const category = params.get("category") || "All";
  const emirate = params.get("emirate") || "";
  const free = params.get("free") === "1";
  const { events, ready, hasMore, loadingMore, loadMore } = usePublicEvents({ tab, category, emirate, free });

  function setFilter(next: Record<string, string | null>) {
    const copy = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) copy.delete(key);
      else copy.set(key, value);
    }
    setParams(copy, { replace: true });
  }

  return (
    <>
      <DocumentTitle title={t("page.events.title")} />
      <PageHero
        eyebrow={t("page.events.calendar")}
        title={t("page.events.title")}
        description={t("page.events.desc")}
        crumbs={[{ label: t("page.events.title") }]}
        image="/legacy-assets/images/gallery-7.jpg"
        actions={
          <>
            <Link
              to="/events?tab=upcoming"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
                tab === "upcoming" ? "bg-white text-[var(--ipf-navy)]" : "border border-white/40 bg-white/10 text-white",
              )}
            >
              <CalendarDays className="size-4" />
              {t("page.events.upcoming")}
            </Link>
            <Link
              to="/events?tab=past"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
                tab === "past" ? "bg-white text-[var(--ipf-navy)]" : "border border-white/40 bg-white/10 text-white",
              )}
            >
              <Clock className="size-4" />
              {t("page.events.past")}
            </Link>
          </>
        }
      />
      <Section tone="white" className="py-8 sm:py-10">
        <Container>
          <div className="flex flex-wrap gap-2">
            {["All", ...eventCategories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter({ category: item === "All" ? null : item })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
                  category === item
                    ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-white"
                    : "border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]",
                )}
              >
                {item === "All" ? t("page.events.all") : item}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={emirate}
              onChange={(event) => setFilter({ emirate: event.target.value || null })}
              className="h-11 rounded-lg border border-[var(--ipf-line)] bg-white px-3 text-sm text-[var(--ipf-navy)]"
              aria-label={t("page.events.emirate")}
            >
              {eventEmirates.map((item) => (
                <option key={item.id || "all"} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFilter({ free: free ? null : "1" })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
                free
                  ? "border-[var(--ipf-green)] bg-[var(--ipf-green)] text-white"
                  : "border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)]",
              )}
            >
              {t("page.events.free")}
            </button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {ready && events.length === 0 ? (
            <p className="mt-10 text-sm text-[var(--ipf-muted)]">
              {tab === "past" ? t("page.events.emptyPast") : t("page.events.emptyUpcoming")}
            </p>
          ) : null}
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button type="button" variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more events"}
              </Button>
            </div>
          ) : null}
        </Container>
      </Section>
      <PageExtras page="events" />
    </>
  );
}
