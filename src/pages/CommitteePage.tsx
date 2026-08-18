import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { committeeExtended, committeeMembers, chapters } from "../data/platformContent";

export default function CommitteePage() {
  return (
    <>
      <DocumentTitle title="Committee" />
      <PageHero
        eyebrow="Organisation"
        title="IPF Committee"
        description="Central Committee office-bearers, extended members, the Managing Committee, and eight UAE chapters — as published by Indian People's Forum UAE."
        crumbs={[{ label: "About IPF", to: "/about" }, { label: "Committee" }]}
      />
      <Section id="centralCommittee" tone="white">
        <Container>
          <h2 id="central" className="text-2xl font-bold text-[var(--ipf-navy)]">
            Central Committee
          </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
              Office-bearers who lead operations, culture, sports, communications, finance and chapter coordination.
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
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Central Committee members</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Full published roll, including Business Council, CSR, Legal Cell, Drishti and IT & Media.
          </p>
          <div className="mt-6">
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Member</TableHeader>
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
            Managing Committee
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
            The Managing Committee is the governing committee of IPF, nominated in the manner prescribed by the rules.
            It includes the full Central Committee and all Chapter and Council Convenors.
          </p>
        </Container>
      </Section>
      <Section id="chapters">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Chapters</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            A chapter is an IPF sub-body assigned to a city or emirate. IPF has eight chapters across the UAE.
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
