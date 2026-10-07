import { Link, useParams } from "react-router-dom";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { ChapterCommittee } from "../components/ChapterCommittee";
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
import type { CSSProperties, ReactNode } from "react";

/* ───────────────────────────────────────────────────────────────────────
 * ChapterPage — canonical IPF UAE 2026 chapter detail-page architecture.
 *
 * ONE page component drives every active chapter. Each section is
 * data-aware and hides itself when the chapter has no published content
 * for that section — no fake empty states, no fabricated data, no
 * giant empty sections.
 *
 * Section order (locked for every chapter)
 *   01  HERO                    — approved chapter artwork + identity
 *   02  ABOUT                   — tenant content.intro / highlights
 *   03  LEADERSHIP & COMMITTEE  — full-width portrait grid (≥10 ok)
 *   04  UPCOMING EVENTS         — chapter-scoped, published, future
 *   05  ACTIVITIES / INITIATIVES — tenant content (hidden if absent)
 *   06  LATEST UPDATES          — reserved; needs chapter-scoped news
 *                                  pipeline in a future Rockstar stage
 *   07  PAST EVENTS             — chapter-scoped, published, past
 *   08  GALLERY                 — tenant content.gallery
 *   09  CONNECT WITH THE CHAPTER — approved contact + membership CTA
 *   10  EXPLORE THE IPF NETWORK — peer chapters + councils + events
 *
 * Data boundaries
 *   Central Admin owns the structure (this file), the hero artwork
 *   catalogue, and the publication lifecycle.
 *   Chapter Admin owns tenant content, chapter-scoped events, chapter
 *   appointments, chapter gallery and approved public contact — all
 *   already modelled in the existing CMS tables + /api endpoints.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-px w-10 ${className}`}
      style={{ backgroundColor: `${GOLD}99` }}
    />
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3">
      <GoldRule />
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_INK }}>
        {children}
      </p>
      <GoldRule />
    </div>
  );
}

export default function ChapterPage() {
  const { t } = useLocale();
  const { chapterId = "" } = useParams();
  const { chapters, ready: chaptersReady } = useOrgChapters();
  const chapter = chapters.find((item) => item.id === chapterId);
  const { content: tenantContent } = useTenantContent("chapter", chapterId);
  const { stats } = useScopeStats("chapter", chapterId);
  const { events: upcomingEvents } = usePublicEvents({ tab: "upcoming", emirate: chapterId });
  const { events: pastEvents } = usePublicEvents({ tab: "past", emirate: chapterId });
  const { leadership: officers } = useLeadership("chapter", chapterId);

  // Computed from the URL param alone (chapterTheme falls back safely for
  // an unknown id) so the footer theme is correct immediately. Called
  // unconditionally, before the early returns below, per the rules of hooks.
  const theme = chapterTheme(chapterId);
  useSetPageTheme(theme);
  if (chaptersReady && !chapter) return <NotFoundPage />;
  if (!chapter) return null;

  const email = chapter.contactEmail || site.email;
  const pageStyle = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;
  const peers = chapters.filter((item) => item.id !== chapter.id);
  const highlights = (tenantContent?.highlights ?? []).filter(Boolean);
  const gallery = (tenantContent?.gallery ?? []).filter((item) => item.src);
  const introBody = tenantContent?.intro || chapter.description || t("page.chapter.intro", { name: chapter.name });

  return (
    <div className={`chapter-theme-page org-motion-${theme.motion}`} style={pageStyle}>
      <DocumentTitle title={`${chapter.name} Chapter — IPF UAE`} />

      {/* ─────────────── 01 · HERO ─────────────── */}
      <section
        aria-labelledby="chapter-hero-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        {/* Approved chapter artwork — background on md+ only. Rendered as
            a plain <img> straight from /theme/place-art/{slug}.webp so
            the shared PlaceThemeArt wrapper's absolute-positioning rules
            do not fight the hero layout. No filter, no tint, no crop
            beyond `object-cover` + `object-position`. */}
        <picture aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
          <img
            src={`/theme/place-art/${chapter.id}.webp`}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="block h-full w-full object-cover object-[75%_center]"
          />
        </picture>
        {/* Ivory wash on the left so dark navy typography stays readable
            over the artwork; fades to transparent by 60% of width so the
            chapter art remains fully visible on the right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,248,238,0.94) 0%, rgba(255,248,238,0.82) 32%, rgba(255,248,238,0.4) 50%, rgba(255,248,238,0) 60%)",
          }}
        />
        <Container className="relative">
          <div className="flex min-h-[380px] flex-col justify-center py-10 md:min-h-[460px] md:py-14 lg:min-h-[500px] lg:py-16">
            <div className="max-w-[500px]">
              <nav
                aria-label="Breadcrumb"
                className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#3f4a5e" }}
              >
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <li>
                    <Link to="/" className="transition hover:text-[var(--ipf-green)]">{t("nav.home")}</Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="size-3 opacity-50" aria-hidden="true" />
                    <Link to="/chapters" className="transition hover:text-[var(--ipf-green)]">{t("nav.chapters")}</Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="size-3 opacity-50" aria-hidden="true" />
                    <span style={{ color: NAVY }}>{chapter.name}</span>
                  </li>
                </ol>
              </nav>
              <div className="flex items-center gap-3">
                <GoldRule />
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD_INK }}>
                  IPF UAE Chapter
                </p>
              </div>
              <h1
                id="chapter-hero-heading"
                className="mt-4 font-serif text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-[2.5rem] lg:text-[2.9rem]"
                style={{ color: NAVY }}
              >
                {chapter.name} Chapter
              </h1>
              <p className="mt-5 max-w-[460px] text-[0.98rem] leading-relaxed sm:text-[1.02rem]" style={{ color: INK }}>
                {tenantContent?.tagline || `${theme.label} — IPF UAE's community programmes in ${chapter.name}.`}
              </p>
            </div>
          </div>
        </Container>
        {/* Mobile — approved artwork rendered inline as a figure below the
            text so the full composition remains recognisable without the
            desktop background crop. Original colours preserved. */}
        <figure className="mb-6 mt-2 overflow-hidden md:hidden">
          <img
            src={`/theme/place-art/${chapter.id}.webp`}
            alt={`${chapter.name} chapter watercolour composition`}
            loading="eager"
            decoding="async"
            className="block w-full"
          />
        </figure>
      </section>

      {/* ─────────────── 02 · ABOUT ─────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div>
            <SectionEyebrow>About {chapter.name}</SectionEyebrow>
            <h2
              className="mt-4 font-serif text-[1.65rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] lg:text-[2.15rem]"
              style={{ color: NAVY }}
            >
              Community programmes, grounded in {chapter.name}.
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed" style={{ color: INK }}>
              {introBody}
            </p>
            {highlights.length > 0 ? (
              <ul className="mt-5 space-y-2 pl-5 text-[0.95rem] leading-relaxed" style={{ color: INK, listStyleType: "disc" }}>
                {highlights.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <aside className="rounded-[18px] bg-[#FFFDF8] p-6 shadow-[0_6px_20px_rgba(11,31,58,0.08)] ring-1 ring-black/5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD_INK }}>
              Chapter at a glance
            </p>
            <dl className="mt-4 space-y-3 text-[0.9rem]" style={{ color: INK }}>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold">Emirate</dt>
                <dd className="text-right" style={{ color: MUTED }}>{chapter.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold">Members</dt>
                <dd className="text-right" style={{ color: MUTED }}>{stats.memberCount}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold">Volunteers</dt>
                <dd className="text-right" style={{ color: MUTED }}>{stats.volunteerCount}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold">Upcoming events</dt>
                <dd className="text-right" style={{ color: MUTED }}>{stats.upcomingEventCount}</dd>
              </div>
            </dl>
          </aside>
        </Container>
      </Section>

      {/* ─────────────── 03 · LEADERSHIP & COMMITTEE ─────────────── */}
      {officers.length > 0 ? (
        <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <SectionEyebrow>Chapter Leadership</SectionEyebrow>
              <h2
                className="mt-4 font-serif text-[1.65rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] lg:text-[2.15rem]"
                style={{ color: NAVY }}
              >
                The team behind IPF UAE {chapter.name}.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                The named office bearers and committee members approved for public display by IPF UAE.
              </p>
            </div>
            <div className="mt-10 lg:mt-12">
              <ChapterCommittee entries={officers} />
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
              Explore the wider governance of IPF UAE on the{" "}
              <Link className="font-semibold underline-offset-4 hover:underline" style={{ color: NAVY }} to="/leadership">
                {t("nav.leadership")}
              </Link>{" "}
              page.
            </p>
          </Container>
        </Section>
      ) : null}

      {/* ─────────────── 04 · UPCOMING EVENTS ─────────────── */}
      {upcomingEvents.length > 0 ? (
        <Section tone="white" className="py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow>Upcoming Events</SectionEyebrow>
                <h2
                  className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
                  style={{ color: NAVY }}
                >
                  What {chapter.name} is organising next.
                </h2>
              </div>
              <Link
                to={`/events?emirate=${chapter.id}`}
                className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--ipf-green)]"
                style={{ color: NAVY }}
              >
                All chapter events →
              </Link>
            </div>
            <ul role="list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 lg:mt-10">
              {upcomingEvents.slice(0, 6).map((event) => (
                <li key={event.id} className="min-w-0">
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* ─────────────── 05 · ACTIVITIES / INITIATIVES ───────────────
          No chapter-scoped activities pipeline exists yet; the section
          hides until Chapter admins can author "ongoing programmes" via
          CMS. Deliberately absent rather than falsely populated.         */}

      {/* ─────────────── 06 · LATEST UPDATES / NEWS ───────────────
          Reserved for the Rockstar stage once a chapter-scoped news feed
          exists. Globally scoped announcements already live at /news.    */}

      {/* ─────────────── 07 · PAST EVENTS ─────────────── */}
      {pastEvents.length > 0 ? (
        <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow>Past Events</SectionEyebrow>
                <h2
                  className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
                  style={{ color: NAVY }}
                >
                  Recent gatherings in {chapter.name}.
                </h2>
              </div>
              <Link
                to={`/events?emirate=${chapter.id}&tab=past`}
                className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--ipf-green)]"
                style={{ color: NAVY }}
              >
                Browse archive →
              </Link>
            </div>
            <ul role="list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 lg:mt-10">
              {pastEvents.slice(0, 6).map((event) => (
                <li key={event.id} className="min-w-0">
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* ─────────────── 08 · GALLERY ─────────────── */}
      {gallery.length > 0 ? (
        <Section tone="white" className="py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <SectionEyebrow>Chapter Gallery</SectionEyebrow>
              <h2
                className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
                style={{ color: NAVY }}
              >
                {chapter.name} in pictures.
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12">
              {gallery.slice(0, 6).map((item, index) => (
                <figure key={`${item.src}-${index}`} className="min-w-0">
                  <FramedPhoto
                    src={item.src}
                    alt={item.alt || chapter.name}
                    fit="contain"
                    loading="lazy"
                    imgClassName="h-56 w-full bg-[var(--ipf-navy)]"
                  />
                  {item.caption ? (
                    <figcaption className="mt-2 px-1 text-[0.78rem] leading-relaxed" style={{ color: MUTED }}>
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
            {gallery.length > 6 ? (
              <p className="mt-8 text-center">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--ipf-green)]"
                  style={{ color: NAVY }}
                >
                  View full gallery
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </p>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {/* ─────────────── 09 · CONNECT WITH THE CHAPTER ─────────────── */}
      <Section tone="ivory" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr,0.9fr] lg:items-center">
            <div>
              <SectionEyebrow>Connect with IPF {chapter.name}</SectionEyebrow>
              <h2
                className="mt-4 font-serif text-[1.65rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] lg:text-[2.15rem]"
                style={{ color: NAVY }}
              >
                Join the community, locally.
              </h2>
              <p className="mt-5 text-[0.98rem] leading-relaxed" style={{ color: INK }}>
                Become a member of IPF UAE and tell us {chapter.name} is your home chapter —
                you'll be invited to our local events, volunteer initiatives and cultural
                programmes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/membership">Join IPF UAE</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/events">{t("nav.events")}</Link>
                </Button>
              </div>
            </div>
            <aside className="rounded-[18px] bg-[#FFFDF8] p-6 shadow-[0_6px_20px_rgba(11,31,58,0.08)] ring-1 ring-black/5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD_INK }}>
                Chapter contact
              </p>
              <ul className="mt-4 space-y-3 text-[0.9rem]" style={{ color: INK }}>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 flex-none" aria-hidden="true" style={{ color: GOLD_INK }} />
                  <span>{site.office}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 flex-none" aria-hidden="true" style={{ color: GOLD_INK }} />
                  <a className="break-all font-semibold transition hover:text-[var(--ipf-green)]" href={`mailto:${email}`} style={{ color: NAVY }}>
                    {email}
                  </a>
                </li>
                {chapter.facebookUrl ? (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-4 flex-none items-center justify-center text-[0.8rem] font-bold" aria-hidden="true" style={{ color: GOLD_INK }}>
                      f
                    </span>
                    <a
                      className="font-semibold transition hover:text-[var(--ipf-green)]"
                      href={chapter.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: NAVY }}
                    >
                      Facebook
                    </a>
                  </li>
                ) : null}
              </ul>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ─────────────── 10 · EXPLORE THE IPF NETWORK ─────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>Explore IPF UAE</SectionEyebrow>
            <h2
              className="mt-4 font-serif text-[1.5rem] font-bold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[1.95rem]"
              style={{ color: NAVY }}
            >
              Other chapters across the Emirates.
            </h2>
          </div>
          <ul role="list" className="mx-auto mt-10 grid max-w-[1200px] grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-12 lg:grid-cols-6 lg:gap-4">
            {peers.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to={chapterPath(item.id)}
                  className="group flex h-full flex-col items-start gap-1 rounded-[14px] border border-[#D6AD60]/35 bg-[#FFFDF8] px-4 py-3 transition hover:border-[#D6AD60] hover:shadow-[0_8px_18px_rgba(11,31,58,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6AD60]"
                >
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD_INK }}>
                    Chapter
                  </span>
                  <span className="font-serif text-[0.95rem] font-bold leading-tight tracking-tight" style={{ color: NAVY }}>
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center">
            <Link
              to="/chapters"
              className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--ipf-green)]"
              style={{ color: NAVY }}
            >
              {t("nav.viewAll")}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </p>
        </Container>
      </Section>
    </div>
  );
}
