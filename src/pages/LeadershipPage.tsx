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
import { useCms } from "../cms/ContentProvider";
import { committeeExtended, presidentMessageBody } from "../data/platformContent";
import { img, site } from "../data/site";

export default function LeadershipPage() {
  const { content } = useCms();
  const leaders = content.leadership;

  return (
    <>
      <DocumentTitle title="Leadership" />
      <PageHero
        eyebrow="Organisation"
        title="Leadership"
        description={`A message from ${site.president}, and the Central Committee of Indian People's Forum UAE.`}
        crumbs={[{ label: "About IPF", to: "/about" }, { label: "Leadership" }]}
      />
      <Section tone="white">
        <Container>
          <figure className="mx-auto max-w-[248px] text-center">
            <FramedPhoto
              src={img.president}
              alt={`${site.president}, ${site.presidentRole}`}
              imgClassName="h-72 w-full bg-[var(--ipf-navy)] object-top"
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
                <Link to="/membership">{site.joinCta}</Link>
              </Button>
            </div>
          </article>
        </Container>
      </Section>
      <Section id="committee">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Central Committee</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Office-bearers who lead operations, culture, sports, communications, finance and chapter coordination.
          </p>
          <CardGrid columns={2} className="mt-8">
            {leaders.map((member) => (
              <Card key={`${member.name}-${member.role}`} size="sm" tone="ivory">
                <PersonIdentity src={member.image} alt={member.name} name={member.name} role={member.role} />
              </Card>
            ))}
          </CardGrid>
        </Container>
      </Section>
      <Section tone="white">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Extended committee</h2>
          <div className="mt-6">
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Member</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
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
    </>
  );
}
