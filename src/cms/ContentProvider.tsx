import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { defaultCmsContent } from "./defaults";
import type { CmsContent } from "./types";

type CmsContextValue = {
  content: CmsContent;
  ready: boolean;
  refresh: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  content: defaultCmsContent,
  ready: false,
  refresh: async () => undefined,
});

async function loadContent(): Promise<CmsContent> {
  try {
    const response = await fetch("/api/cms/content");
    if (!response.ok) return defaultCmsContent;
    const raw = (await response.json()) as Partial<CmsContent>;
    return {
      ...defaultCmsContent,
      ...raw,
      extras: { ...defaultCmsContent.extras, ...(raw.extras ?? {}) },
      leadership: raw.leadership?.length ? raw.leadership : defaultCmsContent.leadership,
      heroSlides: raw.heroSlides?.length ? raw.heroSlides : defaultCmsContent.heroSlides,
      galleryImages: raw.galleryImages?.length ? raw.galleryImages : defaultCmsContent.galleryImages,
    };
  } catch {
    return defaultCmsContent;
  }
}

export function ContentProvider({ children }: PropsWithChildren) {
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    const next = await loadContent();
    setContent(next);
    setReady(true);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(() => ({ content, ready, refresh }), [content, ready]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  return useContext(CmsContext);
}
