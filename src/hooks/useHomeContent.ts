import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useLocale } from "../i18n/LocaleProvider";

export type HomeContent = {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_intro: string;
  president_quote_title: string;
  president_quote_body: string;
  who_eyebrow: string;
  who_title: string;
  who_body: string;
  join_eyebrow: string;
  join_title: string;
  join_desc: string;
};

/** Live, locale-aware homepage hero/key-section content — replaces what used to be fixed i18n
 * keys with no admin edit path. Falls back to `null` (never throws) so callers can keep using
 * their existing t("home.*") fallback strings while this loads or if it's ever empty. */
export function useHomeContent() {
  const { locale } = useLocale();
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    let active = true;
    api<{ content: HomeContent }>(`/api/home-content?locale=${locale}`)
      .then((result) => {
        if (active) setContent(result.content);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [locale]);

  return content;
}
