import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";
import { api } from "../lib/api";

type VerifyResult = {
  name: string;
  membershipNo: string;
  location: string;
  isVolunteer: boolean;
  registeredOn: string;
};

/** Public, no sign-in — this is where a member's QR code (or anyone typing the URL) lands. */
export default function VerifyMemberPage() {
  const { t } = useLocale();
  const { code = "" } = useParams();
  const [result, setResult] = useState<VerifyResult | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setResult(undefined);
    api<VerifyResult>(`/api/members/verify?code=${encodeURIComponent(code)}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <>
      <DocumentTitle title={t("page.verify.title")} />
      <PageHero eyebrow={t("page.verify.eyebrow")} title={t("page.verify.title")} description={code} crumbs={[{ label: t("page.verify.title") }]} />
      <Section tone="white">
        <Container className="max-w-xl">
          {result === undefined ? (
            <p className="text-sm text-[var(--ipf-muted)]">{t("page.verify.checking")}</p>
          ) : result === null ? (
            <Card title={t("page.verify.notFoundBadge")}>
              <Badge tone="saffron">{t("page.verify.notFoundBadge")}</Badge>
              <p className="mt-3 text-sm leading-6 text-[var(--ipf-muted)]">{t("page.verify.notFoundDesc")}</p>
            </Card>
          ) : (
            <Card title={result.name} description={`${result.membershipNo} · ${result.location}`}>
              <Badge tone="green">{t("page.verify.verifiedBadge")}</Badge>
              <p className="mt-3 text-sm text-[var(--ipf-muted)]">{result.isVolunteer ? "IPF Yuva volunteer" : "Member"}</p>
              <p className="mt-1 text-sm text-[var(--ipf-muted)]">
                {t("page.verify.registeredOn")}: {new Date(result.registeredOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}
