import { InquiryForm } from "../components/forms/InquiryForm";
import { PageExtras } from "../cms/PageExtras";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";

export default function SupportPage() {
  return (
    <>
      <DocumentTitle title="Support Activity" />
      <PageHero
        eyebrow="Resources"
        title="Support Activity"
        description="Grievances, counselling and community support for Indians living in the UAE — coordinated by chapter volunteers and professional members."
        crumbs={[{ label: "Resources", to: "/news" }, { label: "Support Activity" }]}
      />
      <Section id="grievances" tone="white">
        <span id="grievence-counseling" className="sr-only">
          Grievances and counselling
        </span>
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Grievances & Counselling</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
              <p>
                <strong className="text-[var(--ipf-navy)]">Cultural challenges.</strong> IPF counselling volunteers can
                guide new Indian residents to overcome cultural challenges and to adopt the UAE as home, with respect
                for local laws and customs.
              </p>
              <p>
                <strong className="text-[var(--ipf-navy)]">Blue-collared workers.</strong> IPF remains at the forefront
                of counselling and mentoring to reduce hardship. During COVID-19, volunteers arranged chartered
                flights, food, shelter, clothing, bedding, masks, sanitizers and financial support.
              </p>
              <p>
                <strong className="text-[var(--ipf-navy)]">Local services.</strong> The programme also facilitates
                information forums on employment, medical and social services that can assist community members.
              </p>
              <p>
                Write to{" "}
                <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.grievanceEmail}`}>
                  {site.grievanceEmail}
                </a>{" "}
                for grievance support.
              </p>
            </div>
          </div>
          <FitImage src="/legacy-assets/images/grievence-couseling.png" alt="IPF counselling and grievance support" />
        </Container>
      </Section>
      <Section id="community">
        <span id="community-supprt" className="sr-only">
          Community support
        </span>
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">Community Support</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              IPF provides a forum for cultural, educational, recreational and philosophical activities. Dedicated
              volunteers include senior professionals in medicine, law, business, engineering and other fields, with
              diverse linguistic and regional representation in each chapter.
            </p>
          </div>
          <FitImage className="lg:order-first" src="/legacy-assets/images/community-support.png" alt="IPF community support" />
        </Container>
      </Section>
      <Section tone="white">
        <Container className="max-w-3xl">
          <InquiryForm intent="support" />
        </Container>
      </Section>
      <PageExtras page="support" />
    </>
  );
}
