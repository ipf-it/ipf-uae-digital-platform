import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { PageExtras } from "../cms/PageExtras";
import { Section } from "../components/ui/Section";
import { aboutAims, aboutResponsibilities, aboutValues, aboutVision } from "../data/platformContent";
import { img } from "../data/site";

export default function AboutPage() {
  return (
    <>
      <DocumentTitle title="About IPF" />
      <PageHero
        eyebrow="About Us"
        title="Indian People's Forum UAE"
        description="IPF is open to all Indians irrespective of caste, creed, ethnicity or religion. We promote unity, foster goodwill and cultural relations in the UAE, and support fellow Indians in need."
        crumbs={[{ label: "About IPF" }]}
      />
      <Section tone="white">
        <Container className="grid items-stretch gap-8 md:grid-cols-2">
          <div className="space-y-5 text-sm leading-7 text-[var(--ipf-muted)] sm:text-base">
            <p>
              We aim to provide a supporting link between Indian government missions and citizens. We endeavour to
              build cultural ties between India and the UAE through social engagement, and to uphold a reputation for
              honesty, magnanimity and professionalism.
            </p>
            <p>
              We aspire to offer a helping hand for the welfare of every Non-Resident Indian living in the UAE and to
              help resolve issues faced by community members. With the dream of a peaceful, just and prosperous India,
              we wish to enhance people-to-people connect between India and the UAE, and invite other nationalities to
              experience India's culture and heritage.
            </p>
            <p>
              Members come from all walks of life. They work as volunteers and contribute to the social development and
              well-being of fellow Indians.
            </p>
          </div>
          <FitImage fill fit="contain" src={img.indiaUae} alt="India and UAE partnership" />
        </Container>
      </Section>

      <Section id="vision">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Our Vision</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
              A peaceful, just, tolerant and prosperous Indian community in the UAE
            </h2>
            <ul className="mt-5 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
              {aboutVision.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <FitImage className="lg:order-first" src={img.vision} alt="IPF vision of community unity" />
        </Container>
      </Section>

      <Section id="values" tone="white">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Satyameva Jayate</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">Our Values</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              We aim to gain credibility by adhering to IPF's commitments — displaying honesty and integrity, and
              reaching IPF goals solely through honourable conduct.
            </p>
            <CardGrid columns={2} className="mt-6">
              {aboutValues.map((value) => (
                <Card key={value} size="sm" tone="ivory" title={value} />
              ))}
            </CardGrid>
          </div>
          <FitImage
            fit="contain"
            src={img.values}
            alt="Satyameva Jayate — State Emblem of India"
            className="mx-auto h-[220px] w-full max-w-[280px] sm:h-[280px]"
          />
        </Container>
      </Section>

      <Section id="aims">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Enhancing Indian ethos</p>
          <h2 id="aim-objective" className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
            Aims & Objectives
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            To foster a peaceful, just and prosperous Indian community in the UAE where diversity is valued and
            celebrated, cultural heritage is nurtured, and the hope of all Indians remains vibrant, inspired and
            empowered.
          </p>
          <CardGrid columns={2} className="mt-8">
            {aboutAims.map((item, index) => (
              <Card key={item} size="sm" eyebrow={`0${index + 1}`.slice(-2)} description={item} />
            ))}
          </CardGrid>
        </Container>
      </Section>

      <Section id="responsibility" tone="white">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Enabling & empowering</p>
            <h2 id="our-responsibility" className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">
              Our Responsibility
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ipf-muted)]">
              To work closely with concerned authorities on issues towards the betterment of society, including
              awareness among young children and adults. Educational hand-outs in regional languages guide the
              community to respect local sentiments and adhere to the laws of the UAE.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
              {aboutResponsibilities.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <FitImage src={img.responsibility} alt="IPF community responsibility programmes" />
        </Container>
      </Section>
      <PageExtras page="about" />
    </>
  );
}
