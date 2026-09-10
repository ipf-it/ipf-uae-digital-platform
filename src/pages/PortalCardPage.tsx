import { Link, Navigate } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function PortalCardPage() {
  const { t } = useLocale();
  const { member, ready } = useMember();
  if (!ready) return null;
  if (!member) return <Navigate to="/sign-in?next=/portal/card" replace />;

  return (
    <>
      <DocumentTitle title={t("nav.membershipCard")} />
      <PageHero
        eyebrow={t("nav.portal")}
        title={t("nav.membershipCard")}
        description={t("page.portal.memberDesc")}
        crumbs={[{ label: t("nav.portal"), to: "/portal" }, { label: t("nav.membershipCard") }]}
      />
      <Section tone="white">
        <Container className="max-w-xl space-y-4">
          <DigitalIdCard member={member} />
          <Button asChild variant="outline">
            <Link to="/portal">{t("nav.portal")}</Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
