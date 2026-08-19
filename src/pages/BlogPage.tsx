import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { blogPosts } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function BlogPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.blog.title")} />
      <PageHero
        eyebrow={t("page.events.eyebrow")}
        title={t("page.blog.title")}
        description={t("page.blog.desc")}
        crumbs={[{ label: t("page.events.eyebrow"), to: "/news" }, { label: t("page.blog.title") }]}
      />
      <Section tone="white">
        <Container>
          <CardGrid columns={2}>
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                to={`/blog/${post.slug}`}
                tone="ivory"
                image={post.image}
                imageAlt={post.title}
                eyebrow={post.date}
                title={post.title}
                description={post.excerpt}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
