import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
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
          <aside className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6">
            <h2 className="text-lg font-bold text-[var(--ipf-navy)]">How it works</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
              Send your enquiry to the registered office. Business Council matters may also be sent to{" "}
              <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.businessEmail}`}>
                {site.businessEmail}
              </a>
              .
            </p>
          </aside>
        </Container>
      </Section>
    </>
  );
}
