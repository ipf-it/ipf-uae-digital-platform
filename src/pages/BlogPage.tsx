import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";
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
          <div className="grid gap-6 lg:grid-cols-2">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="bg-[var(--ipf-ivory)] hover:opacity-95">
                <FramedPhoto src={post.image} alt="" imgClassName="h-52" />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{post.date}</p>
                  <h2 className="mt-2 text-xl font-bold text-[var(--ipf-navy)]">{post.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
