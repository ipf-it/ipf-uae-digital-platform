import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export default function RegisterPage() {
  return (
    <>
      <DocumentTitle title="Register" />
      <PageHero
        eyebrow="Membership"
        title="Register with IPF UAE"
        description="The original site listed Register in the menu without a working account system. Membership applications are the official enrolment path until the CMS member portal is connected."
        crumbs={[{ label: "Register" }]}
      />
      <Section tone="white">
        <Container className="max-w-3xl">
          <Card
            size="lg"
            tone="ivory"
            title="How to register"
            description="There is no public self-registration login on the current IPF website. To join, submit the membership application. Volunteer participation is covered under Privileges."
          >
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/membership">Membership application</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/privileges">Become a volunteer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
