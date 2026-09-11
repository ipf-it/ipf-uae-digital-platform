import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { OrgTheme } from "../data/orgThemes";

type PageThemeContextValue = {
  theme: OrgTheme | null;
  setTheme: (theme: OrgTheme | null) => void;
};

const PageThemeContext = createContext<PageThemeContextValue>({ theme: null, setTheme: () => undefined });

/** Wraps the persistent site chrome (Header, Footer, etc.) so any page can hand up its themed
 * colours for shared elements to pick up — without this, a chapter/council page's colours only
 * ever reached the div it rendered inside, never the footer sitting alongside it in SiteLayout. */
export function PageThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<OrgTheme | null>(null);
  return <PageThemeContext.Provider value={{ theme, setTheme }}>{children}</PageThemeContext.Provider>;
}

export function usePageTheme() {
  return useContext(PageThemeContext);
}

/** Call from any page that wants shared chrome (currently: the footer) to match its theme while
 * mounted. Automatically reverts to the default look when the page unmounts (route changes away),
 * so this never leaks a chapter/council's colours onto unrelated pages. */
export function useSetPageTheme(theme: OrgTheme) {
  const { setTheme } = usePageTheme();
  useEffect(() => {
    setTheme(theme);
    return () => setTheme(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.primary, theme.secondary, theme.accent]);
}
