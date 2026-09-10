import { Link } from "react-router-dom";
import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

export default function MembershipPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.membership.title")} />
      <PageHero
        eyebrow={t("page.membership.eyebrow")}
        title={t("page.membership.title")}
        description={t("page.membership.desc")}
        crumbs={[{ label: t("nav.membership") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="membership" />
          <aside className="space-y-5">
            <Card tone="ivory" title={t("page.membership.after")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.membership.afterBody")}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/privileges">
                  {t("nav.privileges")}
                </Link>
                {" · "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/governance#bye-law">
                  {t("page.governance.bye")}
                </Link>
                {" · "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/governance#ethics">
                  {t("page.governance.ethics")}
                </Link>
              </p>
            </Card>
            <Card title={t("page.membership.twoWays")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                <strong className="text-[var(--ipf-navy)]">{t("nav.member")}.</strong> {t("page.membership.memberBlurb")}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
                <strong className="text-[var(--ipf-navy)]">{t("page.yuva.title")}.</strong> {t("page.membership.yuvaBlurb")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/register">{t("page.membership.memberAccount")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register?kind=yuva">{t("page.membership.yuvaId")}</Link>
                </Button>
              </div>
            </Card>
          </aside>
        </Container>
      </Section>
      <PageExtras page="membership" />
    </>
  );
}
