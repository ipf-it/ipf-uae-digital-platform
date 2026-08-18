import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";

export default function ContactPage() {
  return (
    <>
      <DocumentTitle title="Contact Us" />
      <PageHero
        eyebrow="Contact"
        title="Contact IPF UAE"
        description="Write to the registered office in Ajman, or reach the chapter and council desks listed below."
        crumbs={[{ label: "Contact" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <InquiryForm intent="contact" />
          <aside className="space-y-5">
            <div className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6">
              <h2 className="text-lg font-bold text-[var(--ipf-navy)]">Registered office</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">{site.office}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
                Email:{" "}
                <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
            </div>
            <div className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-6">
              <h2 className="text-lg font-bold text-[var(--ipf-navy)]">Desks</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
                <li>
                  Abu Dhabi:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.abuDhabiEmail}`}>
                    {site.abuDhabiEmail}
                  </a>
                </li>
                <li>
                  Business Council:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.businessEmail}`}>
                    {site.businessEmail}
                  </a>
                </li>
                <li>
                  Grievances:{" "}
                  <a className="break-all font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.grievanceEmail}`}>
                    {site.grievanceEmail}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
