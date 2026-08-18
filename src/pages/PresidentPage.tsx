import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { PageExtras } from "../cms/PageExtras";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { img } from "../data/site";

export default function PresidentPage() {
  return (
    <>
      <DocumentTitle title="President's Message" />
      <PageHero
        eyebrow="Leadership"
        title="President's Message"
        description="A message from Shri Jitendra Vaidya, President of Indian People's Forum UAE."
        crumbs={[{ label: "About IPF", to: "/about" }, { label: "President's Message" }]}
      />
      <Section tone="white">
        <Container>
          <figure className="mx-auto max-w-[200px] text-center">
            <FramedPhoto
              src={img.president}
              alt="Shri Jitendra Vaidya, President IPF UAE"
              imgClassName="h-56 object-top"
            />
            <figcaption className="mt-4">
              <p className="text-lg font-bold text-[var(--ipf-navy)]">Shri Jitendra Vaidya</p>
              <p className="mt-1 text-sm text-[var(--ipf-muted)]">President – IPF UAE</p>
            </figcaption>
          </figure>
          <div className="mx-auto mt-6 h-1 w-24 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]" />
          <article className="mx-auto mt-8 max-w-3xl space-y-5 text-sm leading-8 text-[var(--ipf-muted)] sm:text-base">
              <p>Dear Friends,</p>
              <p>Namaskar and greetings to my entire fellow Indians in the UAE.</p>
              <p>
                Indian People's Forum has grown from strength to strength since inception, and we are proud to serve the
                Indian community in the UAE. Dedicated efforts from the team and years of service were recognised, and
                IPF today holds the licence for socio-cultural activities in the UAE, with our registered office in the
                Emirate of Ajman.
              </p>
              <p>
                IPF is a non-profit organisation working solely with the motto of serving the Indian community. We have
                eight chapters across the Emirates. Through honest and selfless volunteerism we help build cultural ties
                between India and the UAE, and extend a helping hand for the welfare of every Non-Resident Indian living
                here.
              </p>
              <p>
                Our volunteers comprise senior professionals with diverse linguistic and regional representation in each
                chapter. In IPF we have representation from all the states of India, and we believe in
                "अनेकता में एकता भारत की विशेषता". IPF is a true follower of the principle "सबका साथ, सबका विकास और सबका विश्वास".
              </p>
              <p>
                Our logo embodies oneness and the principle of Vasudhaiva Kutumbakam — One Family, One Team, One Dream,
                One Journey, One Aspiration and One Belief of unity and achievement.
              </p>
              <p>
                During COVID lockdown and distress, IPF arranged independent chartered flights to help relocate people,
                and arranged food, shelter, clothing, bedding, masks, sanitizers and financial support. A long list of
                national and cultural festivals is celebrated to keep the community engaged, thousands of miles away from
                home.
              </p>
              <p>
                Our next goal is that today we have our own office, and we will have our own building. The way our
                community showers love and affection, we will fulfil this dream.
              </p>
              <p>
                We have the excellent backing of both the Indian Embassy and the Indian Consulate, to whom we are highly
                indebted. I thank the Indian Ambassador, the Indian Consulate and their entire teams for working to serve
                the community.
              </p>
              <p>I invite all of you to join us in this journey of serving the Indian community of the UAE. Jai Hind.</p>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link to="/membership">Join IPF</Link>
                </Button>
              </div>
            </article>
        </Container>
      </Section>
      <PageExtras page="president" />
    </>
  );
}
