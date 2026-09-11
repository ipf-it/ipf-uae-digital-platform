import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { presidentMessageBody } from "../data/platformContent";
import { useLeadership } from "../hooks/useOrgDirectory";
import { img, site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function LeadershipPage() {
  const { t } = useLocale();
  const { leadership } = useLeadership("global");
  // Central Committee members have a photo on file; the wider extended committee (Business
  // Council convenors, CSR/legal/media leads, etc.) doesn't — same distinction the page has
  // always drawn, now derived from live appointment data instead of two separate hardcoded lists.
  const committee = leadership.filter((entry) => entry.personImage);
  const extended = leadership.filter((entry) => !entry.personImage);

  return (
    <>
      <DocumentTitle title={t("page.leadership.title")} />
      <PageHero
        eyebrow={t("page.leadership.eyebrow")}
        title={t("page.leadership.title")}
        description={t("page.leadership.desc", { name: site.president })}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("page.leadership.title") }]}
      />
      <Section tone="white">
        <Container>
          <figure className="mx-auto max-w-[248px] text-center">
            <FramedPhoto
              src={img.president}
              alt={`${site.president}, ${site.presidentRole}`}
              imgClassName="h-72 w-full bg-[var(--ipf-navy)] object-top"
              loading="eager"
            />
            <figcaption className="mt-4">
              <p className="text-lg font-bold text-[var(--ipf-navy)]">{site.president}</p>
              <p className="mt-1 text-sm text-[var(--ipf-muted)]">{site.presidentRole}</p>
            </figcaption>
          </figure>
          <div className="mx-auto mt-6 h-1 w-24 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]" />
          <article className="mx-auto mt-8 max-w-3xl space-y-5 text-sm leading-8 text-[var(--ipf-muted)] sm:text-base">
            {presidentMessageBody.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link to="/membership">{t("nav.joinLong")}</Link>
              </Button>
            </div>
          </article>
        </Container>
      </Section>
      <Section id="committee">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.leadership.central")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.leadership.committeeBody")}
          </p>
          <CardGrid columns={2} className="mt-8">
            {committee.map((member) => (
              <Card key={member.id} size="sm" tone="ivory">
                <PersonIdentity src={member.personImage} alt={member.personName} name={member.personName} role={member.positionTitle} />
              </Card>
            ))}
          </CardGrid>
        </Container>
      </Section>
      <Section tone="white">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.leadership.extended")}</h2>
          <div className="mt-6">
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>{t("page.leadership.role")}</TableHeader>
                  <TableHeader>{t("page.leadership.member")}</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {extended.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-[var(--ipf-navy)]">{row.positionTitle}</TableCell>
                    <TableCell>{row.personName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Container>
      </Section>
    </>
  );
}
