import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleProvider";

export default function GovernancePage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("nav.governance")} />
      <PageHero
        eyebrow={t("page.governance.eyebrow")}
        title={t("page.governance.title")}
        description={t("page.governance.desc")}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("nav.governance") }]}
      />
      <Section id="bye-law" tone="white">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.bye")}</h2>
          <p>
            Indian People's Forum UAE is a licensed socio-cultural organisation with a registered office in Ajman. The
            Managing Committee, comprising the Central Committee and Chapter Convenors, governs the forum according to
            its rules.
          </p>
          <p>
            Membership is open to persons of Indian origin living in the UAE with a valid residential visa. The
            Executive Committee considers applications and informs applicants of the decision.
          </p>
          <p>
            Chapters are IPF sub-bodies assigned to cities and emirates. IPF currently maintains eight chapters covering
            the UAE.
          </p>
        </Container>
      </Section>
      <Section id="ethics">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.ethics")}</h2>
          <p>IPF's published values are Integrity, Transparency, Professionalism and Accountability.</p>
          <ul className="space-y-2">
            <li>• Volunteers and members shall conduct themselves honourably in all community work.</li>
            <li>• The forum is open to all Indians irrespective of caste, creed, ethnicity or religion.</li>
            <li>• Members shall respect the laws, customs and dignity of the United Arab Emirates.</li>
            <li>• Community support is offered without discrimination and without personal commercial interest.</li>
            <li>• Office-bearers shall keep organisational communication factual and respectful.</li>
          </ul>
        </Container>
      </Section>
      <Section id="it-policy" tone="white">
        <Container className="max-w-3xl space-y-4 text-sm leading-7 text-[var(--ipf-muted)]">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.governance.it")}</h2>
          <p>
            Official public information is published on this website and through IPF's recognised social channels. Media
            and IT volunteers shall not publish confidential member data, grievance case details, or unverified claims
            in the name of IPF.
          </p>
          <p>
            Photographs from events may be used for organisational outreach. Requests to remove a photograph can be sent
            to info@ipf-uae.org. A fuller IT policy document will be attached when the CMS is connected.
          </p>
        </Container>
      </Section>
    </>
  );
}
