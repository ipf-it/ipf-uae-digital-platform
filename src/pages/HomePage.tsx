import { Link } from "react-router-dom";
import { BrandLoader } from "../components/BrandLoader";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { PersonIdentity } from "../components/ui/PersonIdentity";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { HeroSlideshow, ImageCarousel } from "../components/ui/ImageCarousel";
import { PageExtras } from "../cms/PageExtras";
import { useCms } from "../cms/ContentProvider";
import { Section } from "../components/ui/Section";
import { SectionTitle } from "../components/ui/SectionTitle";
import { StatPill } from "../components/ui/StatPill";
import { CalendarDays, HeartHandshake, Landmark, Newspaper, Users } from "lucide-react";
import {
  chapterList,
  featuredInitiatives,
  glimpseStories,
  historyMilestones,
  impactStats,
  latestUpdates,
  missionPillars,
  servicePanels,
  upcomingEvents,
} from "../data/platformContent";
import { img } from "../data/site";

const quickLinks = [
  { to: "/membership", label: "Membership", icon: Users },
  { to: "/support", label: "Community Support", icon: HeartHandshake },
  { to: "/history", label: "Our Journey", icon: Landmark },
  { to: "/chapters", label: "UAE Chapters", icon: CalendarDays },
];

export default function HomePage() {
  const { content } = useCms();
  return (
    <>
      <DocumentTitle title="Official Community Website" />

      <div className="lg:hidden">
        <ImageCarousel
          framed={false}
          fit="cover"
          positionClass="object-[center_62%]"
          slides={content.heroSlides}
          heightClass="aspect-video h-auto max-h-[70vh] w-full"
        />
        <section className="bg-[var(--ipf-navy)] text-white">
          <Container className="flex flex-col items-center py-12 text-center">
            <BrandLoader size={110} label="Official emblem of Indian People's Forum UAE" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ipf-gold)]">
              Official emblem
            </p>
            <div className="mt-5">
              <Badge>Official community organisation</Badge>
            </div>
            <h1 className="mt-4 text-[1.85rem] font-bold leading-[1.15] text-white">
              Indian People's Forum
              <span className="mt-2 block text-xl font-semibold text-[var(--ipf-gold)]">United Arab Emirates</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
              Since 2014, IPF has served the Indian community in the UAE through welfare support, cultural
              programmes, and coordination with Indian missions.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold">
                <Link to="/contact">Contact IPF</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/about">About IPF</Link>
              </Button>
            </div>
            <div className="mt-8 grid w-full gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
              {impactStats.map((stat) => (
                <StatPill key={stat.label} label={stat.label} value={stat.value} tone="dark" />
              ))}
            </div>
          </Container>
        </section>
      </div>

      <div className="hidden lg:block">
        <HeroSlideshow slides={content.heroSlides} fillViewport>
          <Container className="relative py-10 lg:py-12">
            <div className="max-w-xl">
              <Badge>Official community organisation</Badge>
              <h1 className="mt-4 text-[1.85rem] font-bold leading-[1.15] text-white sm:text-[2.15rem] md:text-5xl">
                Indian People's
                <span className="block">Forum</span>
                <span className="mt-2 block text-xl font-semibold text-[var(--ipf-gold)] sm:text-2xl">
                  United Arab Emirates
                </span>
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/85 sm:text-[15px]">
                Since 2014, IPF has served the Indian community in the UAE through welfare support, cultural
                programmes, and coordination with Indian missions.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="gold">
                  <Link to="/contact">Contact IPF</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/about">About IPF</Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 flex max-w-xl flex-col items-start gap-4 border border-white/15 bg-[var(--ipf-navy)]/55 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
              <BrandLoader size={96} label="Official emblem of Indian People's Forum UAE" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ipf-gold)]">
                  Official emblem
                </p>
                <p className="mt-1 text-sm leading-6 text-white/85">
                  Vasudhaiva Kutumbakam — one family, one team, serving Indians in the UAE.
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {impactStats.map((stat) => (
                <StatPill key={stat.label} label={stat.label} value={stat.value} tone="dark" />
              ))}
            </div>
          </Container>
        </HeroSlideshow>
      </div>

      <Section tone="white" className="py-5 sm:py-6 lg:py-6">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] px-4 py-3 text-sm font-semibold text-[var(--ipf-navy)] transition hover:border-[var(--ipf-navy)]"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="About IPF UAE"
            title="Serving the Indian community with integrity"
            description="IPF is open to all Indians in the UAE irrespective of caste, creed, ethnicity or religion. The forum promotes unity, cultural relations, and support for those in need."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {missionPillars.map((pillar) => (
              <Card key={pillar.title} title={pillar.title} description={pillar.description} />
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/about">Read the full about page</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionTitle
            eyebrow="Community services"
            title="Support channels for members and residents"
            description="Structured help for membership, grievances, counselling, and cultural-welfare programmes across chapters."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {servicePanels.map((item) => (
              <Link key={item.title} to={item.to} className="block">
                <Card title={item.title} description={item.description} />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="Flagship initiatives"
            title="Welfare, health and cultural action"
            description="Programmes aligned with the needs of residents and workers, executed through chapter volunteers across the UAE."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featuredInitiatives.map((item) => (
              <Link key={item.title} to={item.to} className="min-w-0 bg-[var(--ipf-paper)]">
                <FramedPhoto src={item.image} alt={item.title} imgClassName="aspect-[4/3] h-auto w-full" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[var(--ipf-navy)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionTitle
            eyebrow="IPF journey"
            title="History and milestones of service"
            description="A volunteer-led journey from informal community support in 2014 to an organised eight-chapter presence across the UAE."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {historyMilestones.map((mile) => (
              <article key={mile.title} className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{mile.year}</p>
                <h3 className="mt-2 text-lg font-bold text-[var(--ipf-navy)]">{mile.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{mile.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/history">View full history</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-6 lg:grid-cols-2">
          <Card title="Events calendar" description="Chapter and central programmes presented in a clear public timeline.">
            <div className="mt-4 space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.title} className="border border-[var(--ipf-line)] bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ipf-green)]">{event.month}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--ipf-navy)]">{event.title}</p>
                  <p className="mt-1 text-xs text-[var(--ipf-muted)]">{event.level}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button asChild variant="outline" size="sm">
                <Link to="/events">Open calendar</Link>
              </Button>
            </div>
          </Card>
          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <Newspaper size={17} />
                News and updates
              </span>
            }
            description="Public highlights for members, families and the wider Indian community in the UAE."
          >
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--ipf-muted)]">
              {latestUpdates.map((update) => (
                <li key={update.title}>
                  <Link className="hover:text-[var(--ipf-navy)]" to={update.to}>
                    • {update.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Button asChild variant="outline" size="sm">
                <Link to="/news">All news</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>

      <Section tone="white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <div className="border border-[var(--ipf-line)] bg-[var(--ipf-navy)] p-5 text-white sm:p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--ipf-gold)]">President's message</p>
            <div className="mt-5">
              <PersonIdentity
                size="sm"
                tone="dark"
                src={img.president}
                alt="Shri Jitendra Vaidya, President IPF UAE"
                name="Shri Jitendra Vaidya"
                role="President, IPF UAE"
              />
            </div>
            <p className="mt-5 text-sm leading-7 text-white/85">
              We believe in अनेकता में एकता. IPF invites every member of the community to join this journey of service,
              unity and responsibility.
            </p>
            <div className="mt-6">
              <Button asChild variant="secondary">
                <Link to="/president">Read the full message</Link>
              </Button>
            </div>
          </div>
          <div>
            <SectionTitle
              title="Leadership and public trust"
              description="IPF works with volunteers across professions — medicine, law, business, culture and social service — to support the diaspora in a lawful and organised manner."
            />
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/committee">View committee</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container>
          <SectionTitle
            eyebrow="UAE presence"
            title="Chapter network across the Emirates"
            description="Local chapter teams provide support and programme execution through volunteer leadership in every emirate."
            centered
            tone="light"
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chapterList.map((chapter) => (
              <Link
                key={chapter}
                to="/chapters"
                className="border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                {chapter}
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="Our gallery"
            title="Moments of participation and service"
            description="Highlights from chapter events, office inauguration, welfare drives and community outreach."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {glimpseStories.map((story) => (
              <Link key={story.title} to={story.to} className="min-w-0 bg-[var(--ipf-paper)]">
                <FramedPhoto src={story.image} alt={story.title} imgClassName="aspect-[4/3] h-auto w-full" />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{story.date}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--ipf-navy)]">{story.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{story.text}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/gallery">Open gallery</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <PageExtras page="home" />

      <Section tone="white">
        <Container>
          <div className="border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] px-5 py-8 sm:px-8 sm:py-10">
            <SectionTitle
              eyebrow="Get involved"
              title="Join the IPF mission in the UAE"
              description="Become a member, volunteer for community programmes, or write to us for support and collaboration."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/privileges">Become a volunteer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/membership">Membership enquiry</Link>
              </Button>
            </div>
            <div className="mt-6 text-sm leading-7 text-[var(--ipf-muted)]">
              <p>Email: info@ipf-uae.org</p>
              <p>Office 208, Horizon Towers, Al Rashidiya, Ajman, UAE</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
