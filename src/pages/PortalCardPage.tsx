import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useToast } from "../components/ui/Toast";
import { useLocale } from "../i18n/LocaleProvider";
import { api } from "../lib/api";

export default function PortalCardPage() {
  const { t } = useLocale();
  const { member, ready } = useMember();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  if (!ready) return null;
  if (!member) return <Navigate to="/sign-in?next=/portal/card" replace />;

  async function onEmailCard() {
    setSending(true);
    try {
      await api("/api/members/card/email", { method: "POST" });
      toast.success(t("page.portal.emailCardSent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not email your card");
    } finally {
      setSending(false);
    }
  }

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
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" disabled={sending} onClick={() => void onEmailCard()}>
              {sending ? "Sending…" : t("page.portal.emailCard")}
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal">{t("nav.portal")}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
