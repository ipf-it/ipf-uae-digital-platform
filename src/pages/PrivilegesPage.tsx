import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
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
      <PageSectionRenderer pageId="privileges" />
      <Section tone="white">
        <Container className="flex flex-wrap gap-3">
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
        </Container>
      </Section>
    </>
  );
}
