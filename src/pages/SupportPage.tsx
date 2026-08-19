import { InquiryForm } from "../components/forms/InquiryForm";
import { PageExtras } from "../cms/PageExtras";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function SupportPage() {
  const { t } = useLocale();
  const write = t("page.support.write", { email: "EMAIL" });
  const [before, after] = write.split("EMAIL");
  return (
    <>
      <DocumentTitle title={t("page.support.title")} />
      <PageHero
        eyebrow={t("page.support.eyebrow")}
        title={t("page.support.title")}
        description={t("page.support.desc")}
        crumbs={[{ label: t("page.events.eyebrow"), to: "/news" }, { label: t("page.support.title") }]}
      />
      <Section id="grievances" tone="white">
        <span id="grievence-counseling" className="sr-only">
          {t("page.support.grievTitle")}
        </span>
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.support.grievTitle")}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
              <p>
                <strong className="text-[var(--ipf-navy)]">{t("page.support.cultural")}</strong> {t("page.support.culturalBody")}
              </p>
              <p>
                <strong className="text-[var(--ipf-navy)]">{t("page.support.workers")}</strong> {t("page.support.workersBody")}
              </p>
              <p>
                <strong className="text-[var(--ipf-navy)]">{t("page.support.local")}</strong> {t("page.support.localBody")}
              </p>
              <p>
                {before}
                <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.grievanceEmail}`}>
                  {site.grievanceEmail}
                </a>
                {after}
              </p>
            </div>
          </div>
          <FitImage src="/legacy-assets/images/grievence-couseling.png" alt="IPF counselling and grievance support" />
        </Container>
      </Section>
      <Section id="community">
        <span id="community-supprt" className="sr-only">
          {t("page.support.communityTitle")}
        </span>
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.support.communityTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">{t("page.support.communityBody")}</p>
          </div>
          <FitImage className="lg:order-first" src="/legacy-assets/images/community-support.png" alt="IPF community support" />
        </Container>
      </Section>
      <Section tone="white">
        <Container className="max-w-3xl">
          <InquiryForm intent="support" />
        </Container>
      </Section>
      <PageExtras page="support" />
    </>
  );
}
