import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export default function NotFoundPage() {
  return (
    <>
      <DocumentTitle title="Page not found" />
      <PageHero
        eyebrow="404"
        title="This page is not available"
        description="The address may have changed. Use the menu or return to the official homepage."
        crumbs={[{ label: "Not found" }]}
      />
      <Section tone="white">
        <Container>
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
