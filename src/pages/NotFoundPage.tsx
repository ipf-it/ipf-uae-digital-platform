import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function NotFoundPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.notfound.title")} />
      <PageHero
        eyebrow="404"
        title={t("page.notfound.title")}
        description={t("page.notfound.desc")}
        crumbs={[{ label: t("page.notfound.title") }]}
      />
      <Section tone="white">
        <Container>
          <Button asChild>
            <Link to="/">{t("common.returnHome")}</Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
