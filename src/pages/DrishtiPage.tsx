import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { usePublications } from "../hooks/usePublications";
import { useLocale } from "../i18n/LocaleProvider";

export default function DrishtiPage() {
  const { t } = useLocale();
  const { publications, ready } = usePublications();
  return (
    <>
      <DocumentTitle title={t("page.drishti.title")} />
      <PageHero
        eyebrow={t("page.events.eyebrow")}
        title={t("page.drishti.title")}
        description={t("page.drishti.desc")}
        crumbs={[{ label: t("page.events.eyebrow"), to: "/news" }, { label: t("page.drishti.title") }]}
      />
      <Section tone="white">
        <Container>
          {publications.length > 0 ? (
            <CardGrid>
              {publications.map((edition) => (
                <Card
                  key={edition.id}
                  href={edition.file_url}
                  tone="ivory"
                  image={edition.cover_image}
                  imageAlt={`${edition.title} ${edition.edition}`}
                  imageFit="contain"
                  imageClassName="h-64"
                  eyebrow={edition.edition}
                  title={edition.title}
                  description={t("common.openReader")}
                />
              ))}
            </CardGrid>
          ) : ready ? (
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.drishti.empty")}</p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
