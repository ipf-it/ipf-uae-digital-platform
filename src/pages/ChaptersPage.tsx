import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChapterMap } from "../components/ChapterMap";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { chapterPath } from "../data/orgNav";
import { useOrgChapters } from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";

/* ───────────────────────────────────────────────────────────────────────
 * ChaptersPage — approved illustrated hero (6 Oct 2026).
 *
 * HERO ARTWORK: /images/chapters/chapters-hero.{webp,png}
 *   (Seven Chapters, One Community — 1774×887)
 *
 * The founder-approved artwork already contains "CHAPTERS", the tagline
 * "SEVEN CHAPTERS. ONE COMMUNITY.", the UAE skyline, flag, map and
 * seven illustrated chapter panels. We therefore do NOT render a
 * separate heading/eyebrow/tagline over it, and we do NOT add any
 * overlay, gradient, dark wash or button on top of the artwork.
 *
 * Responsive behaviour
 *   • Default (mobile): container aspect-[16/9], image uses
 *     object-fit:cover with object-position: top center so the title
 *     band ("CHAPTERS" + tagline + skyline/map) stays prominent and
 *     readable. The chapter-card row at the bottom of the artwork is
 *     intentionally cropped on narrow widths because those labels would
 *     otherwise be too small — the authoritative chapter data below
 *     renders at readable mobile size.
 *   • md+ (tablet + desktop): natural aspect [1774/887] with no crop so
 *     the complete composition (skyline, map, all seven illustrated
 *     chapter panels, ornamental details) is visible.
 *
 * Data discipline
 *   The seven panels in the artwork are PRESENTATIONAL only. The real
 *   Chapters content continues to come from useOrgChapters() → the
 *   authoritative API/DB. Nothing in the hero is derived from, or feeds
 *   back into, the chapter data model.
 *
 * A11y
 *   The artwork is given an informative alt describing what it depicts
 *   (so screen readers understand there is a titled illustration here).
 *   A visually-hidden <h1> provides the document heading for assistive
 *   tech + SEO without duplicating the artwork's visible text.
 * ─────────────────────────────────────────────────────────────────── */

export default function ChaptersPage() {
  const { t } = useLocale();
  const { chapters } = useOrgChapters();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && chapters.some((chapter) => chapter.id === id))
      navigate(chapterPath(id), { replace: true });
  }, [location.hash, navigate, chapters]);

  return (
    <>
      <DocumentTitle title={t("nav.chapters")} />

      {/* ──────────────── HERO — approved artwork, no overlay ──────────────── */}
      <section aria-labelledby="chapters-page-heading" className="relative isolate bg-[#FFF8EE]">
        <h1 id="chapters-page-heading" className="sr-only">
          {t("page.chapters.title")}
        </h1>
        <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[1774/887]">
          <picture>
            <source
              srcSet="/images/chapters/chapters-hero.webp"
              type="image/webp"
            />
            <img
              src="/images/chapters/chapters-hero.png"
              alt="IPF UAE Chapters — Seven Chapters, One Community. Illustrated panorama featuring the UAE skyline, flag, map and all seven chapter emirates."
              loading="eager"
              fetchPriority="high"
              width={1774}
              height={887}
              className="block h-full w-full object-cover object-top"
            />
          </picture>
        </div>
      </section>

      <Section tone="white">
        <Container className="space-y-10">
          <ChapterMap />
          <CardGrid columns={2}>
            {chapters.map((chapter) => (
              <Card
                id={chapter.id}
                key={chapter.id}
                className="scroll-mt-28"
                tone="ivory"
                title={chapter.name}
                description={chapter.description}
                to={chapterPath(chapter.id)}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
