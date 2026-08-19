import { Link, useParams } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { getCouncil, publishedCouncilPeople, specialCouncilRecords, stateCouncilRecords } from "../data/orgNav";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import NotFoundPage from "./NotFoundPage";

export default function CouncilPage() {
  const { t } = useLocale();
  const { councilId = "" } = useParams();
  const council = getCouncil(councilId);
  if (!council) return <NotFoundPage />;

  const people = publishedCouncilPeople(council.id);
  const peers = council.kind === "state" ? stateCouncilRecords : specialCouncilRecords;
  const noteKey = `page.council.note.${council.id}`;
  const note = t(noteKey);
  const intro =
    council.kind === "state"
      ? t("page.council.stateIntro", { name: council.name, state: council.region })
      : note !== noteKey
        ? note
        : t("page.councils.specialBody");

  return (
    <>
      <DocumentTitle title={council.name} />
      <PageHero
        eyebrow={council.kind === "state" ? t("nav.stateCouncils") : t("nav.specialCouncils")}
        title={council.name}
        description={intro}
        crumbs={[{ label: t("nav.councils"), to: "/councils" }, { label: council.name }]}
        image={council.image}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)]">
            <p>{intro}</p>
            <p>{t("page.council.workLead")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {council.kind === "state" ? (
                <>
                  <li>{t("page.council.stateWork1", { state: council.region })}</li>
                  <li>{t("page.council.stateWork2")}</li>
                  <li>{t("page.council.stateWork3")}</li>
                </>
              ) : (
                <>
                  <li>{t(`page.council.${council.id}Work1`)}</li>
                  <li>{t(`page.council.${council.id}Work2`)}</li>
                  <li>{t(`page.council.${council.id}Work3`)}</li>
                </>
              )}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <a href={`mailto:${council.email}`}>{t("page.council.writeDesk")}</a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/membership">{t("nav.membership")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/events">{t("nav.events")}</Link>
              </Button>
              {council.id === "business" ? (
                <Button asChild variant="outline">
                  <Link to="/jobs">{t("nav.jobs")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <aside className="space-y-5">
            <Card tone="ivory" title={t("page.council.contactTitle")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.council.contactBody")}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{site.office}</p>
              <p className="mt-3 text-sm">
                <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${council.email}`}>
                  {council.email}
                </a>
              </p>
            </Card>
            <Card tone="ivory" title={t("page.council.officersTitle")}>
              {people.length > 0 ? (
                <ul className="space-y-2 text-sm leading-6 text-[var(--ipf-muted)]">
                  {people.map((person) => (
                    <li key={`${person.name}-${person.role}`}>
                      <span className="font-semibold text-[var(--ipf-navy)]">{person.name}</span>
                      <span className="block text-xs">{person.role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.council.officersEmpty")}</p>
              )}
              <p className="mt-3 text-sm">
                <Link className="font-semibold text-[var(--ipf-green)]" to="/leadership">
                  {t("nav.leadership")}
                </Link>
              </p>
            </Card>
          </aside>
        </Container>
      </Section>
      <Section>
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.council.other")}</h2>
          <CardGrid columns={3}>
            {peers
              .filter((item) => item.id !== council.id)
              .map((item) => (
                <Card key={item.id} size="sm" tone="ivory" to={`/councils/${item.id}`} title={item.name} />
              ))}
          </CardGrid>
          <p className="text-sm">
            <Link className="font-semibold text-[var(--ipf-navy)]" to="/councils">
              {t("nav.viewAll")}
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
