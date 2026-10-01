import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { primaryNav as fallbackPrimaryNav, footerGroups as fallbackFooterGroups, mobileTabs as fallbackMobileTabs, utilityLinks as fallbackUtilityLinks, type NavGroup, type NavLinkItem } from "../data/navigation";
import { useLocale } from "../i18n/LocaleProvider";

export type FooterGroup = { title: string; links: NavLinkItem[] };

type NavResponse = {
  primaryNav: NavGroup[];
  footerGroups: FooterGroup[];
  mobileTabs: NavLinkItem[];
  utilityLinks: NavLinkItem[];
};

/** Live, admin-editable site navigation — replaces the old hardcoded src/data/navigation.ts
 * arrays (now only the typed fallback used before the API responds, or if it ever fails). Shaped
 * identically to those arrays so Header/Footer's rendering logic is unchanged — only the data
 * source moved. */
export function useNav() {
  const { locale } = useLocale();
  const [nav, setNav] = useState<NavResponse>({
    primaryNav: fallbackPrimaryNav,
    footerGroups: fallbackFooterGroups as unknown as FooterGroup[],
    mobileTabs: fallbackMobileTabs,
    utilityLinks: fallbackUtilityLinks,
  });

  useEffect(() => {
    let active = true;
    api<NavResponse>(`/api/nav?locale=${locale}`)
      .then((result) => {
        if (active && result.primaryNav.length > 0) setNav(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [locale]);

  return nav;
}
