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

  useEffect(() => {
    if (pathname !== "/") markMobileIntroPlayed();
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-[var(--ipf-ivory)] pb-20 lg:pb-0">
      <a className="ipf-skip" href="#main">
        {t("common.skip")}
      </a>
      <TricolorWaves />
      <ScrollToTop />
      <Header logoSrc={img.logo} />
      <main id="main" className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
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
