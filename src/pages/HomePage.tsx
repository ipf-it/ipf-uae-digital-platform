import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BrandLoader } from "../components/BrandLoader";
import { BrandMark } from "../components/BrandMark";
import { MobileIntro } from "../components/MobileIntro";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Quote } from "../components/ui/Quote";
import { HeroSlideshow, ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { StatPill } from "../components/ui/StatPill";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { cn } from "../lib/utils";
import { impactStats } from "../data/platformContent";
import { img, site } from "../data/site";
import { markMobileIntroPlayed, shouldPlayMobileIntro } from "../lib/mobileIntro";

export default function HomePage() {
  const { content } = useCms();
  const markRef = useRef<HTMLDivElement>(null);
  const [introReady, setIntroReady] = useState(() => !shouldPlayMobileIntro());
  const finishIntro = useCallback(() => {
    markMobileIntroPlayed();
    setIntroReady(true);
  }, []);
  const leaders = content.leadership;
  const galleryPreview = content.galleryImages.slice(0, 6);
  const eventsPreview = content.eventHighlights.slice(0, 3);

  return (
    <>
      <DocumentTitle title="Official Community Website" />

      <div className="lg:hidden">
        {!introReady ? <MobileIntro anchorRef={markRef} onDone={finishIntro} /> : null}
        <section className="bg-[var(--ipf-navy)] text-white">
          <Container className="flex flex-col items-center py-10 text-center">
            <div ref={markRef} className={cn("flex flex-col items-center", !introReady && "invisible")}>
              <BrandLoader size={110} label={`${site.brandMark} emblem`} />
              <BrandMark className="mt-4" />
            </div>
            <div
              className={cn(
                "flex w-full flex-col items-center transition-opacity duration-500",
                introReady ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="mt-5">
                <Badge>Official community organisation</Badge>
              </div>
              <h1 className="mt-4 text-[1.85rem] font-bold leading-[1.15] text-white">
                Indian People's Forum
                <span className="mt-2 block text-xl font-semibold text-[var(--ipf-gold)]">United Arab Emirates</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/85">{site.homeIntro}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild variant="gold">
                  <Link to="/membership">{site.joinCta}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/leadership">Leadership</Link>
                </Button>
              </div>
              <div className="mt-8 grid w-full gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
                {impactStats.map((stat) => (
                  <StatPill key={stat.label} label={stat.label} value={stat.value} tone="dark" />
                ))}
              </div>
            </div>
          </Container>
        </section>
        <ImageCarousel
          framed={false}
          fit="contain"
          positionClass="object-center"
          slides={content.heroSlides}
          heightClass="aspect-[4/3] h-auto max-h-[52vh] w-full"
        />
      </div>

      <div className="hidden lg:block">
        <HeroSlideshow slides={content.heroSlides}>
          <Container className="relative py-16">
            <div className="max-w-xl">
              <Badge>Official community organisation</Badge>
              <h1 className="mt-4 text-5xl font-bold leading-[1.1] text-white">
                Indian People's
                <span className="block">Forum</span>
                <span className="mt-2 block text-2xl font-semibold text-[var(--ipf-gold)]">United Arab Emirates</span>
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-white/85">{site.homeIntro}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="gold">
                  <Link to="/membership">{site.joinCta}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/leadership">Meet the leadership</Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 grid max-w-3xl gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {impactStats.map((stat) => (
                <StatPill key={stat.label} label={stat.label} value={stat.value} tone="dark" />
              ))}
            </div>
          </Container>
        </HeroSlideshow>
      </div>

      <Section tone="white" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <Card tone="navy" flush className="h-auto overflow-hidden">
            <div className="flex flex-col lg:min-h-[22rem] lg:flex-row lg:items-stretch">
              <div className="order-2 flex min-w-0 flex-1 flex-col justify-center px-5 py-7 sm:px-10 sm:py-9 lg:order-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-gold)]">
                  President's message
                </p>
                <Quote className="mt-5" attribution={site.president}>
                  {site.presidentQuote}
                </Quote>
                <div className="mt-6 flex justify-center">
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/leadership">Read the full message</Link>
                  </Button>
                </div>
              </div>
              <div className="relative order-1 h-72 w-full shrink-0 bg-[var(--ipf-navy)] sm:h-80 lg:order-2 lg:h-auto lg:w-[42%] lg:min-w-[8.5rem] lg:max-w-[24rem]">
                <img
                  src={img.president}
                  alt={`${site.president}, ${site.presidentRole}`}
                  className="h-full w-full object-contain object-[center_22%] lg:absolute lg:inset-0 lg:object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--ipf-navy)] to-transparent lg:hidden" />
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-8 bg-gradient-to-r from-[var(--ipf-navy)] to-transparent sm:w-10 lg:block" />
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      <Section className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle
            eyebrow="Leadership"
            title="Central Committee"
            description="Office-bearers serving the Indian community across the UAE."
          />
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {leaders.map((member) => (
              <Link
                key={`${member.name}-${member.role}`}
                to="/leadership#committee"
                className="w-[9.5rem] shrink-0 lg:w-auto"
              >
                <PersonIdentity
                  layout="stack"
                  size="md"
                  src={member.image}
                  alt={member.name}
                  name={member.name}
                  role={member.role}
                />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" className="py-10 sm:py-12 lg:py-14">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <SectionTitle eyebrow="Who we are" title="Serving Indians in the UAE" description={site.whoWeAre} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/about">About IPF</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/chapters">UAE chapters</Link>
              </Button>
            </div>
          </div>
          <FramedPhoto
            src={img.indiaUae}
            alt="India and UAE partnership"
            fit="contain"
            imgClassName="aspect-[4/3] h-auto w-full bg-[var(--ipf-navy)]"
          />
        </Container>
      </Section>

      <Section className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle eyebrow="Gallery" title="Moments of service" description="Highlights from chapter events, welfare drives and community outreach." />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {galleryPreview.map((item) => (
              <FramedPhoto
                key={item.src}
                src={item.src}
                alt={item.alt}
                fit="contain"
                imgClassName="h-36 w-full bg-[var(--ipf-navy)] sm:h-44"
              />
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/gallery">Open gallery</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="white" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle eyebrow="Events" title="Programmes and public moments" />
          <CardGrid className="mt-8">
            {eventsPreview.map((event) => (
              <Card
                key={event.id}
                to="/events"
                eyebrow={event.date}
                title={event.title}
                description={event.body}
                image={event.slides[0]?.src}
                imageAlt={event.slides[0]?.alt ?? event.title}
                imageFit="contain"
              />
            ))}
          </CardGrid>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/events">All events</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="navy" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <Card size="lg" tone="navy" eyebrow="Get involved" title="Join the IPF mission in the UAE" description="Become a member, volunteer for community programmes, or write to us for support.">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <Link to="/membership">{site.joinCta}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/contact">Contact IPF</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/donate">Donate</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
