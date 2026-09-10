import { committeeMembers, featuredHomeEvents, galleryImages, newsItems } from "../data/platformContent";
import type { CmsContent, CmsPageKey } from "./types";

const emptyExtras = {
  home: [],
  about: [],
  gallery: [],
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
  eventHighlights: featuredHomeEvents.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    location: item.location,
    body: item.body,
    slides: [{ src: item.src, alt: item.alt, caption: item.caption }],
    category: item.id.includes("conclave") ? "Community" : item.id.includes("inauguration") ? "Community" : "National",
    emirate: item.id.includes("hardeep") ? "abu-dhabi" : item.id.includes("conclave") ? "dubai" : item.id.includes("inauguration") ? "ajman" : "uae",
    startsAt: item.id === "office-inauguration-2021" ? "2021-01-21T10:00:00+04:00" : item.id === "business-conclave-2021" ? "2021-10-03T10:00:00+04:00" : item.id === "hardeep-singh-puri" ? "2021-11-17T10:00:00+04:00" : item.id === "jaishankar-meeting" ? "2022-09-02T10:00:00+04:00" : undefined,
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
  leadership: committeeMembers.map((member) => ({
    name: member.name,
    role: member.role,
    image: member.image,
  })),
};
