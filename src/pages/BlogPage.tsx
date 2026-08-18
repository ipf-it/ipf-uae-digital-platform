import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { blogPosts } from "../data/platformContent";

export default function BlogPage() {
  return (
    <>
      <DocumentTitle title="Blog" />
      <PageHero
        eyebrow="Resources"
        title="Blog"
        description="Community notes, festival greetings and public commentary published for IPF members and the wider Indian community in the UAE."
        crumbs={[{ label: "Resources", to: "/news" }, { label: "Blog" }]}
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
