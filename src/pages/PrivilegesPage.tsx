import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { privilegeBenefits } from "../data/platformContent";

export default function PrivilegesPage() {
  return (
    <>
      <DocumentTitle title="Privileges" />
      <PageHero
        eyebrow="Membership"
        title="Privileges and volunteer participation"
        description="Indian People's Forum membership is open to anyone of Indian origin living in the United Arab Emirates and holding a valid residential visa."
        crumbs={[{ label: "Membership", to: "/membership" }, { label: "Privileges" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Why join</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ipf-muted)]">
              {privilegeBenefits.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild>
                <Link to="/membership">Submit a membership enquiry</Link>
              </Button>
            </div>
          </div>
          <div className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6">
            <h2 className="text-xl font-bold text-[var(--ipf-navy)]">How to pay membership fees</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              Electronic transfer or cheque in the name of Indian Peoples Forum. Put your name as reference and email
              payment details to the Treasurer at info@ipf-uae.org.
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              Cheques may be sent to Vijayan, Treasurer, Indian People's Forum, Office 208, Horizon Towers, Al
              Rashidiya, Ajman, United Arab Emirates.
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              Bank account fields will be published securely through the CMS. Do not share account numbers on public
              pages until IPF confirms the live details.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
