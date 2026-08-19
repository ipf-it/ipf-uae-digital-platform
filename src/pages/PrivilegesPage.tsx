import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { privilegeBenefits } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function PrivilegesPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.privileges")} />
      <PageHero
        eyebrow={t("page.membership.eyebrow")}
        title={t("page.privileges.title")}
        description={t("page.privileges.desc")}
        crumbs={[{ label: t("nav.membership"), to: "/membership" }, { label: t("nav.privileges") }]}
      />
      <Section tone="white">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("common.whyJoin")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {privilegeBenefits.map((item) => (
              <Card key={item} size="sm" description={item} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/membership">{t("page.privileges.enquiry")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/yuva">{t("page.privileges.joinYuva")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal">{t("page.portal.logHours")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/donate">{t("nav.donate")}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
