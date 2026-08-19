import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Why join</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {privilegeBenefits.map((item) => (
              <Card key={item} size="sm" description={item} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/membership">Submit a membership enquiry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal">Log volunteer hours</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/donate">Donate</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
