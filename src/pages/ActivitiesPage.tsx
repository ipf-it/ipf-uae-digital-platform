import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useActivities } from "../hooks/useActivities";
import { useLocale } from "../i18n/LocaleProvider";

function formatRange(start: string | null, end: string | null) {
  if (!start) return "";
  return end && end !== start ? `${start} – ${end}` : start;
}

export default function ActivitiesPage() {
  const { t } = useLocale();
  const { activities, ready } = useActivities();

  return (
    <>
      <DocumentTitle title={t("page.activities.title")} />
      <PageHero
        eyebrow={t("page.activities.eyebrow")}
        title={t("page.activities.title")}
        description={t("page.activities.desc")}
        crumbs={[{ label: t("page.activities.title") }]}
      />
      <Section tone="white">
        <Container>
          {activities.length > 0 ? (
            <CardGrid columns={3}>
              {activities.map((activity) => (
                <Card
                  key={activity.id}
                  tone="ivory"
                  title={activity.title}
                  eyebrow={formatRange(activity.start_date, activity.end_date)}
                  description={activity.summary || activity.body}
                  image={activity.image || undefined}
                />
              ))}
            </CardGrid>
          ) : ready ? (
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.activities.empty")}</p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
