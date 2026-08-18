import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { Section } from "../components/ui/Section";
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
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {committeeMembers.map((member) => (
                <article key={member.name} className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] px-4 py-3">
                  <PersonIdentity
                    src={member.image}
                    alt={member.name}
                    name={member.name}
                    role={member.role}
                  />
                </article>
              ))}
            </div>
          </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Central Committee members</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Full published roll, including Business Council, CSR, Legal Cell, Drishti and IT & Media.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="ipf-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Member</th>
                </tr>
              </thead>
              <tbody>
                {committeeMembers.map((row) => (
                  <tr key={row.name}>
                    <td>{row.role}</td>
                    <td>{row.name}</td>
                  </tr>
                ))}
                {committeeExtended.map((row) => (
                  <tr key={`${row.role}-${row.name}`}>
                    <td>{row.role}</td>
                    <td>{row.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/chapters#${chapter.id}`}
                className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] px-4 py-4 text-sm font-semibold text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)]"
              >
                {chapter.name}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
