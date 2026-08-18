import { Link } from "react-router-dom";
import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";

export default function NewsPage() {
  const { content } = useCms();
  return (
    <>
      <DocumentTitle title="News" />
      <PageHero
        eyebrow="Resources"
        title="News and updates"
        description="Public highlights from IPF programmes, community meetings and organisational milestones."
        crumbs={[{ label: "News" }]}
      />
      <Section tone="white">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {content.news.map((item) => (
              <Link key={item.slug} to={`/news/${item.slug}`} className="bg-[var(--ipf-ivory)] hover:opacity-95">
                <FramedPhoto src={item.image} alt="" imgClassName="h-52" />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{item.date}</p>
                  <h2 className="mt-2 text-xl font-bold text-[var(--ipf-navy)]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
      <PageExtras page="news" />
    </>
  );
}
