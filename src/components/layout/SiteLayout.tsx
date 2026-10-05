import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { FaqAssistant } from "../FaqAssistant";
import { TricolorWaves } from "../TricolorWaves";
import { VandeMataramButton, VandeMataramProvider } from "../VandeMataramController";
import { ContentProvider } from "../../cms/ContentProvider";
import { MemberProvider } from "../../cms/MemberProvider";
import { LocaleProvider, useLocale } from "../../i18n/LocaleProvider";
import { PageThemeProvider } from "../../lib/PageTheme";
import { img } from "../../data/site";
import { markMobileIntroPlayed } from "../../lib/mobileIntro";
import { MobileTabBar } from "./MobileTabBar";
import { ScrollToTop } from "./ScrollToTop";
import { PageLoader } from "./PageLoader";

function LayoutShell() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const routeTheme = pathname.startsWith("/chapters") || pathname.startsWith("/explore-uae")
    ? "uae"
    : pathname.startsWith("/councils") || pathname.startsWith("/discover-india")
      ? "heritage"
      : /^\/(events|support|ipf-cares|yuva|jobs|donate)/.test(pathname)
        ? "service"
        : /^\/(membership|register|sign-in|portal|privileges|testimonials)/.test(pathname)
          ? "community"
          : "institutional";

  useEffect(() => {
    if (pathname !== "/") markMobileIntroPlayed();
  }, [pathname]);

  return (
    /* VandeMataramProvider wraps the ENTIRE layout shell — the single
       <audio> element it owns lives above the <Outlet /> so react-router
       route changes do NOT unmount it. Starting playback on the homepage
       and navigating to /about keeps the song playing without a restart,
       which is the founder-approved behaviour. The <VandeMataramButton>
       is rendered once near the FaqAssistant / MobileTabBar so the user
       can control audio from every public page. */
    <VandeMataramProvider>
      <div className={`site-theme-shell site-theme-${routeTheme} relative min-h-screen bg-[var(--ipf-ivory)] pb-[var(--ipf-tabbar-h,5rem)] xl:pb-0`} data-route-theme={routeTheme}>
        <a className="ipf-skip" href="#main">
          {t("common.skip")}
        </a>
        <TricolorWaves />
        <ScrollToTop />
        <Header logoSrc={img.logo} />
        <main id="main" className="site-theme-body relative z-10">
          <div className="site-theme-ambient site-theme-ambient--one" aria-hidden="true" />
          <div className="site-theme-ambient site-theme-ambient--two" aria-hidden="true" />
          <Suspense fallback={<PageLoader />}>
            <div className="site-route-content"><Outlet /></div>
          </Suspense>
        </main>
        <Footer />
        <FaqAssistant />
        <VandeMataramButton />
        <MobileTabBar />
      </div>
    </VandeMataramProvider>
  );
}

export function SiteLayout() {
  return (
    <LocaleProvider>
      <MemberProvider>
        <ContentProvider>
          <PageThemeProvider>
            <LayoutShell />
          </PageThemeProvider>
        </ContentProvider>
      </MemberProvider>
    </LocaleProvider>
  );
}
