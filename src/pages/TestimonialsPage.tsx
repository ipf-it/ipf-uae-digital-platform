import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { PageSectionRenderer } from "../components/PageSectionRenderer";
import { useLocale } from "../i18n/LocaleProvider";

export default function TestimonialsPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.testimonials.title")} />
      <PageHero
        eyebrow={t("page.testimonials.eyebrow")}
        title={t("page.testimonials.title")}
        description={t("page.testimonials.desc")}
        crumbs={[{ label: t("page.testimonials.title") }]}
      />
      <PageSectionRenderer pageId="testimonials" />
    </>
  );
}
