import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { committeeExtended, committeeMembers, chapters } from "../data/platformContent";
import { useLocale } from "../i18n/LocaleProvider";

export default function CommitteePage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.committee")} />
      <PageHero
        eyebrow={t("page.leadership.eyebrow")}
        title={t("page.committee.title")}
        description={t("page.committee.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.committee") }]}
      />
      <Section id="centralCommittee" tone="white">
        <Container>
          <h2 id="central" className="text-2xl font-bold text-[var(--ipf-navy)]">
            {t("page.leadership.central")}
          </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
              {t("page.leadership.committeeBody")}
            </p>
            <CardGrid columns={2} className="mt-8">
              {committeeMembers.map((member) => (
                <Card key={member.name} size="sm" tone="ivory">
                  <PersonIdentity
                    src={member.image}
                    alt={member.name}
                    name={member.name}
                    role={member.role}
                  />
                </Card>
              ))}
            </CardGrid>
          </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.committee.membersTitle")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.committee.membersBody")}
          </p>
          <div className="mt-6">
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>{t("page.leadership.role")}</TableHeader>
                  <TableHeader>{t("page.leadership.member")}</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {committeeMembers.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium text-[var(--ipf-navy)]">{row.role}</TableCell>
                    <TableCell>{row.name}</TableCell>
                  </TableRow>
                ))}
                {committeeExtended.map((row) => (
                  <TableRow key={`${row.role}-${row.name}`}>
                    <TableCell className="font-medium text-[var(--ipf-navy)]">{row.role}</TableCell>
                    <TableCell>{row.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Container>
      </Section>
      <Section id="managingCommittee" tone="white">
        <Container className="max-w-3xl">
          <h2 id="managing" className="text-2xl font-bold text-[var(--ipf-navy)]">
            {t("page.committee.managing")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.committee.managingBody")}
          </p>
        </Container>
      </Section>
      <Section id="chapters">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("nav.chapters")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.committee.chaptersBody")}
          </p>
          <CardGrid columns={4} className="mt-6">
            {chapters.map((chapter) => (
              <Card key={chapter.id} to={`/chapters#${chapter.id}`} size="sm" align="center" title={chapter.name} />
            ))}
          </CardGrid>
        </Container>
      </Section>
    </>
  );
}
