export type CmsSlide = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

export type CmsSection = {
  id: string;
  type: "carousel" | "richText" | "photoGrid" | "cta";
  eyebrow?: string;
  title: string;
  description?: string;
  body?: string;
  slides?: CmsSlide[];
  buttons?: { label: string; to: string }[];
};

export type CmsEvent = {
  id: string;
  title: string;
  date: string;
  location?: string;
  body?: string;
  slides: CmsSlide[];
};

export type CmsNews = {
  slug: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  body: string;
};

export const cmsPageKeys = ["home", "about", "gallery", "events", "news", "support", "president"] as const;
export type CmsPageKey = (typeof cmsPageKeys)[number];

export type CmsContent = {
  heroSlides: CmsSlide[];
  galleryImages: CmsSlide[];
  extras: Record<CmsPageKey, CmsSection[]>;
  eventHighlights: CmsEvent[];
  news: CmsNews[];
};
