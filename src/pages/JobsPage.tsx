import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";

export default function JobsPage() {
  return (
    <>
      <DocumentTitle title="Job Board" />
      <PageHero
        eyebrow="Opportunities"
        title="Job Board"
        description="On the original website this link opened Contact Us. Vacancies and professional referrals are handled by IPF volunteers and the Business Council."
        crumbs={[{ label: "Job Board" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="jobs" />
          <Card tone="ivory" title="How it works">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Send your enquiry to the registered office. Business Council matters may also be sent to{" "}
              <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.businessEmail}`}>
                {site.businessEmail}
              </a>
              .
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
