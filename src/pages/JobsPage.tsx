import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function JobsPage() {
  const { t } = useLocale();
  const how = t("page.jobs.howBody", { email: "EMAIL" });
  const [before, after] = how.split("EMAIL");
  return (
    <>
      <DocumentTitle title={t("page.jobs.title")} />
      <PageHero
        eyebrow={t("page.jobs.eyebrow")}
        title={t("page.jobs.title")}
        description={t("page.jobs.desc")}
        crumbs={[{ label: t("page.jobs.title") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="jobs" />
          <Card tone="ivory" title={t("page.jobs.how")}>
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              {before}
              <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.businessEmail}`}>
                {site.businessEmail}
              </a>
              {after}
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
