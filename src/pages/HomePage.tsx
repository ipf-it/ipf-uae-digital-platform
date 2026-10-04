import { CommunityStats } from "../components/CommunityStats";
import { HomeEvents } from "../components/HomeEvents";
import { HomeGallery } from "../components/HomeGallery";
import { HomeGetInvolved } from "../components/HomeGetInvolved";
import { HomeHeroVideo } from "../components/HomeHeroVideo";
import { HomeIdentityStrip } from "../components/HomeIdentityStrip";
import { HomePresidentMessage } from "../components/HomePresidentMessage";
import { HomeWhoWeAre } from "../components/HomeWhoWeAre";
import { VandeMataramToggle } from "../components/VandeMataramToggle";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { ImageCarousel } from "../components/ui/ImageCarousel";
import { useCms } from "../cms/ContentProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";
import { PageSectionRenderer } from "../components/PageSectionRenderer";

export default function HomePage() {
  const { t } = useLocale();
  const { content } = useCms();

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

      {/* The homepage Leaders / Central Committee section has been removed —
         leadership presence on the homepage is now carried by the President's
         Message above. The Leaders page, /leadership route, About → Leaders
         navigation entry, useLeadership hook and leadership data are all
         retained. */}

      {/* Premium Who We Are editorial band — CMS-controlled community image
         on the left, approved copy + three heritage values + Discover CTA
         on the right. Replaces the previous compact ivory section. */}
      <HomeWhoWeAre />

      {/* Premium editorial Events carousel on the approved waterfront
         heritage background. Reads directly from content.eventHighlights
         (six founder-selected IPF programmes seeded in
         src/data/platformContent.ts → homeEventsCarousel, CMS-editable).
         Six real cards rendered twice back-to-back for a seamless
         continuous loop; 5 s cycle with native smooth-scroll transition.
         Pauses on hover / focus / touch / tab-hidden; prefers-reduced-
         motion disables autoplay. Wrapped in a div so the global
         .home-theme-page > section::before saffron/green mandala
         pseudo-element does not rotate over the section. */}
      <div>
        <HomeEvents />
      </div>

      {/* Premium Gallery editorial mosaic on the approved cream arabesque
         skyline background. Reads from content.galleryImages (CMS). Slow
         crossfade autoplay (9 s) — a deliberately different rhythm from
         Events so the two sections never pulse together. */}
      <HomeGallery />

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
