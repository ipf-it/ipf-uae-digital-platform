import { Link } from "react-router-dom";
import { CommunityStats } from "../components/CommunityStats";
import { HomeGetInvolved } from "../components/HomeGetInvolved";
import { HomeHeroVideo } from "../components/HomeHeroVideo";
import { HomeIdentityStrip } from "../components/HomeIdentityStrip";
import { HomePresidentMessage } from "../components/HomePresidentMessage";
import { VandeMataramToggle } from "../components/VandeMataramToggle";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { img } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useLeadership } from "../hooks/useOrgDirectory";
import { useHomeContent } from "../hooks/useHomeContent";
import { PageExtras } from "../cms/PageExtras";
import { PageSectionRenderer } from "../components/PageSectionRenderer";

export default function HomePage() {
  const { t } = useLocale();
  const { content } = useCms();
  const { leadership } = useLeadership("global");
  const leaders = leadership.filter((entry) => entry.personImage).map((entry) => ({ name: entry.personName, role: entry.positionTitle, image: entry.personImage }));
  const galleryPreview = content.galleryImages.slice(0, 6);
  const { events: featuredEvents } = usePublicEvents({ tab: "upcoming", featured: true });
  const { events: upcomingEvents } = usePublicEvents({ tab: "upcoming" });
  const eventsPreview = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 3);
  const home = useHomeContent();
  const h = (key: keyof NonNullable<typeof home>, fallbackKey: string) => home?.[key] || t(fallbackKey);

  return (
    <div className="home-theme-page">
      <DocumentTitle title={t("home.documentTitle")} />

      {/* HOMEPAGE HERO — the approved IPF UAE WebM is the hero. All former
         overlay content (BrandLoader/BrandMark/badge/h1/subtitle/tricolour
         divider/intro paragraph/Join + Yuva + Meet the leaders CTAs/scroll
         chevron) has been removed. The Vande Mataram audio toggle is the
         only interactive element over the video. */}
      <div className="lg:hidden">
        <section className="ipf-home-hero relative flex min-h-[calc(100svh-var(--ipf-header-h,4.85rem)-var(--ipf-tabbar-h,4.75rem))] flex-col overflow-hidden">
          <HomeHeroVideo />
          <VandeMataramToggle />
        </section>
      </div>

      <div className="hidden lg:block">
        <section className="ipf-home-hero relative flex min-h-[calc(100svh-var(--ipf-header-h,6rem))] overflow-hidden">
          <HomeHeroVideo />
          <VandeMataramToggle />
        </section>
      </div>

      {/* HERO IDENTITY + STATISTICS — rendered as ONE continuous hero block
         (video → ivory identity → burgundy stats). Wrapped in a div so the
         global .home-theme-page > section::before saffron/green mandala
         pseudo-element does not target either section — the composition stays
         clean, with no rotating decorative mark. */}
      <div>
        <HomeIdentityStrip />
        <div id="community-stats">
          <CommunityStats />
        </div>
      </div>

      <div className="lg:hidden">
        <section id="home-photos" className="bg-[var(--ipf-navy)] px-2 pb-6">
          <ImageCarousel
            framed={false}
            fit="contain"
            chrome="below"
            positionClass="object-center"
            slides={content.heroSlides}
            heightClass="aspect-[4/3] h-auto max-h-[52vh] w-full"
          />
        </section>
      </div>

      <PageSectionRenderer pageId="home-extras" startTone="ivory" />

      {/* Light, premium President's Message set on the approved IPF heritage
         ivory artwork. Replaces the previous navy Card to create a deliberate
         rhythm change after the burgundy statistics strip above. */}
      <HomePresidentMessage />

      <Section className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle
            eyebrow={t("nav.leadership")}
            title={t("home.central")}
            description={t("home.centralDesc")}
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
            <SectionTitle eyebrow={h("who_eyebrow", "home.whoEyebrow")} title={h("who_title", "home.whoTitle")} description={h("who_body", "home.whoBody")} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/about">{t("home.aboutCta")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/chapters">{t("home.chaptersCta")}</Link>
              </Button>
            </div>
          </div>
          <FramedPhoto
            src={img.indiaUae}
            alt={t("page.discover.photoAlt")}
            fit="cover"
            imgClassName="aspect-[4/3] h-auto max-h-[22rem] w-full sm:max-h-[26rem]"
          />
        </Container>
      </Section>

      <Section className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle eyebrow={t("home.galleryEyebrow")} title={t("home.galleryTitle")} description={t("home.galleryDesc")} />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {galleryPreview.map((item) => (
              <FramedPhoto
                key={item.src}
                src={item.src}
                alt={item.alt}
                fit="cover"
                imgClassName="h-36 w-full sm:h-44"
              />
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/events#ipf-gallery">{t("home.openGallery")}</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="white" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <SectionTitle eyebrow={t("home.eventsEyebrow")} title={t("home.eventsTitle")} />
          <CardGrid className="mt-8">
            {eventsPreview.map((event) => (
              <Card
                key={event.id}
                to={`/events/${event.id}`}
                eyebrow={event.date}
                title={event.title}
                description={event.body}
                image={event.image || event.slides[0]?.src}
                imageAlt={event.slides[0]?.alt ?? event.title}
                imageFit="contain"
              />
            ))}
          </CardGrid>
          {eventsPreview.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--ipf-muted)]">{t("page.events.emptyUpcoming")}</p>
          ) : null}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/events">{t("home.allEvents")}</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Final CTA band directly above the footer — carries the Follow Us
         social group as its right-hand zone so socials live in exactly one
         public location. Wrapped in a div so the global home-theme-page
         saffron/green mandala pseudo-element does not render over it. */}
      <div>
        <HomeGetInvolved />
      </div>
      <PageExtras page="home" />
    </div>
  );
}
