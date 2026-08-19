import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { Section } from "../components/ui/Section";
import { PillNav } from "../components/ui/Tabs";
import { galleryNavItems } from "../data/galleryNav";
import { img } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function DiscoverIndiaPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.discover.title")} />
      <PageHero
        eyebrow={t("page.gallery.eyebrow")}
        title={t("page.discover.title")}
        description={t("page.discover.desc")}
        crumbs={[{ label: t("nav.gallery"), to: "/gallery" }, { label: t("page.discover.title") }]}
      />
      <Section tone="white">
        <Container>
          <div className="mb-8">
            <PillNav items={galleryNavItems.map((item) => ({ to: item.to, label: t(item.key) }))} />
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <article className="space-y-5 text-sm leading-8 text-[var(--ipf-muted)]">
            <p>{t("page.discover.p1")}</p>
            <p>{t("page.discover.p2")}</p>
            <p>{t("page.discover.p3")}</p>
            <p>{t("page.discover.p4")}</p>
            <p>
              {t("page.discover.official")}{" "}
              <a className="font-semibold text-[var(--ipf-navy)]" href="https://www.incredibleindia.gov.in/" target="_blank" rel="noreferrer">
                incredibleindia.gov.in
              </a>
            </p>
          </article>
          <FitImage className="lg:order-first" src={img.indiaUae} alt={t("page.discover.photoAlt")} />
          </div>
        </Container>
      </Section>
    </>
  );
}
