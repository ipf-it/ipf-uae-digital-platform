import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

export default function GovernancePage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.governance")} />
      <PageHero
        eyebrow={t("page.governance.eyebrow")}
        title={t("page.governance.title")}
        description={t("page.governance.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.governance") }]}
      />
      <PageSectionRenderer pageId="governance" />
      <PageExtras page="governance" />
    </>
  );
}
