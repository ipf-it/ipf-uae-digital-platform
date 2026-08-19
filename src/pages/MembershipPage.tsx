import { Link } from "react-router-dom";
import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export default function MembershipPage() {
  return (
    <>
      <DocumentTitle title="How to Join" />
      <PageHero
        eyebrow="Membership"
        title="Application for membership"
        description="Indian People's Forum membership is open to anyone of Indian origin living in the UAE with a valid residential visa. Annual membership follows the calendar year, January to December."
        crumbs={[{ label: "Membership" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="membership" />
          <aside className="space-y-5">
            <Card tone="ivory" title="After you apply">
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                The Executive Committee will consider your application and write to you by email. On acceptance you
                will need to send proof of resident status (passport and valid visa copy) to be officially enrolled.
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
                Review{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/privileges">
                  privileges
                </Link>
                , the{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/governance#bye-law">
                  Bye Law
                </Link>{" "}
                and the{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/governance#ethics">
                  Code of Ethics
                </Link>{" "}
                before applying.
              </p>
            </Card>
            <Button asChild variant="outline">
              <Link to="/register">Create a member account</Link>
            </Button>
          </aside>
        </Container>
      </Section>
    </>
  );
}
