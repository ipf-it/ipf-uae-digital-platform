import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
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
        <Container className="max-w-3xl space-y-5">
          <p className="text-sm leading-7 text-[var(--ipf-muted)]">
            No member login is active yet. For enrolment, grievances or chapter contact, use the public forms below.
          </p>
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
        </Container>
      </Section>
    </>
  );
}
