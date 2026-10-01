import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useSponsors } from "../hooks/useSponsors";
import { useLocale } from "../i18n/LocaleProvider";

export default function SponsorsPage() {
  const { t } = useLocale();
  const { sponsors, ready } = useSponsors();

  return (
    <>
      <DocumentTitle title={t("nav.sponsors")} />
      <PageHero
        eyebrow={t("page.sponsors.eyebrow")}
        title={t("nav.sponsors")}
        description={t("page.sponsors.desc")}
        crumbs={[{ label: t("nav.sponsors") }]}
      />
      <Section tone="white">
        <Container>
          {sponsors.length > 0 ? (
            <CardGrid columns={3}>
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id} tone="ivory" title={sponsor.name} description={sponsor.description}>
                  {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} className="h-16 w-full object-contain" loading="lazy" decoding="async" /> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--ipf-muted)]">
                    {sponsor.tier ? <span className="rounded-full bg-[var(--ipf-ivory)] px-2.5 py-1 font-semibold uppercase tracking-wide text-[var(--ipf-navy)]">{sponsor.tier}</span> : null}
                    {sponsor.website ? (
                      <a className="font-semibold text-[var(--ipf-green)]" href={sponsor.website} target="_blank" rel="noreferrer">
                        {t("page.sponsors.visitWebsite")}
                      </a>
                    ) : null}
                  </div>
                </Card>
              ))}
            </CardGrid>
          ) : ready ? (
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.sponsors.empty")}</p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
