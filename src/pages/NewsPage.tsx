import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * NewsPage — IPF UAE News & Information Hub.
 *
 * Hero: founder-approved "Dubai Newsroom — Updates. Initiatives. Impact."
 * artwork displayed as the complete hero. The artwork ALREADY contains
 * the full editorial text (title, lede, section chips) so this page
 * deliberately does NOT render a second text overlay — doing so would
 * duplicate what is baked into the image. The <img> alt provides the
 * semantic equivalent for screen readers and search engines.
 *
 * Below the hero:
 *   • Featured story (first/latest published news item, lead-story
 *     editorial treatment with large image + category + summary)
 *   • Latest News (remaining items in a two-column editorial grid)
 *
 * Data source
 *   content.news from the CMS content provider, which currently falls
 *   back to src/data/platformContent.ts → newsItems (five seeded 2021
 *   articles). Announcements and Community Stories are referenced on
 *   the hero image but no dedicated content types exist yet in the DB
 *   or CMS — flagged for the Rockstar architecture phase so this page
 *   can host them without a redesign when they're added.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

export default function NewsPage() {
  const { t } = useLocale();
  const { content } = useCms();
  const items = content.news;
  const [featured, ...rest] = items;

  return (
    <>
      <DocumentTitle title={t("nav.news")} />

      {/* ──────────────── 1 · HERO ────────────────
         Full-width approved artwork. No overlay text (image already
         contains the hero copy). filter: none, opacity: 1. */}
      <section
        aria-labelledby="news-hero-img"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <picture className="block">
          <source srcSet="/images/news/news-hero.webp" type="image/webp" />
          <img
            id="news-hero-img"
            src="/images/news/news-hero.png"
            alt="Indian People's Forum UAE — News. Updates, Initiatives, Impact. Stay informed with the latest news, announcements and initiatives from the Indian People's Forum UAE — sharing stories of our community, our people and our progress."
            loading="eager"
            fetchPriority="high"
            width={2048}
            height={768}
            className="block w-full"
          />
        </picture>
        {/* Breadcrumb strip immediately under the artwork, so the baked-in
           hero typography stays uncluttered. */}
        <div className="border-t border-[#D6AD60]/30 bg-[#FFFDF8]">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em]"
              style={{ color: MUTED }}
            >
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link to="/" className="transition hover:text-[var(--ipf-green)]">
                    {t("nav.home")}
                  </Link>
                </li>
                <li aria-hidden="true" className="opacity-50">
                  ›
                </li>
                <li style={{ color: NAVY }}>{t("nav.news")}</li>
              </ol>
            </nav>
          </Container>
        </div>
      </section>

      {/* ──────────────── 2 · FEATURED STORY ──────────────── */}
      {featured ? (
        <Section tone="ivory" className="py-12 sm:py-16 lg:py-20">
          <Container>
            <div className="mb-8 flex items-baseline gap-4 sm:mb-10">
              <span
                aria-hidden="true"
                className="inline-block h-px w-10"
                style={{ backgroundColor: `${GOLD}99` }}
              />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD_INK }}
              >
                Featured Story
              </p>
            </div>
            <article className="mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
              <Link
                to={`/news/${featured.slug}`}
                className="group block overflow-hidden rounded-[1.5rem] bg-[#FFFDF8] shadow-[0_14px_38px_rgba(11,31,58,0.1)] ring-1 ring-[#D6AD60]/25 transition hover:shadow-[0_18px_48px_rgba(11,31,58,0.14)]"
              >
                <img
                  src={featured.image}
                  alt={featured.title}
                  loading="eager"
                  decoding="async"
                  className="block aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="min-w-0">
                <p
                  className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                  style={{ color: GOLD_INK }}
                >
                  {featured.date}
                </p>
                <h2
                  className="mt-3 font-serif text-[1.7rem] font-bold leading-[1.1] tracking-tight sm:text-[2rem] lg:text-[2.3rem]"
                  style={{ color: NAVY }}
                >
                  {featured.title}
                </h2>
                <p
                  className="mt-5 text-[0.98rem] leading-relaxed"
                  style={{ color: INK }}
                >
                  {featured.excerpt}
                </p>
                <Link
                  to={`/news/${featured.slug}`}
                  className="group mt-7 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.18em]"
                  style={{ color: NAVY }}
                >
                  Read the full story
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          </Container>
        </Section>
      ) : null}

      {/* ──────────────── 3 · LATEST NEWS ──────────────── */}
      {rest.length > 0 ? (
        <Section tone="white" className="py-12 sm:py-14 lg:py-16">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-3">
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                  Latest News
                </p>
                <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              </div>
              <h2 className="mt-4 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]" style={{ color: NAVY }}>
                More from the newsroom
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-[1120px] gap-6 sm:mt-12 sm:grid-cols-2 lg:gap-8">
              {rest.map((item) => (
                <Link
                  key={item.slug}
                  to={`/news/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.25rem] bg-[#FFFDF8] shadow-[0_8px_22px_rgba(11,31,58,0.06)] ring-1 ring-[#D6AD60]/25 transition hover:shadow-[0_14px_32px_rgba(11,31,58,0.12)]"
                >
                  <div className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="block aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col px-5 py-6 sm:px-6">
                    <p
                      className="text-[0.68rem] font-bold uppercase tracking-[0.26em]"
                      style={{ color: GOLD_INK }}
                    >
                      {item.date}
                    </p>
                    <h3
                      className="mt-3 font-serif text-[1.15rem] font-bold leading-tight tracking-tight sm:text-[1.25rem]"
                      style={{ color: NAVY }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-3 flex-1 text-[0.92rem] leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {item.excerpt}
                    </p>
                    <span
                      className="mt-5 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.18em]"
                      style={{ color: NAVY }}
                    >
                      Read more
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ──────────────── 4 · CMS EXTRAS (hidden if empty) ──────────────── */}
      <PageExtras page="news" />
    </>
  );
}
