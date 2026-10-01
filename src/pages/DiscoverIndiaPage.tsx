import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { PillNav } from "../components/ui/Tabs";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { galleryNavItems } from "../data/galleryNav";
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
          <PillNav items={galleryNavItems.map((item) => ({ to: item.to, label: t(item.key) }))} />
        </Container>
      </Section>
      <PageSectionRenderer pageId="discover-india" startTone="ivory" />
      <Section tone="ivory">
        <Container>
          <p className="text-sm leading-8 text-[var(--ipf-muted)]">
            {t("page.discover.official")}{" "}
            <a className="font-semibold text-[var(--ipf-navy)]" href="https://www.incredibleindia.gov.in/" target="_blank" rel="noreferrer">
              incredibleindia.gov.in
            </a>
          </p>
        </Container>
      </Section>
    </>
  );
}
