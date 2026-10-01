import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
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
        <Container className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/register">{t("page.membership.memberAccount")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register?kind=yuva">{t("page.membership.yuvaId")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/privileges">{t("nav.privileges")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">{t("nav.contact")}</Link>
          </Button>
        </Container>
      </Section>
      <PageSectionRenderer pageId="membership" startTone="ivory" />
      <PageExtras page="membership" />
    </>
  );
}
