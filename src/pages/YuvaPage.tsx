import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function YuvaPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.yuva.title")} />
      <PageHero
        eyebrow={t("page.yuva.eyebrow")}
        title={t("page.yuva.title")}
        description={t("page.yuva.desc")}
        crumbs={[{ label: t("page.yuva.title") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)]">
            <p>{t("page.yuva.p1")}</p>
            <p>{t("page.yuva.p2")}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t("page.yuva.li1")}</li>
              <li>{t("page.yuva.li2")}</li>
              <li>{t("page.yuva.li3")}</li>
              <li>{t("page.yuva.li4")}</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link to="/register?kind=yuva">{t("page.yuva.registerYuva")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">{t("page.yuva.registerMember")}</Link>
              </Button>
            </div>
          </div>
          <Card tone="ivory" title={t("page.membership.twoWays")}>
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              <strong className="text-[var(--ipf-navy)]">{t("nav.member")}.</strong> {t("page.membership.memberBlurb")}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
              <strong className="text-[var(--ipf-navy)]">{t("page.yuva.title")}.</strong> {t("page.membership.yuvaBlurb")}
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
