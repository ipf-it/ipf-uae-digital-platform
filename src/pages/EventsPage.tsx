import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "../components/EventCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
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

      {/* ──────────────── 1 · HERO — approved Indian Cultural Festival
         watercolour as the full-width background via IllustratedHero.
         Matches the hero system now used on /about, /history,
         /leadership, /yuva and /support. Previous burgundy PageHero
         card with upcoming/past tab buttons is retired; the tabs now
         live in the Events section below. */}
      <IllustratedHero
        eyebrow={t("page.events.calendar")}
        title={t("page.events.title")}
        description={t("page.events.desc")}
        crumbs={[{ label: t("page.events.title") }]}
        artworkPng="/images/events/events-hero-cultural.png"
        artworkWebp="/images/events/events-hero-cultural.webp"
        artworkAlt="Watercolour illustration of an Indian cultural festival in the UAE — dancers, Indian flag, IPF stage, community and the Dubai skyline"
        /* Ivory negative-space zone sits on the LEFT of the source;
           dancers / flag / stage / audience from ~25% rightward. Image
           pinned left so the ivory stays beneath the text column. */
        artworkPosition="object-[0%_center]"
        textMaxWidth="max-w-[320px] md:max-w-[320px] lg:max-w-[300px] xl:max-w-[300px]"
      />

      {/* ──────────────── 2 · FEATURED IPF VIDEO ──────────────── */}
      <Section tone="ivory" className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-[#D6AD60]/60" />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#8B6A1F]">
                IPF in Action
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10 bg-[#D6AD60]/60" />
            </div>
            <h2 className="mt-4 font-serif text-[1.7rem] font-bold leading-tight tracking-tight text-[var(--ipf-navy)] sm:text-[2rem] lg:text-[2.2rem]">
              Celebrating community, culture and service.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-[#1c2430]">
              A short film of recent IPF mega-events — cultural
              programmes, community gatherings and welfare initiatives
              across the Emirates.
            </p>
          </div>

          <figure className="mx-auto mt-10 max-w-[1120px] overflow-hidden rounded-2xl shadow-[0_14px_38px_rgba(11,31,58,0.14)] ring-1 ring-[#D6AD60]/25 sm:mt-12 sm:rounded-[1.75rem]">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/hero/ipf-uae-hero-desktop-poster.webp"
              className="block aspect-video w-full bg-[#0b1f3a]"
            >
              <source src="/hero/ipf-uae-hero-desktop.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </figure>
        </Container>
      </Section>

      {/* ──────────────── 3 · EVENTS — tabs + filters + grid ──────── */}
      <Section tone="white" className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-[#D6AD60]/60" />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#8B6A1F]">
                Events
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10 bg-[#D6AD60]/60" />
            </div>
            <h2 className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight text-[var(--ipf-navy)] sm:text-[1.85rem] lg:text-[2.05rem]">
              Events that bring our community together.
            </h2>
          </div>

          {/* Tab switcher (upcoming / past) — now inline inside the
             Events section rather than inside the hero. */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link
              to="/events?tab=upcoming"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] font-semibold transition",
                tab === "upcoming"
                  ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-white"
                  : "border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]",
              )}
            >
              <CalendarDays className="size-4" />
              {t("page.events.upcoming")}
            </Link>
            <Link
              to="/events?tab=past"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] font-semibold transition",
                tab === "past"
                  ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-white"
                  : "border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]",
              )}
            >
              <Clock className="size-4" />
              {t("page.events.past")}
            </Link>
          </div>
        </Container>
      </Section>
      {/* Filters + event grid (continuation of Events section). The
         grid replaces the previous horizontal snap-scroll row so every
         published event is visible on this page (the homepage
         deliberately shows only the first 6 via HomeEvents). Desktop 3
         cols, tablet 2, mobile 1 — all events from usePublicEvents
         (same source as the homepage, so nothing is missing). */}
      <Section tone="white" className="py-6 sm:py-8">
        <Container>
          <div className="flex flex-wrap gap-2">
            {["All", ...eventCategories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter({ category: item === "All" ? null : item })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
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
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
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
            <p className="mt-6 text-center text-sm text-[var(--ipf-muted)]">
              {tab === "past" ? t("page.events.emptyPast") : t("page.events.emptyUpcoming")}
            </p>
          ) : null}
          {hasMore ? (
            <div className="mt-10 flex justify-center">
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
