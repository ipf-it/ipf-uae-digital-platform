import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function ContactPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.contact.title")} />
      <PageHero
        eyebrow={t("page.contact.eyebrow")}
        title={t("page.contact.title")}
        description={t("page.contact.desc")}
        crumbs={[{ label: t("nav.contact") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="contact" />
          <aside className="space-y-5">
            <Card tone="ivory" title={t("page.contact.office")} description={site.office}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                Email:{" "}
                <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
            </Card>
            <Card tone="ivory" title={t("page.contact.desks")}>
              <ul className="space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
                <li>
                  Abu Dhabi:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.abuDhabiEmail}`}>
                    {site.abuDhabiEmail}
                  </a>
                </li>
                <li>
                  {t("page.contact.business")}:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.businessEmail}`}>
                    {site.businessEmail}
                  </a>
                </li>
                <li>
                  {t("page.contact.grievances")}:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.grievanceEmail}`}>
                    {site.grievanceEmail}
                  </a>
                </li>
              </ul>
            </Card>
          </aside>
        </Container>
      </Section>
    </>
  );
}
