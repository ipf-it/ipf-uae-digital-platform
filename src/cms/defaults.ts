import { featuredHomeEvents, galleryImages, newsItems } from "../data/platformContent";
import type { CmsContent, CmsPageKey } from "./types";

const emptyExtras = {
  home: [],
  about: [],
  gallery: [],
  events: [],
  news: [],
  support: [],
  president: [],
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
  })),
  news: newsItems.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    image: item.image,
    excerpt: item.excerpt,
    body: item.body,
  })),
};
