import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export default function SignInPage() {
  return (
    <>
      <DocumentTitle title="Sign In" />
      <PageHero
        eyebrow="Members"
        title="Sign in"
        description="Member accounts, digital ID and renewals will be added with the CMS. The original Sign In page was broken (404). This page is the working replacement."
        crumbs={[{ label: "Sign in" }]}
      />
      <Section tone="white">
        <Container className="max-w-3xl">
          <Card
            size="lg"
            tone="ivory"
            title="Member login is not active yet"
            description="No member login is active yet. For enrolment, grievances or chapter contact, use the public forms below."
          >
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/membership">Apply for membership</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact IPF</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
