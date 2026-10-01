import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useLocale } from "../i18n/LocaleProvider";

export type PageSectionSlide = { src: string; alt: string; title?: string; caption?: string };
export type PageSectionButton = { label: string; to: string };
export type PageSectionStat = { label: string; value?: string };

export type PageSection = {
  id: string;
  type: "richText" | "photoGrid" | "carousel" | "cta" | "statList" | "imageText";
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  image: string;
  slides: PageSectionSlide[];
  buttons: PageSectionButton[];
  stats: PageSectionStat[];
};

/** Live, locale-aware content blocks for one page — replaces both hardcoded page JSX and the old
 * single-blob site_content "extras". Falls back to an empty list (never throws) so a transient API
 * failure degrades to "nothing extra shown" rather than a broken page. */
export function usePageSections(pageId: string) {
  const { locale } = useLocale();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    api<{ sections: PageSection[] }>(`/api/pages/${encodeURIComponent(pageId)}/sections?locale=${locale}`)
      .then((result) => {
        if (active) setSections(result.sections);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [pageId, locale]);

  return { sections, ready };
}
