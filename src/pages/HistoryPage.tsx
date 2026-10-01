import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

export default function HistoryPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.history")} />
      <PageHero
        eyebrow={t("page.history.eyebrow")}
        title={t("page.history.title")}
        description={t("page.history.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.history") }]}
      />
      <PageSectionRenderer pageId="history" />
      <PageExtras page="history" />
    </>
  );
}
