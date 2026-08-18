import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { FitImage } from "../components/ui/FitImage";
import { Section } from "../components/ui/Section";
import { img } from "../data/site";

export default function DiscoverIndiaPage() {
  return (
    <>
      <DocumentTitle title="Discover India" />
      <PageHero
        eyebrow="Gallery"
        title="Discover India"
        description="Visit India: the incredible marvel of nature, history, diversity and culture. Article courtesy Dr. Nishi Singh, MD, MS, FRCPath, FIMSA."
        crumbs={[{ label: "Gallery", to: "/gallery" }, { label: "Discover India" }]}
      />
      <Section tone="white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <article className="space-y-5 text-sm leading-8 text-[var(--ipf-muted)]">
            <p>
              India — Bharat — Hindustan, officially the Republic of India, is the most populous democracy in the world
              and home to one of the longest continuous civilisations. Bounded by the Indian Ocean, the Arabian Sea and
              the Bay of Bengal, it is a continent of its own.
            </p>
            <p>
              It is the birthplace of Hinduism, Buddhism, Jainism and Sikhism, and a land where Christianity, Islam,
              Judaism and Zoroastrianism have also put down deep roots. Every ecosystem — from the Himalayas to a
              coastline of thousands of kilometres — beckons nature lovers and seekers of art, history, culture and
              spiritual solace.
            </p>
            <p>
              Four major climatic groupings predominate: tropical wet, tropical dry, subtropical humid, and montane.
              With UNESCO World Heritage Sites and countless temples, cities, wildlife sanctuaries and crafts, visitors
              are invited to go beyond the standard tourist circuit and savour the land in every nook and corner.
            </p>
            <p>
              Every 100 km the weaves change, as does the language or dialect. One trip is never enough. We welcome you
              to immerse yourself in local life, then understand why the world once called this land the Bird of Gold.
            </p>
            <p>
              Official travel information:{" "}
              <a className="font-semibold text-[var(--ipf-navy)]" href="https://www.incredibleindia.gov.in/" target="_blank" rel="noreferrer">
                incredibleindia.gov.in
              </a>
            </p>
          </article>
          <FitImage className="lg:order-first" src={img.indiaUae} alt="India and UAE cultural connection" />
        </Container>
      </Section>
    </>
  );
}
