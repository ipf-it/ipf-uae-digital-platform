import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useLocale } from "../i18n/LocaleProvider";

export type OrgChapter = {
  id: string;
  name: string;
  description: string;
  emirateCode: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  image: string;
};

export type OrgCouncil = {
  id: string;
  kind: "state" | "special";
  region: string;
  name: string;
  description: string;
  contactEmail: string;
  image: string;
};

export type LeadershipEntry = {
  id: string;
  personId: string | null;
  personName: string;
  personImage: string;
  positionTitle: string;
  startedAt: string | null;
};

/** Live, locale-aware chapter/council/leadership directory — replaces the old hardcoded
 * src/data/orgNav.ts arrays. Falls back to an empty list (never throws) so a transient API
 * failure degrades to "nothing shown yet" rather than a broken page. */
export function useOrgChapters() {
  const { locale } = useLocale();
  const [chapters, setChapters] = useState<OrgChapter[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ chapters: OrgChapter[] }>(`/api/org/chapters?locale=${locale}`)
      .then((result) => {
        if (active) setChapters(result.chapters);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  return { chapters, ready };
}

export function useOrgCouncils() {
  const { locale } = useLocale();
  const [councils, setCouncils] = useState<OrgCouncil[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ councils: OrgCouncil[] }>(`/api/org/councils?locale=${locale}`)
      .then((result) => {
        if (active) setCouncils(result.councils);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  return { councils, ready };
}

export function useLeadership(scopeType: "global" | "chapter" | "council" = "global", scopeId?: string) {
  const { locale } = useLocale();
  const [leadership, setLeadership] = useState<LeadershipEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    const params = new URLSearchParams({ locale, scopeType });
    if (scopeId) params.set("scopeId", scopeId);
    api<{ leadership: LeadershipEntry[] }>(`/api/org/leadership?${params.toString()}`)
      .then((result) => {
        if (active) setLeadership(result.leadership);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [locale, scopeType, scopeId]);

  return { leadership, ready };
}
