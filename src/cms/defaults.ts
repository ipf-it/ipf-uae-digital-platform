import { featuredHomeEvents, galleryImages, homeEventsCarousel, newsItems } from "../data/platformContent";
import type { CmsContent, CmsPageKey } from "./types";

const emptyExtras = {
  home: [],
  about: [],
  events: [],
  news: [],
  support: [],
  governance: [],
  history: [],
  membership: [],
  contact: [],
} satisfies Record<CmsPageKey, CmsContent["extras"][CmsPageKey]>;

export const defaultCmsContent: CmsContent = {
  heroSlides: featuredHomeEvents.map((item) => ({
    src: item.src,
    alt: item.alt,
    title: item.title,
    caption: item.caption,
  })),
  galleryImages: galleryImages.map((item) => ({ src: item.src, alt: item.alt })),
  extras: emptyExtras,
  // Homepage Events carousel source of truth. Each entry is CMS-editable
  // (title / date / location / image / body / category / emirate) via the
  // existing admin content pipeline — no code change required to add,
  // edit, remove, reorder, or toggle homepage visibility.
  eventHighlights: homeEventsCarousel.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    location: item.location,
    body: item.body,
    slides: [{ src: item.image, alt: item.alt }],
    category: item.category,
    emirate: item.emirate,
    startsAt: "startsAt" in item ? item.startsAt : undefined,
    isFree: true,
  })),
  news: newsItems.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    image: item.image,
    excerpt: item.excerpt,
    body: item.body,
  })),
  // Default fallback for the homepage Who We Are community photograph. This
  // is the approved IPF AHLAN MODI community gathering image already shipping
  // on the site; it is used only when the CMS payload has not provided a
  // dedicated whoWeAreImage. Admins replace it live from the CMS by editing
  // the whoWeAreImage field on /api/cms/content.
  whoWeAreImage: {
    src: "/legacy-assets/images/Ahlan_Modi.jpeg",
    alt: "IPF UAE community members at the Ahlan Modi welcome event, Dubai",
  },
};
