import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { FaqAssistant } from "../FaqAssistant";
import { TricolorWaves } from "../TricolorWaves";
import { ContentProvider } from "../../cms/ContentProvider";
import { MemberProvider } from "../../cms/MemberProvider";
import { LocaleProvider, useLocale } from "../../i18n/LocaleProvider";
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
      <MobileTabBar />
    </div>
  );
}

export function SiteLayout() {
  return (
    <LocaleProvider>
      <MemberProvider>
        <ContentProvider>
          <LayoutShell />
        </ContentProvider>
      </MemberProvider>
    </LocaleProvider>
  );
}
