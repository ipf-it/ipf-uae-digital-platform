import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { BrandLoader } from "../components/BrandLoader";
import { BrandMark } from "../components/BrandMark";
import { CommunityStats } from "../components/CommunityStats";
import { MobileIntro } from "../components/MobileIntro";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Quote } from "../components/ui/Quote";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { cn } from "../lib/utils";
import { img, site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useLeadership } from "../hooks/useOrgDirectory";
import { markMobileIntroPlayed, shouldPlayMobileIntro } from "../lib/mobileIntro";
import { PageExtras } from "../cms/PageExtras";

export default function HomePage() {
  const { t } = useLocale();
  const { content } = useCms();
  const markRef = useRef<HTMLDivElement>(null);
  const [introReady, setIntroReady] = useState(() => !shouldPlayMobileIntro());
  const finishIntro = useCallback(() => {
    markMobileIntroPlayed();
    setIntroReady(true);
  }, []);
  const { leadership } = useLeadership("global");
  const leaders = leadership.filter((entry) => entry.personImage).map((entry) => ({ name: entry.personName, role: entry.positionTitle, image: entry.personImage }));
  const galleryPreview = content.galleryImages.slice(0, 6);
  const { events: upcomingEvents } = usePublicEvents({ tab: "upcoming" });
  const eventsPreview = upcomingEvents.slice(0, 3);

  return (
    <div className="home-theme-page">
      <DocumentTitle title={t("home.documentTitle")} />

      <div className="lg:hidden">
        {!introReady ? <MobileIntro anchorRef={markRef} onDone={finishIntro} /> : null}
        <section className="ipf-home-hero flex min-h-[calc(100svh-var(--ipf-header-h,4.85rem)-var(--ipf-tabbar-h,4.75rem))] flex-col overflow-hidden text-white"><div className="ipf-theme-mandala" aria-hidden="true"/><div className="ipf-theme-ribbon" aria-hidden="true"/>
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
                <Badge>{t("home.badge")}</Badge>
              </div>
              <h1 className="home-hero-title-mobile mt-4 font-bold leading-[1.15] text-white">
                {t("home.title")}
                <span className="mt-2 block text-xl font-semibold text-[var(--ipf-gold)]">{t("home.uae")}</span>
              </h1>
              <p className="mt-4 max-w-md text-pretty text-sm leading-7 text-white/85">{t("home.intro")}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild variant="gold">
                  <Link to="/membership">{t("nav.join")}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/yuva">{t("nav.yuva")}</Link>
                </Button>
              </div>
              <a
                href="#home-photos"
                className="mt-6 inline-flex flex-col items-center gap-0.5 text-[11px] font-semibold tracking-wide text-white/90"
              >
                {t("home.scroll")}
                <ChevronDown className="size-4 animate-bounce" />
              </a>
            </div>
          </Container>
        </section>
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

      <div className="hidden lg:block">
        <section className="ipf-home-hero relative flex min-h-[calc(100svh-var(--ipf-header-h,6rem))] overflow-hidden text-white"><div className="ipf-theme-mandala" aria-hidden="true"/><div className="ipf-theme-ribbon" aria-hidden="true"/><div className="ipf-theme-weave" aria-hidden="true"/>
          <Container className="relative flex min-h-0 flex-1 flex-col justify-center py-10 pb-28 text-left">
            <div className="max-w-5xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ipf-gold)]">सेवा · संस्कृति · समुदाय</p>
              <h1 className="home-hero-title-desktop mt-5 font-bold leading-[1.04] text-white">
                {t("home.title")}
                <span className="mt-3 block text-2xl font-semibold tracking-wide text-[var(--ipf-gold)]">{t("home.uae")}</span>
              </h1>
              <div className="mt-5 h-1 w-28 bg-[linear-gradient(90deg,var(--ipf-saffron)_0_33%,#fff_33%_66%,var(--ipf-green)_66%)]" />
              <p className="mt-5 max-w-lg text-pretty text-base leading-8 text-white/85">{t("home.intro")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="gold">
                  <Link to="/membership">{t("nav.joinLong")}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/yuva">{t("nav.yuva")}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/leadership">{t("home.meetLeaders")}</Link>
                </Button>
              </div>
            </div>
            <a
              href="#community-stats"
              className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-0.5 text-[11px] font-semibold tracking-wide text-white/80"
            >
              {t("home.scroll")}
              <ChevronDown className="size-4 animate-bounce" />
            </a>
          </Container>
        </section>
      </div>

      <div id="community-stats">
        <CommunityStats />
      </div>

      <Section tone="ivory" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <Card tone="navy" flush className="h-auto overflow-hidden">
            <div className="flex flex-col lg:min-h-[22rem] lg:flex-row lg:items-stretch">
              <div className="order-2 flex min-w-0 flex-1 flex-col justify-center px-5 py-7 sm:px-10 sm:py-9 lg:order-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-gold)]">
                  {t("home.presidentMsg")}
                </p>
                <Quote className="mt-5" attribution={site.president}>
                  {t("home.presidentQuote")}
                </Quote>
                <div className="mt-6 flex justify-center">
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/leadership">{t("home.readFull")}</Link>
                  </Button>
                </div>
              </div>
              <div className="relative order-1 h-72 w-full shrink-0 bg-[var(--ipf-navy)] sm:h-80 lg:order-2 lg:h-auto lg:w-[42%] lg:min-w-[8.5rem] lg:max-w-[24rem]">
                <img
                  src={img.president}
                  alt={`${site.president}, ${site.presidentRole}`}
                  decoding="async"
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
            <SectionTitle eyebrow={t("home.whoEyebrow")} title={t("home.whoTitle")} description={t("home.whoBody")} />
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
            fit="contain"
            imgClassName="aspect-[4/3] h-auto w-full bg-[var(--ipf-navy)]"
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
                fit="contain"
                imgClassName="h-36 w-full bg-[var(--ipf-navy)] sm:h-44"
              />
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/gallery">{t("home.openGallery")}</Link>
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

      <Section tone="navy" className="py-10 sm:py-12 lg:py-14">
        <Container>
          <Card size="lg" tone="navy" eyebrow={t("home.getInvolved")} title={t("home.joinTitle")} description={t("home.joinDesc")}>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <Link to="/membership">{t("nav.joinLong")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/yuva">{t("nav.yuva")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/contact">{t("home.contactIpf")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/donate">{t("nav.donate")}</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
      <PageExtras page="home" />
    </div>
  );
}
