import { Link, useLocation, useParams } from "react-router-dom";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { Section } from "../components/ui/Section";
import { blogPosts } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function ArticlePage() {
  const { t } = useLocale();
  const { slug = "" } = useParams();
  const { pathname } = useLocation();
  const { content } = useCms();
  const kind = pathname.startsWith("/blog") ? "blog" : "news";
  const collection = kind === "news" ? content.news : blogPosts;
  const article = collection.find((item) => item.slug === slug);
  const listTo = kind === "news" ? "/news" : "/blog";
  const listLabel = kind === "news" ? t("nav.news") : t("page.blog.title");

  if (!article) {
    return (
      <>
        <DocumentTitle title={t("page.article.missing")} />
        <PageHero
          eyebrow={listLabel}
          title={t("page.article.missing")}
          description={t("page.article.missingDesc")}
          crumbs={[{ label: listLabel, to: listTo }, { label: t("page.article.missing") }]}
        />
        <Section tone="white">
          <Container>
            <Button asChild variant="outline">
              <Link to={listTo}>{t("page.article.back", { list: listLabel })}</Link>
            </Button>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      <DocumentTitle title={article.title} />
      <PageHero
        eyebrow={listLabel}
        title={article.title}
        description={`${article.date} • Indian People's Forum UAE`}
        crumbs={[{ label: listLabel, to: listTo }, { label: article.title }]}
      />
      <Section tone="white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <FitImage src={article.image} alt="" />
          <article className="space-y-4 text-sm leading-8 text-[var(--ipf-muted)]">
            <p>{article.body}</p>
            <Button asChild variant="outline">
              <Link to={listTo}>{t("page.article.back", { list: listLabel })}</Link>
            </Button>
          </article>
        </Container>
      </Section>
    </>
  );
}
