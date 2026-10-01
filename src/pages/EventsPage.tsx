import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "../components/EventCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { PillNav } from "../components/ui/Tabs";
import { eventCategories, eventEmirates } from "../data/eventCatalog";
import { galleryNavItems } from "../data/galleryNav";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useCms } from "../cms/ContentProvider";
import { PageExtras } from "../cms/PageExtras";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

const GALLERY_PAGE_SIZE = 12;

export default function EventsPage() {
  const { t } = useLocale();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "past" ? "past" : "upcoming";
  const category = params.get("category") || "All";
  const emirate = params.get("emirate") || "";
  const free = params.get("free") === "1";
  const { events, ready, hasMore, loadingMore, loadMore } = usePublicEvents({ tab, category, emirate, free });
  const { content } = useCms();
  const [galleryPage, setGalleryPage] = useState(1);

  const galleryPageCount = Math.max(1, Math.ceil(content.galleryImages.length / GALLERY_PAGE_SIZE));
  const galleryPageItems = useMemo(
    () => content.galleryImages.slice((galleryPage - 1) * GALLERY_PAGE_SIZE, galleryPage * GALLERY_PAGE_SIZE),
    [content.galleryImages, galleryPage],
  );

  function setFilter(next: Record<string, string | null>) {
    const copy = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) copy.delete(key);
      else copy.set(key, value);
    }
    setParams(copy, { replace: true });
  }

  function goToGalleryPage(page: number) {
    setGalleryPage(Math.min(Math.max(page, 1), galleryPageCount));
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
        </Container>
      </Section>

      {/* Horizontally scrollable row (native scroll-snap, no carousel library needed) — fits
          about 6 cards on a wide desktop, narrows naturally on tablet/mobile, swipeable by touch. */}
      <Section tone="ivory" className="py-8 sm:py-10">
        <Container className="max-w-[1600px]">
          <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3">
            {events.map((event) => (
              <div key={event.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                <EventCard event={event} />
              </div>
            ))}
          </div>
          {ready && events.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--ipf-muted)]">
              {tab === "past" ? t("page.events.emptyPast") : t("page.events.emptyUpcoming")}
            </p>
          ) : null}
          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <Button type="button" variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more events"}
              </Button>
            </div>
          ) : null}
        </Container>
      </Section>

      {content.galleryImages.length > 0 ? (
        <Section id="ipf-gallery" tone="white" className="scroll-mt-28 py-10 sm:py-14">
          <Container>
            <SectionTitle eyebrow={t("page.gallery.eyebrow")} title={t("page.gallery.title")} description={t("page.gallery.desc")} />
            <div className="mt-5">
              <PillNav items={galleryNavItems.map((item) => ({ to: item.to, label: t(item.key) }))} />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleryPageItems.map((item, index) => (
                <figure key={`${item.src}-${index}`} className="min-w-0 overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(11,31,58,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(11,31,58,0.14)]">
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                </figure>
              ))}
            </div>
            {galleryPageCount > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToGalleryPage(galleryPage - 1)}
                  disabled={galleryPage === 1}
                  className="flex size-9 items-center justify-center rounded-lg border border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: galleryPageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToGalleryPage(page)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg text-sm font-semibold",
                      page === galleryPage ? "bg-[var(--ipf-navy)] text-white" : "border border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]",
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToGalleryPage(galleryPage + 1)}
                  disabled={galleryPage === galleryPageCount}
                  className="flex size-9 items-center justify-center rounded-lg border border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </Container>
        </Section>
      ) : null}
      <PageExtras page="events" />
    </>
  );
}
