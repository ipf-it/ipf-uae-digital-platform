import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { PageExtras } from "../cms/PageExtras";
import { useLocale } from "../i18n/LocaleProvider";

export default function AboutPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.aboutIpf")} />
      <PageHero
        eyebrow={t("page.about.eyebrow")}
        title={t("page.about.title")}
        description={t("page.about.desc")}
        crumbs={[{ label: t("nav.aboutIpf") }]}
      />
      <PageSectionRenderer pageId="about" />
      <PageExtras page="about" />
    </>
  );
}
