import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { TricolorWaves } from "../TricolorWaves";
import { ContentProvider } from "../../cms/ContentProvider";
import { img } from "../../data/site";
import { markMobileIntroPlayed } from "../../lib/mobileIntro";
import { ScrollToTop } from "./ScrollToTop";
import { PageLoader } from "./PageLoader";

export function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") markMobileIntroPlayed();
  }, [pathname]);
  return (
    <ContentProvider>
    <div className="relative min-h-screen bg-[var(--ipf-ivory)]">
      <a className="ipf-skip" href="#main">
        Skip to main content
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
    </div>
    </ContentProvider>
  );
}
